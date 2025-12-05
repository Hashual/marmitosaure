import { useState } from "react";
import LucideHeart from "../assets/LucideHeart";
import LucideSettings from "../assets/LucideSettings";



export default function ProfileDisplay() {
  const [activeTab, setActiveTab] = useState<'recettes' | 'likes'>('recettes');

  const recipes = Array(12).fill({
    title: 'Tarte au beurre de Québec',
    likes: 10
  });

  const likedRecipes = Array(4).fill({
    title: 'Tarte au beurre de Québec',
    likes: 10
  });

  return (
    <div className="min-h-screen bg-white">  
      

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Welcome Section */}
        <h1 className="text-3xl font-serif mb-8">Bienvenue, User</h1>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Stats */}
          <div className="flex gap-4">
            <div className="bg-gray-100 rounded-lg p-6 flex-1 text-center">
              <div className="text-orange-500 mb-2">
                <div className="w-12 h-12 mx-auto bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📝</span>
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">12</div>
              <div className="text-sm text-gray-600">Recettes créées</div>
            </div>

            <div className="bg-gray-100 rounded-lg p-6 flex-1 text-center">
              <div className="text-orange-500 mb-2">
                <div className="w-12 h-12 mx-auto bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">51</div>
              <div className="text-sm text-gray-600">Recettes réalisées</div>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-gray-100 rounded-lg p-6 relative">
            <button className="absolute top-4 right-4 text-emerald-500 hover:text-emerald-600">
            <LucideSettings/>
            </button>
            <h2 className="text-xl font-semibold mb-4">Mes informations</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Nom :</label>
                <div className="mt-1 text-gray-800"></div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Email :</label>
                <div className="mt-1 text-gray-800"></div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Prénom :</label>
                <div className="mt-1 text-gray-800"></div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Tél :</label>
                <div className="mt-1 text-gray-800"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 mb-6 border-b">
          <button
            type="button"
            onClick={() => setActiveTab('recettes')}
            className={`pb-3 text-lg font-semibold transition ${
              activeTab === 'recettes'
                ? 'text-gray-900 border-b-2 border-emerald-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Mes recettes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('likes')}
            className={`pb-3 text-lg font-semibold transition ${
              activeTab === 'likes'
                ? 'text-gray-900 border-b-2 border-emerald-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Mes likes
          </button>
        </div>

        {/* Recipe Grid */}
        <div className="relative">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {(activeTab === 'recettes' ? recipes : likedRecipes).map((recipe, idx) => (
              <div key={idx} className="group cursor-pointer">
                <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-2 relative">
                  <img
                    src=""
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
                </div>
                <h3 className="text-sm font-medium mb-1 line-clamp-2">{recipe.title}</h3>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <LucideHeart />
                  <span>{recipe.likes}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
