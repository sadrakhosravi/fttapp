#include <Eigen/Core>
#include <Eigen/Geometry>
#include <Eigen/StdVector>

// #include <igl/viewer/Viewer.h>
#include <igl/per_corner_normals.h>
#include <igl/per_face_normals.h>
#include <igl/unproject.h>
#include <igl/unproject.h>

#include <memory>
#include <algorithm>
#include <cstdlib>
#include <fstream>
#include <filesystem>
namespace fs = std::filesystem;

#include "ThroatUnwrap.h"


Eigen::MatrixXd V, P, Vuv;
Eigen::MatrixXi F;
Eigen::MatrixXd N_face, N; // normals
// igl::viewer::Viewer viewer;
double crease_angle = 20.0;
double r1 = 3; // in cm
double r2 = 1.5; // in cm
double h = 5;
double cir_res = 100;
double cut_angle_step = M_PI / 256;
double cut_angle = M_PI / 4;
bool showpoints = false;
bool showembedding = false;
bool init_show_wireframe = false;
bool equidistant = false;

// void MeshUpdate()
// {
//     // Nice normals with sharp creases
//     igl::per_corner_normals(V,F,crease_angle,N);
//     igl::per_face_normals(V,F,N_face);
//
//
//     // Viewer data
//     viewer.data.clear();
//     if (!showembedding)
//     {
//         viewer.data.set_mesh(V, F);
//     }
//     else
//     {
//         viewer.data.set_mesh(Vuv, F);
//     }
//     viewer.data.set_normals(N);
//     Eigen::MatrixXd C(1,3);
//     C(0,0) = 0.3;  C(0,1) = .3;  C(0,2) = .3;
//     if (showpoints)
//         viewer.data.set_points(P,C);
//
// }

// bool key_down(igl::viewer::Viewer& viewer, unsigned char key, int modifier)
// {
//   switch(key)
//   {
//     case '`':
//     {
//       std::cout<<"Keys:"<<std::endl;
//       std::cout<<"   1/!  - increase/decrease radius 1"<<std::endl;
//       std::cout<<"   2/@  - increase/decrease radius 2"<<std::endl;
//       std::cout<<"   3/#  - increase/decrease height"<<std::endl;
//       std::cout<<"   =/-  - increase/decrease cut angle"<<std::endl;
//       std::cout<<"   [/]  - increase/decrease resolution"<<std::endl;
//       std::cout<<"   p  - show points"<<std::endl;
//       std::cout<<"   q  - show embedding"<<std::endl;
//     }
//     case '1':
//       {
//           r1 += modifier==0 ? 0.1 : -0.1;
//           std::cout<<"r1 = "<<r1<<std::endl;
//         break;
//       }
//     case '2':
//       {
//           r2 += modifier==0 ? 0.1 : -0.1;
//           std::cout<<"r2 = "<<r2<<std::endl;
//           break;
//       }
//       case '3':
//       {
//           h += modifier==0 ? 0.1 : -0.1;
//           std::cout<<"h = "<<h<<std::endl;
//           break;
//       }
//     case '=':
//     case '-':
//       {
//           cut_angle += key=='=' ? cut_angle_step : -cut_angle_step;
//           if (cut_angle >= M_PI/2)
//               cut_angle = M_PI/2 + cut_angle_step;
//           else if (cut_angle <= 0)
//               cut_angle = cut_angle_step;
//           std::cout<<"Angle = "<<(cut_angle/M_PI)<<" pi = "<<(180*cut_angle/M_PI)<<" deg"<<std::endl;
//         break;
//       }
//       case ']':
//       case '[':
//           cir_res += key==']' ? 10 : -10;
//           if (cir_res<10) cir_res = 10;
//           std::cout<<"Resolution: "<<cir_res<<std::endl;
//           break;
//       case 'P':
//       case 'p':
//           showpoints = !showpoints;
//           break;
//       case 'Q':
//       case 'q':
//           showembedding = !showembedding;
//           break;
//       default: return false; break;
//   }
//     std::vector<int> edges, corrs;
//     CreateCylinderWithCut(r1, r2, h, V, F, P, cir_res, cut_angle, equidistant, edges, corrs);
//     UnwarpCylinder(V,F,Vuv);
//     MeshUpdate();
//   return true;
// }
//
// bool mouse_move (igl::viewer::Viewer& viewer, int mouse_x, int mouse_y)
// {
//   return false;
// }
//
//
// bool mouse_up(igl::viewer::Viewer& viewer, int button, int modifier)
// {
//   return false;
// }
//
// bool mouse_down(igl::viewer::Viewer& viewer, int button, int modifier)
// {
//   return false;
// }
//
//
// bool pre_draw(igl::viewer::Viewer & viewer)
// {
//   viewer.data.dirty |= igl::viewer::ViewerData::DIRTY_DIFFUSE | igl::viewer::ViewerData::DIRTY_AMBIENT | igl::viewer::ViewerData::DIRTY_SPECULAR;
//
//   return false;
// }

