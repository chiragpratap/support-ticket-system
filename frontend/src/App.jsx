 
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { useSelector } from "react-redux";

import Login from "./pages/logIn";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import ProtectedRoute from "./components/ProtectedRoute";
import SocketManager from "./components/SocketManager";
 
   

function AppRoutes() {
  const { user } = useSelector((state) => state.auth);

  return (
    <>
      <SocketManager />

      <Routes>
        <Route
          path="/"
          element={
            <Navigate
              to={user ? "/dashboard" : "/login"}
              replace
            />
          }
        />

        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login />
            )
          }
        />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />
        </Route>

        <Route
          element={
            <ProtectedRoute allowedRoles={["admin"]} />
          }
        >
          <Route path="/admin" element={<Admin />} />
        </Route>

        <Route
          path="*"
          element={
            <Navigate
              to={user ? "/dashboard" : "/login"}
              replace
            />
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
