import { Suspense, useEffect, useState } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/home";
import Login from "./components/Login";
import { isAuthenticated } from "./services/auth";
import routes from "tempo-routes";

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const auth = isAuthenticated();
  return auth ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check authentication status when component mounts
    setChecking(false);
  }, []);

  if (checking) {
    return <p>Loading...</p>;
  }

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </>
    </Suspense>
  );
}

export default App;