struct TestParams
{
    double r1;
    double r2;
    double h;
    double cir_res;
    double cut_angle;
    double theta;
    double ch;
    double cr;
    bool equidistant;
};

// TEST FUNCTION ------------------------------------------------------
void test_SampleOnSpiral(const std::string& file_path, TestParams& params)
{
    // Call the function
    Eigen::Vector3d result = SampleOnSpiral(params.r1, params.r2, params.h, params.cut_angle, params.theta,
                                            params.ch, params.cr, params.equidistant);

    // Ensure that the directory exists (C++17 feature)
    std::filesystem::path dir = file_path.substr(0, file_path.find_last_of('/'));
    if (!std::filesystem::exists(dir))
    {
        std::filesystem::create_directories(dir);
    }


    // Save results to a file
    std::ofstream outfile(file_path);
    if (!outfile.is_open())
    {
        std::cerr << "Error: Could not open file " << file_path << " for writing." << std::endl;
        return;
    }

    outfile << "Test Parameters:" << std::endl;
    outfile << "r1: " << params.r1 << std::endl;
    outfile << "r2: " << params.r2 << std::endl;
    outfile << "h: " << params.h << std::endl;
    outfile << "cut_angle: " << params.cut_angle << std::endl;
    outfile << "theta: " << params.theta << std::endl;
    outfile << "equidistant: " << (params.equidistant ? "true" : "false") << std::endl;
    outfile << std::endl;

    outfile << "Outputs:" << std::endl;
    outfile << "ch: " << params.ch << std::endl;
    outfile << "cr: " << params.cr << std::endl;
    outfile << "Result Vector: (" << result.x() << ", " << result.y() << ", " << result.z() << ")" << std::endl;

    outfile.close();
    std::cout << "Test results saved to " << file_path << std::endl;
}

// Main function for testing the app
int main(int argc, char* argv[])
{
    TestParams params = {
        r1 = 1.0,
        r2 = 2.0,
        h = 3.0,
        cir_res = 100,
        cut_angle = M_PI / 4,
        M_PI / 3,
        0.0,
        0.0,
        true
    };
    const std::string file_path = "../results/test_sample_on_spiral_1.txt"; // Specify the relative path
    test_SampleOnSpiral(file_path, params);

    TestParams params2 = {
        r1 = 3.0,
        r2 = 1.0,
        h = 1.2,
        cir_res = 100,
        cut_angle = M_PI / 3,
        M_PI / 4,
        0.0,
        0.0,
        false
    };
    const std::string file_path2 = "../results/test_sample_on_spiral_2.txt"; // Specify the relative path
    test_SampleOnSpiral(file_path2, params2);

    TestParams params3 = {
        r1 = 2.1,
        r2 = 2.0,
        h = 3.0,
        cir_res = 100,
        cut_angle = M_PI / 4,
        M_PI / 3,
        1.2,
        1.5,
        false
    };
    const std::string file_path3 = "../results/test_sample_on_spiral_3.txt"; // Specify the relative path
    test_SampleOnSpiral(file_path3, params3);
}


