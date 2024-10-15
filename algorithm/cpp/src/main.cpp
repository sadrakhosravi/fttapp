#include <Eigen/Core>
#include <Eigen/Geometry>
#include <Eigen/StdVector>

#include <igl/viewer/Viewer.h>
#include <igl/per_corner_normals.h>
#include <igl/per_face_normals.h>
#include <igl/unproject.h>
#include <igl/unproject.h>

#include <memory>
#include <algorithm>
#include <cstdlib>

#include "ThroatUnwrap.h"


Eigen::MatrixXd V,P,Vuv;
Eigen::MatrixXi F;
Eigen::MatrixXd N_face, N;   // normals
igl::viewer::Viewer viewer;
double crease_angle = 20.0;
double r1 = 3; // in cm
double r2 = 1.5;   // in cm
double h = 5;
double cir_res = 100;
double cut_angle_step = M_PI/256;
double cut_angle = M_PI / 4;
bool showpoints = false;
bool showembedding = false;
bool init_show_wireframe = false;
bool equidistant = false;

void MeshUpdate()
{
    // Nice normals with sharp creases
    igl::per_corner_normals(V,F,crease_angle,N);
    igl::per_face_normals(V,F,N_face);
    
    
    // Viewer data
    viewer.data.clear();
    if (!showembedding)
    {
        viewer.data.set_mesh(V, F);
    }
    else
    {
        viewer.data.set_mesh(Vuv, F);
    }
    viewer.data.set_normals(N);
    Eigen::MatrixXd C(1,3);
    C(0,0) = 0.3;  C(0,1) = .3;  C(0,2) = .3;
    if (showpoints)
        viewer.data.set_points(P,C);
    
}

bool key_down(igl::viewer::Viewer& viewer, unsigned char key, int modifier)
{
  switch(key)
  {
    case '`':
    {
      std::cout<<"Keys:"<<std::endl;
      std::cout<<"   1/!  - increase/decrease radius 1"<<std::endl;
      std::cout<<"   2/@  - increase/decrease radius 2"<<std::endl;
      std::cout<<"   3/#  - increase/decrease height"<<std::endl;
      std::cout<<"   =/-  - increase/decrease cut angle"<<std::endl;
      std::cout<<"   [/]  - increase/decrease resolution"<<std::endl;
      std::cout<<"   p  - show points"<<std::endl;
      std::cout<<"   q  - show embedding"<<std::endl;
    }
    case '1':
      {
          r1 += modifier==0 ? 0.1 : -0.1;
          std::cout<<"r1 = "<<r1<<std::endl;
        break;
      }
    case '2':
      {
          r2 += modifier==0 ? 0.1 : -0.1;
          std::cout<<"r2 = "<<r2<<std::endl;
          break;
      }
      case '3':
      {
          h += modifier==0 ? 0.1 : -0.1;
          std::cout<<"h = "<<h<<std::endl;
          break;
      }
    case '=':
    case '-':
      {
          cut_angle += key=='=' ? cut_angle_step : -cut_angle_step;
          if (cut_angle >= M_PI/2)
              cut_angle = M_PI/2 + cut_angle_step;
          else if (cut_angle <= 0)
              cut_angle = cut_angle_step;
          std::cout<<"Angle = "<<(cut_angle/M_PI)<<" pi = "<<(180*cut_angle/M_PI)<<" deg"<<std::endl;
        break;
      }
      case ']':
      case '[':
          cir_res += key==']' ? 10 : -10;
          if (cir_res<10) cir_res = 10;
          std::cout<<"Resolution: "<<cir_res<<std::endl;
          break;
      case 'P':
      case 'p':
          showpoints = !showpoints;
          break;
      case 'Q':
      case 'q':
          showembedding = !showembedding;
          break;
      default: return false; break;
  }
    std::vector<int> edges, corrs;
    CreateCylinderWithCut(r1, r2, h, V, F, P, cir_res, cut_angle, equidistant, edges, corrs);
    UnwarpCylinder(V,F,Vuv);
    MeshUpdate();
  return true;
}

bool mouse_move (igl::viewer::Viewer& viewer, int mouse_x, int mouse_y)
{
  return false;
}


bool mouse_up(igl::viewer::Viewer& viewer, int button, int modifier)
{
  return false;
}

