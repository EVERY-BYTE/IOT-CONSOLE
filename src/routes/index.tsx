import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DashboardView from "../pages/Dashboard";
import LoginView from "../pages/Login";
import AppLayout from "../layouts/AppLayout";
import AuthLayout from "../layouts/AuthLayout";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import ErrorPage from "../pages/404";
import ProfileView from "../pages/profile/Index";

export default function AppRouters() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  console.log("____is authenticated");
  console.log(isAuthenticated);

  const routers: { path: string; element: JSX.Element }[] = [];
  const authRouters: { path: string; element: JSX.Element }[] = [
    {
      path: "/",
      element: <LoginView />,
    },
    {
      path: "/login",
      element: <LoginView />,
    },
  ];

  const mainRouters: { path: string; element: JSX.Element }[] = [
    {
      path: "/",
      element: <DashboardView />,
    },
    {
      path: "/my-profile",
      element: <ProfileView />,
    },
  ];

  if (isAuthenticated) {
    routers.push(...mainRouters);
  } else {
    routers.push(...authRouters);
  }

  console.log(routers);

  const appRouters = createBrowserRouter([
    {
      path: "/",
      element: isAuthenticated ? <AppLayout /> : <AuthLayout />,
      errorElement: <ErrorPage />,
      children: routers,
    },
  ]);

  return <RouterProvider router={appRouters} />;
}
