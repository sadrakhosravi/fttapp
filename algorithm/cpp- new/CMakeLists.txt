cmake_minimum_required(VERSION 3.29)
project(cpp__new)

set(CMAKE_CXX_STANDARD 20)

# Find OpenGL
find_package(OpenGL REQUIRED)

# Set the absolute path for Eigen3
set(EIGEN3_INCLUDE_DIR "C:/Users/sadra/dev/vcpkg/packages/eigen3_x64-windows/include/eigen3")
set(LIBIGL_INCLUDE_DIR "C:/Users/sadra/dev/vcpkg/packages/libigl_x64-windows/include")

# Add include directories
include_directories(${EIGEN3_INCLUDE_DIR})
include_directories(${LIBIGL_INCLUDE_DIR})

add_executable(cpp__new main.cpp
        ThroatUnwrap.cpp)
