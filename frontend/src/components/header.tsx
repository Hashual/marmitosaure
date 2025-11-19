import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-gradient-to-b from-teal-300 to-teal-400 relative pb-16">
      {/* Barre verte principale */}
      <div className="px-6 py-3 flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center">
            <img
              src="src/assets/dino.png"
              alt="Logo Marmitosaure"
              className="w-16 h-16"
            />
          </div>
        </Link>

        {/* Barre de recherche */}
        <div className="flex-1 max-w-lg mx-12">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Commencez à rechercher une recette..."
              className="w-full px-4 py-2.5 pl-10 rounded-md bg-white bg-opacity-40 text-gray-700 placeholder-gray-600 placeholder-opacity-80 border border-transparent focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm"
            />
          </div>
        </div>

        {/* Icônes de navigation */}
        <div className="flex items-center gap-5">
          {/* Icône favoris */}
          <Link to="/favorites" className="text-gray-800 hover:text-gray-900 transition-colors">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </Link>

          {/* Icône utilisateur */}
          <Link to="/login" className="text-gray-800 hover:text-gray-900 transition-colors">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </Link>
        </div>
      </div>


    </header>
  );
}