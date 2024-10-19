cmake_minimum_required(VERSION 3.12)
project(CylinderApp LANGUAGES CXX)

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Specify the path to vcpkg toolchain file if not passed via command line
if(NOT DEFINED CMAKE_TOOLCHAIN_FILE)
    set(CMAKE_TOOLCHAIN_FILE "C:/Users/sadra/dev/vcpkg/scripts/buildsystems/vcpkg.cmake" CACHE STRING "Vcpkg toolchain file")
endif()

# Find OpenGL
find_package(OpenGL REQUIRED)

# Set the absolute path for Eigen3
set(EIGEN3_INCLUDE_DIR "C:/Users/sadra/dev/vcpkg/packages/eigen3_x64-windows/include/eigen3")
set(LIBIGL_INCLUDE_DIR "C:/Users/sadra/dev/vcpkg/packages/libigl_x64-windows/include")

# Add include directories
include_directories(${EIGEN3_INCLUDE_DIR})
include_directories(${LIBIGL_INCLUDE_DIR})

# Find GLFW
find_package(glfw3 CONFIG REQUIRED)

# Include directories (handled by CMake targets)

# Source files
file(GLOB_RECURSE SOURCES "src/*.cpp" "src/*.h")

# Create executable
add_executable(${PROJECT_NAME} ${SOURCES})

# Link libraries
target_link_libraries(${PROJECT_NAME} PRIVATE
    OpenGL::GL
    Eigen3::Eigen
    igl::core
    igl::opengl
    igl::opengl_glfw
    igl::viewer
    glfw
)
