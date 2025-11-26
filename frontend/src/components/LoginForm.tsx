import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Login attempt:", { username, password, rememberMe });
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-teal-400 text-white px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Connexion</h2>
        <button
          onClick={() => navigate("/")}
          className="text-white hover:text-gray-200 text-2xl leading-none"
          aria-label="Fermer"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-8">
        <div className="mb-6">
          <label
            htmlFor="username"
            className="block text-gray-700 text-sm font-medium mb-2"
          >
            Identifiant
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
            placeholder="mingo87"
            required
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-gray-700 text-sm font-medium mb-2"
          >
            Mot de passe
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
            placeholder="••••••••••••••••••••"
            required
          />
        </div>

        <div className="mb-6">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-teal-400 border-gray-300 rounded focus:ring-teal-400"
            />
            <span className="ml-2 text-gray-700 text-sm">
              Se souvenir de moi
            </span>
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-gray-800 text-white py-3 rounded-md hover:bg-gray-700 transition-colors font-medium"
        >
          Se connecter
        </button>

        <div className="mt-4 text-center text-sm">
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="text-gray-700 hover:text-teal-500 font-medium"
          >
            Créer un compte
          </button>
          <br />
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="text-gray-600 hover:text-teal-500 text-xs mt-1"
          >
            mot de passe oublié
          </button>
        </div>
      </form>
    </div>
  );
}
