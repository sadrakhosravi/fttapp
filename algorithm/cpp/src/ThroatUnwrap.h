#pragma once
#include <Eigen/Core>
#include <vector>

void CreateCylinderWithCut(double r1, double r2, double h,
                           Eigen::Matrix<double, Eigen::Dynamic, Eigen::Dynamic>& V,
                           Eigen::Matrix<int, Eigen::Dynamic, Eigen::Dynamic>& F,
                           Eigen::Matrix<double, Eigen::Dynamic, Eigen::Dynamic>& P,
                           int circle_res, double cut_angle, bool equidistant,
                           std::vector<int> & edges, std::vector<int> & corrs);
void UnwarpCylinder(Eigen::Matrix<double, Eigen::Dynamic, Eigen::Dynamic>& V,
                    Eigen::Matrix<int, Eigen::Dynamic, Eigen::Dynamic>& F,
                    Eigen::Matrix<double, Eigen::Dynamic, Eigen::Dynamic>& Vuv);
