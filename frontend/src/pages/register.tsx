import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSetAtom } from "jotai";
import { tokenAtom } from "../atoms/token";
import { register } from "../api/auth";

export default function RegisterPage() {
    const navigate = useNavigate();
    const setToken = useSetAtom(tokenAtom);

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!username || !email || !password) {
            setError("Veuillez remplir tous les champs.");
            return;
        }
        if (password !== confirm) {
            setError("Les mots de passe sont différents.");
            return;
        }

        try {
            await register(username, email, password);
            alert("Inscription réussie ! Vous pouvez maintenant vous connecter.");
            navigate("/login");
        } catch (err: any) {
            setError("Erreur lors de l'inscription : " + err.message);
            return;
        }

    // navigate("/profile");
};

return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-teal-400 text-white px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Créer un compte</h2>
                <button
                    onClick={() => navigate(-1)}
                    className="text-white hover:text-gray-200 text-2xl leading-none"
                    aria-label="Fermer"
                >
                    x
                </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-8">
                {error && (
                    <div className="mb-4 text-sm text-red-600">{error}</div>
                )}

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2">Identifiant</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
                        placeholder="mingo87"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
                        placeholder="unemail@gmail.com"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2">Mot de passe</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
                        placeholder="••••••••••••"
                        required
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-medium mb-2">Confirmer le mot de passe</label>
                    <input
                        type="password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
                        placeholder="••••••••••••"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-gray-800 text-white py-3 rounded-md hover:bg-gray-700 transition-colors font-medium"
                >
                    Créer un compte
                </button>

                <div className="mt-4 text-center text-sm">
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="text-gray-700 hover:text-teal-500 font-medium"
                    >
                        Déjà un compte ? Se connecter
                    </button>
                </div>
            </form>
        </div>
    </div>
);
}
