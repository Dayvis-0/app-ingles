import { useAuth } from "./context/AuthContext";
import LoginView from "./components/LoginView";

/**
 * Login flow scaffold for Sprint (HU01): shows the login screen until a
 * session exists, then a minimal temporary session card. The role-based
 * redirect / protected routes are a separate teammate task and will replace
 * this card.
 */
function App() {
  const { user, role, logout } = useAuth();

  if (!user) {
    return <LoginView />;
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <section className="w-full max-w-md bg-white duo-card p-8 shadow-xl flex flex-col items-center gap-3 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
          Sesión iniciada
        </div>
        <h1 className="text-2xl font-black tracking-tight text-[#3c3c3c]">
          {user.nombreCompleto}
        </h1>
        <p className="text-sm font-bold text-[#afafaf]">@{user.nombreUsuario}</p>
        <span className="bg-emerald-100 text-emerald-800 rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest">
          {role}
        </span>
        <button
          type="button"
          onClick={logout}
          className="mt-3 w-full py-3 font-black rounded-xl tracking-wider cursor-pointer btn-3d-green"
        >
          CERRAR SESIÓN
        </button>
      </section>
    </main>
  );
}

export default App;