bool mouse_down(igl::viewer::Viewer& viewer, int button, int modifier)
{
  return false;
}


bool pre_draw(igl::viewer::Viewer & viewer)
{
  viewer.data.dirty |= igl::viewer::ViewerData::DIRTY_DIFFUSE | igl::viewer::ViewerData::DIRTY_AMBIENT | igl::viewer::ViewerData::DIRTY_SPECULAR;

  return false;
}


int main(int argc, char *argv[])
{
  // Viewer callbacks
  viewer.callback_mouse_down = &mouse_down;
  viewer.callback_mouse_up = &mouse_up;
  viewer.callback_mouse_move = &mouse_move;
  viewer.callback_key_down = &key_down;
  viewer.callback_pre_draw = &pre_draw;
  viewer.callback_init = [&](igl::viewer::Viewer& viewer)
  {
    return false;
  };

    std::string outfile = "test.ps";
    if (argc<6)
    {
        std::cout<<"Use: "<<argv[0]<<" circumference1 curcumference2 height cut_angle outputfile "<<std::endl;
        std::cout<<"     -equidistant -- test this flag"<<std::endl;
        std::cout<<"     NOTE: all units are centimeters, cut angle is in degrees"<<std::endl;
    }
    else
    {
        r1 = atof(argv[1])/(2*M_PI);
        r2 = atof(argv[2])/(2*M_PI);
        h = atof(argv[3]);
        cut_angle = atof(argv[4])/180*M_PI;
        outfile = argv[5];
        
        for (int i=6; i<argc; i++)
        {
            if (strcmp(argv[i], "-equidistant"))
                equidistant = true;
            else
                std::cout<<"[WARNING] Unknown command: "<<argv[i]<<std::endl;
        }
    }
    std::vector<int> edges, corrs;
    
    CreateCylinderWithCut(r1, r2, h, V, F, P, cir_res, cut_angle, equidistant, edges, corrs);
    UnwarpCylinder(V,F,Vuv);
    MeshUpdate();
    
    int width = 595; //210;
    int height = 842; //297;
    double cm2pxw = 10 * width / 210.;
    double cm2pxh = 10 * height / 297.;
    double minx = Vuv.col(0).minCoeff();
    double maxx = Vuv.col(0).maxCoeff();
    double miny = Vuv.col(1).minCoeff();
    double maxy = Vuv.col(1).maxCoeff();
    
    if (maxx-minx>=width || maxy-miny>=height)
    {
        std::cout<<"[ERROR] Cannot fit "<<(maxx-minx)<<"x"<<(maxy-miny)<<" cutout ";
        std::cout<<" on "<<width<<"x"<<height<<" paper "<<std::endl;
    }
    else
    {
        
        std::ofstream textStream(outfile.c_str());
        textStream<<"0 0 moveto\n";
        textStream<<width<<" 0 lineto\n";   // horizontal bar
        textStream<<width<<" 0 closepath\n";   // horizontal bar
        textStream<<"0 0 moveto\n";
        textStream<<0<<" "<<height<<" lineto\n";   // veritcal bar
        textStream<<0<<" "<<height<<" closepath\n";   // veritcal bar

        double offset = 5;
        for (int i=0; i<(int)edges.size(); i+=2)
        {
            double x0 = (offset+(Vuv(edges[i], 0)-minx)*cm2pxw);
            double x1 = (offset+(Vuv(edges[i+1], 0)-minx)*cm2pxw);
            double y0 = (offset+(Vuv(edges[i], 1)-miny)*cm2pxh);
            double y1 = (offset+(Vuv(edges[i+1], 1)-miny)*cm2pxh);
            textStream<<x0<<" "<<y0<<" moveto\n";
            textStream<<x1<<" "<<y1<<" lineto\n";
            textStream<<x1<<" "<<y1<<" closepath\n";;
        }
        textStream<<"0 setlinewidth stroke\n";
        textStream<<"showpage\n";
    }
    
  viewer.core.background_color(0) = 1.;
  viewer.core.background_color(1) = 1.;
  viewer.core.background_color(2) = 1.;
  viewer.core.show_lines = init_show_wireframe;
  viewer.core.show_overlay_depth = false;
  viewer.launch();
}


