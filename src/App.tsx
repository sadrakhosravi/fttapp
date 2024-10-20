import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthenticationPage />,
  },
]);

import AuthenticationPage from "./modules/auth/components/view";

function App() {
  return (
    <div className="h-screen w-screen p-2">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
