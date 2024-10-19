#include "ThroatUnwrap.h"
#include <Eigen/Core>
#include <vector>
#include <memory>
#include <algorithm>
#include <cstdlib>
#include <iostream>

Eigen::Vector3d SampleOnSpiral(double r1, double r2, double h, double cut_angle,
                               double theta, double& ch, double& cr, bool equidistant)
{
    if (equidistant)
        ch = tan(cut_angle) * theta; // h(theta)
    else
    {
        //solution to first-order ODE (using integrating factor)
        double c1 = -tan(cut_angle) * ((r2 - r1) / h);
        double c2 = tan(cut_angle) * r1;
        ch = c2 / c1 - c2 / c1 * exp(-c1 * theta);
    }

    if (ch < 0)
        ch = 0;
    else if (ch > h)
        ch = h;
    cr = r1 + (r2 - r1) / h * ch; // r(h)

    return Eigen::Vector3d(sin(theta) * cr, ch, cos(theta) * cr);
}

void CreateCylinderWithCut(double r1, double r2, double h,
                           Eigen::Matrix<double, Eigen::Dynamic, Eigen::Dynamic>& V,
                           Eigen::Matrix<int, Eigen::Dynamic, Eigen::Dynamic>& F,
                           Eigen::Matrix<double, Eigen::Dynamic, Eigen::Dynamic>& P,
                           int circle_res, double cut_angle, bool equidistant,
                           std::vector<int>& edges, std::vector<int>& corrs)
{
    if (cut_angle == -1)
    {
        int nvertices = 2 * circle_res;
        int nfaces = 2 * circle_res;
        V = Eigen::Matrix<double, Eigen::Dynamic, Eigen::Dynamic>(nvertices, 3);
        F = Eigen::Matrix<int, Eigen::Dynamic, Eigen::Dynamic>(nfaces, 3);
        for (int i = 0; i < circle_res; i++)
        {
            double theta = i * 2 * M_PI / circle_res;
            V.row(2 * i + 0) = Eigen::Vector3d(r1 * cos(theta), r1 * sin(theta), 0);
            V.row(2 * i + 1) = Eigen::Vector3d(r2 * cos(theta), r2 * sin(theta), h);
            F.row(2 * i + 0) = Eigen::Vector3i(2 * i + 0, 2 * i + 1, 2 * ((i + 1) % circle_res) + 0);
            F.row(2 * i + 1) = Eigen::Vector3i(2 * i + 1, 2 * ((i + 1) % circle_res) + 1,
                                               2 * ((i + 1) % circle_res) + 0);
        }
    }
    else
    {
        std::vector<Eigen::Vector3d> pnts;
        std::vector<Eigen::Vector3d> vertices;
        std::vector<Eigen::Vector3i> faces;
        double theta = -2 * M_PI;
        double ch = 0, cr = 0;
        int maxiter = 1000000;
        int id = 0;
        int last_id = -1;
        double epsilon_h = h / 100;
        while ((last_id < 0 || id < last_id) && maxiter > 0)
        {
            maxiter--;
            Eigen::Vector3d p1 = SampleOnSpiral(r1, r2, h, cut_angle, theta, ch, cr, equidistant);
            if (theta >= 0 && ch < h)
                pnts.push_back(p1);
            vertices.push_back(p1);
            p1(1) += epsilon_h;
            if (ch == h && last_id == -1)
                last_id = id + circle_res;

            // cut
            Eigen::Vector3d p3 = SampleOnSpiral(r1, r2, h, cut_angle, theta + 2 * M_PI, ch, cr, equidistant);
            p3(1) -= epsilon_h;
            vertices.push_back(p3);

            if (last_id < 0)
            {
                edges.push_back(2 * id + 0);
                edges.push_back(2 * (id + 1) + 0);
                edges.push_back(2 * id + 1);
                edges.push_back(2 * (id + 1) + 1);

                // cut
                faces.push_back(Eigen::Vector3i(2 * id + 0, 2 * (id + 1) + 0, 2 * id + 1));
                faces.push_back(Eigen::Vector3i(2 * id + 1, 2 * (id + 1) + 0, 2 * (id + 1) + 1));

                // no cut
                //                faces.push_back(Eigen::Vector3i(id, id+1, id+circle_res));
                //                faces.push_back(Eigen::Vector3i(id+circle_res, id+1, id+circle_res+1));
            }

            id++;
            theta = -2 * M_PI + id * 2 * M_PI / circle_res;
        }
        P = Eigen::MatrixXd(pnts.size(), 3);
        for (int i = 0; i < pnts.size(); i++)
            P.row(i) = pnts[i];
        V = Eigen::MatrixXd(vertices.size(), 3);
        for (int i = 0; i < vertices.size(); i++)
            V.row(i) = vertices[i];

        F = Eigen::MatrixXi::Zero(faces.size() - 1, 3);
        for (int i = 0; i < faces.size() - 1; i++)
        {
            assert(faces[i](0)>=0 && faces[i](0)<V.rows()
                && faces[i](1)>=0 && faces[i](1)<V.rows()
                && faces[i](2)>=0 && faces[i](2)<V.rows());
            F.row(i) = faces[i];
        }
        edges.erase(edges.begin() + edges.size() - 4, edges.end());
    }
}

Eigen::Vector3d Cross(const Eigen::Vector3d& v1, const Eigen::Vector3d& v2)
{
    return Eigen::Vector3d(v1.y() * v2.z() - v1.z() * v2.y(),
                           v1.x() * v2.z() - v1.z() * v2.x(),
                           v1.x() * v2.y() - v1.y() * v2.x());
}