// Main App
// int main(int argc, char *argv[])
// {
//     std::string outfile = "test.ps";
//     if (argc<6)
//     {
//         std::cout<<"Use: "<<argv[0]<<" circumference1 curcumference2 height cut_angle outputfile "<<std::endl;
//         std::cout<<"     -equidistant -- test this flag"<<std::endl;
//         std::cout<<"     NOTE: all units are centimeters, cut angle is in degrees"<<std::endl;
//     }
//     else
//     {
//         r1 = atof(argv[1])/(2*M_PI);
//         r2 = atof(argv[2])/(2*M_PI);
//         h = atof(argv[3]);
//         cut_angle = atof(argv[4])/180*M_PI;
//         outfile = argv[5];
//
//         for (int i=6; i<argc; i++)
//         {
//             if (strcmp(argv[i], "-equidistant"))
//                 equidistant = true;
//             else
//                 std::cout<<"[WARNING] Unknown command: "<<argv[i]<<std::endl;
//         }
//     }
//     std::vector<int> edges, corrs;
//
//     CreateCylinderWithCut(r1, r2, h, V, F, P, cir_res, cut_angle, equidistant, edges, corrs);
//     UnwarpCylinder(V,F,Vuv);
//
//     int width = 595; //210;
//     int height = 842; //297;
//     double cm2pxw = 10 * width / 210.;
//     double cm2pxh = 10 * height / 297.;
//     double minx = Vuv.col(0).minCoeff();
//     double maxx = Vuv.col(0).maxCoeff();
//     double miny = Vuv.col(1).minCoeff();
//     double maxy = Vuv.col(1).maxCoeff();
//
//     if (maxx-minx>=width || maxy-miny>=height)
//     {
//         std::cout<<"[ERROR] Cannot fit "<<(maxx-minx)<<"x"<<(maxy-miny)<<" cutout ";
//         std::cout<<" on "<<width<<"x"<<height<<" paper "<<std::endl;
//     }
//     else
//     {
//
//         std::ofstream textStream(outfile.c_str());
//         textStream<<"0 0 moveto\n";
//         textStream<<width<<" 0 lineto\n";   // horizontal bar
//         textStream<<width<<" 0 closepath\n";   // horizontal bar
//         textStream<<"0 0 moveto\n";
//         textStream<<0<<" "<<height<<" lineto\n";   // veritcal bar
//         textStream<<0<<" "<<height<<" closepath\n";   // veritcal bar
//
//         double offset = 5;
//         for (int i=0; i<(int)edges.size(); i+=2)
//         {
//             double x0 = (offset+(Vuv(edges[i], 0)-minx)*cm2pxw);
//             double x1 = (offset+(Vuv(edges[i+1], 0)-minx)*cm2pxw);
//             double y0 = (offset+(Vuv(edges[i], 1)-miny)*cm2pxh);
//             double y1 = (offset+(Vuv(edges[i+1], 1)-miny)*cm2pxh);
//             textStream<<x0<<" "<<y0<<" moveto\n";
//             textStream<<x1<<" "<<y1<<" lineto\n";
//             textStream<<x1<<" "<<y1<<" closepath\n";;
//         }
//         textStream<<"0 setlinewidth stroke\n";
//         textStream<<"showpage\n";
//     }
//
//   // viewer.core.background_color(0) = 1.;
//   // viewer.core.background_color(1) = 1.;
//   // viewer.core.background_color(2) = 1.;
//   // viewer.core.show_lines = init_show_wireframe;
//   // viewer.core.show_overlay_depth = false;
//   // viewer.launch();
// }
//
//
