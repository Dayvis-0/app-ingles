import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoginView from "./components/LoginView";
import DocenteView from "./components/DocenteView";
import EstudianteView from "./components/EstudianteView";
import { EstudianteLeccionView } from "./components/estudiante";
import ProtectedRoute from "./components/ProtectedRoute";

function LoginRedirect() {
  const { user, role } = useAuth();

  if (!user) {
    return <LoginView />;
  }

  if (role === "docente") {
    return <Navigate to="/docente" replace />;
  }

  if (role === "estudiante") {
    return <Navigate to="/estudiante" replace />;
  }

  return <LoginView />;
}

function RootRedirect() {
  const { user, role } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role === "docente") {
    return <Navigate to="/docente" replace />;
  }

  if (role === "estudiante") {
    return <Navigate to="/estudiante" replace />;
  }

  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginRedirect />} />

        <Route element={<ProtectedRoute allowedRoles={["docente"]} />}>
          <Route path="/docente" element={<DocenteView />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["estudiante"]} />}>
          <Route path="/estudiante" element={<EstudianteView />} />
          <Route
            path="/estudiante/leccion/:idLeccion"
            element={<EstudianteLeccionView />}
          />
          <Route
            path="/estudiante/leccion/:idLeccion/:etapa"
            element={<EstudianteLeccionView />}
          />
        </Route>

        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