void UnwarpCylinder(Eigen::Matrix<double, Eigen::Dynamic, Eigen::Dynamic>& V,
                    Eigen::Matrix<int, Eigen::Dynamic, Eigen::Dynamic>& F,
                    Eigen::Matrix<double, Eigen::Dynamic, Eigen::Dynamic>& Vuv)
{
    Vuv = Eigen::Matrix<double, Eigen::Dynamic, Eigen::Dynamic>::Zero(V.rows(), 3);
    bool* flattened = new bool[V.rows()];
    for (int i = 0; i < V.rows(); i++)
        flattened[i] = false;

    // estimate plane from the first face
    //Eigen::Vector3d plane_point = V.row(F(0,0));
    Eigen::Vector3d plane_u = (V.row(F(0, 1)) - V.row(F(0, 0))).normalized();
    Eigen::Vector3d vec2 = (V.row(F(0, 2)) - V.row(F(0, 0))).normalized();
    Eigen::Vector3d plane_norm = Cross(plane_u, vec2);
    Eigen::Vector3d plane_v = Cross(plane_u, plane_norm);

    double l1 = (V.row(F(0, 1)) - V.row(F(0, 0))).norm();
    double l2 = (V.row(F(0, 2)) - V.row(F(0, 0))).norm();

    Vuv.row(F(0, 0)) = Eigen::Vector3d(0, 0, 0);
    Vuv.row(F(0, 1)) = Eigen::Vector3d(l1, 0, 0);
    Vuv.row(F(0, 2)) = Eigen::Vector3d(l2 * vec2.dot(plane_u), l2 * vec2.dot(plane_v), 0);

    flattened[F(0, 0)] = true;
    flattened[F(0, 1)] = true;
    flattened[F(0, 2)] = true;

    // for each subsequent face: project vertices / triangles to that plane
    for (int f = 1; f < F.rows(); f++)
    {
        // expect exactly one unflattened
        int nflattened = flattened[F(f, 0)] + flattened[F(f, 1)] + flattened[F(f, 2)];
        //        std::cout<<"Tri("<<f<<"/"<<F.rows()<<") ["<<F(f,0)<<" "<<F(f,1)<<" "<<F(f,2)<<"] "<<std::endl;
        //        std::cout<<"NFlat: "<<nflattened<<std::endl;
        assert(nflattened==2);

        int v1 = 0, v2 = 1, v3 = 2; // flatten v1
        if (!flattened[F(f, 1)])
        {
            v1 = 1;
            v2 = 0;
            v3 = 2;
        }
        else if (!flattened[F(f, 2)])
        {
            v1 = 2;
            v2 = 0;
            v3 = 1;
        }

        // todo: this can be done faster
        int f2_v1 = -1;
        int f2;
        for (f2 = 0; f2 < F.rows(); f2++)
        {
            if ((F(f, v2) == F(f2, 0) || F(f, v2) == F(f2, 1))
                && (F(f, v3) == F(f2, 0) || F(f, v3) == F(f2, 1)))
            {
                f2_v1 = 2;
                break;
            }
            else if ((F(f, v2) == F(f2, 0) || F(f, v2) == F(f2, 2))
                && (F(f, v3) == F(f2, 0) || F(f, v3) == F(f2, 2)))
            {
                f2_v1 = 1;
                break;
            }
            else if ((F(f, v2) == F(f2, 2) || F(f, v2) == F(f2, 1))
                && (F(f, v3) == F(f2, 2) || F(f, v3) == F(f2, 1)))
            {
                f2_v1 = 0;
                break;
            }
        }

        // flatten the remaining point
        Eigen::Vector3d p1 = V.row(F(f, v1));
        Eigen::Vector3d p2 = V.row(F(f, v2));
        Eigen::Vector3d p3 = V.row(F(f, v3));

        Eigen::Vector3d p2_2d = Vuv.row(F(f, v2));
        Eigen::Vector3d p3_2d = Vuv.row(F(f, v3));

        double alpha = acos((p3 - p2).normalized().dot((p1 - p2).normalized()));
        double p12_len = (p1 - p2).norm();
        //double beta = acos((p2-p3).normalized().dot((p1-p3).normalized()));
        Eigen::Vector3d vref = (p3_2d - p2_2d).normalized();
        Eigen::Vector3d vref_norm(vref.y(), -vref.x(), 0);
        Eigen::Vector3d p1_2d = Eigen::Vector3d(cos(alpha) * vref(0) - sin(alpha) * vref(1),
                                                sin(alpha) * vref(0) + cos(alpha) * vref(1), 0);
        bool flip = false;
        if (f2_v1 != -1)
        {
            Eigen::Vector3d pexst = Vuv.row(F(f2, f2_v1));
            if ((p1_2d.dot(vref_norm) >= 0) == ((pexst - p2_2d).dot(vref_norm)) >= 0)
                flip = true;
            //std::cout<<"F("<<f<<"): existing: "<<(pexst-p2_2d).dot(vref_norm)<<std::endl;
        }
        //std::cout<<"F("<<f<<"): new: "<<<<std::endl;
        if (flip)
        {
            alpha *= -1;
            p1_2d = Eigen::Vector3d(cos(alpha) * vref(0) - sin(alpha) * vref(1),
                                    sin(alpha) * vref(0) + cos(alpha) * vref(1), 0);
        }

        flattened[F(f, v1)] = true;
        Vuv.row(F(f, v1)) = p1_2d * p12_len + p2_2d;
    }

    delete [] flattened;
}





