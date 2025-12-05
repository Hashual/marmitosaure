import { useEffect, useState } from "react";
import Header from "../components/Header";
import RecipeCard from "../components/RecipeCard";
import Pagination from "../components/Pagination";
import LucideSettings from "../assets/LucideSettings";
import { useAtomValue } from "jotai";
import { tokenAtom } from "../atoms/token";
import { useNavigate } from "react-router";
import { getMe, type User } from "../api/auth";

const MOCK_USER_RECIPES = [
  {
    id: "1",
    title: "Tarte au beurre de Québec",
    image: "https://images.unsplash.com/photo-1535920527002-b35e96722eb9?w=400",
    author: "User",
    rating: 4.7,
    prepTime: 45,
    tags: ["Végétarien"],
  },
  {
    id: "2",
    title: "Poutine Traditionnelle",
    image: "https://images.unsplash.com/photo-1585325701165-9e821c8f63e1?w=400",
    author: "User",
    rating: 4.9,
    prepTime: 30,
    tags: ["Facile"],
  },
];

const MOCK_LIKED_RECIPES = [
  {
    id: "3",
    title: "Crêpes Françaises",
    image: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400",
    author: "Marie",
    rating: 4.6,
    prepTime: 20,
    tags: ["Végétarien", "Rapide"],
  },
];

const ITEMS_PER_PAGE = 12;

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"recettes" | "likes">("recettes");
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState<User>();
  const token = useAtomValue(tokenAtom)
  const navigate = useNavigate();

  useEffect(() => {
    void async function () {
      try {
        const user = await getMe();
        setUser(user);
      }
      catch {
        navigate("/login")
      }
    }()
  }, [token])

  const displayedRecipes =
    activeTab === "recettes" ? MOCK_USER_RECIPES : MOCK_LIKED_RECIPES;

  // Pagination calculations
  const totalPages = Math.ceil(displayedRecipes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRecipes = displayedRecipes.slice(startIndex, endIndex);

  // Reset page when changing tabs
  const handleTabChange = (tab: "recettes" | "likes") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Bienvenue, {user?.nom_utilisateur}</h1>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Stats */}
          <div className="flex gap-4">
            <div className="bg-white rounded-lg shadow-md p-6 flex-1 text-center">
              <div className="text-orange-500 mb-2">
                <div className="w-12 h-12 mx-auto bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📝</span>
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{MOCK_USER_RECIPES.length}</div>
              <div className="text-sm text-gray-600">Recettes créées</div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 flex-1 text-center">
              <div className="text-orange-500 mb-2">
                <div className="w-12 h-12 mx-auto bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">❤️</span>
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{MOCK_LIKED_RECIPES.length}</div>
              <div className="text-sm text-gray-600">Recettes aimées</div>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-white rounded-lg shadow-md p-6 relative">
            <button className="absolute top-4 right-4 text-teal-500 hover:text-teal-600">
              <LucideSettings />
            </button>
            <h2 className="text-xl font-semibold mb-4">Mes informations</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Email :</label>
                <div className="mt-1 text-gray-800">{user?.email}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 mb-6 border-b">
          <button
            type="button"
            onClick={() => handleTabChange("recettes")}
            className={`pb-3 text-lg font-semibold transition ${
              activeTab === "recettes"
                ? "text-gray-900 border-b-2 border-teal-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Mes recettes
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("likes")}
            className={`pb-3 text-lg font-semibold transition ${
              activeTab === "likes"
                ? "text-gray-900 border-b-2 border-teal-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Mes likes
          </button>
        </div>

        {/* Recipe Grid with Cards */}
        {displayedRecipes.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {activeTab === "recettes"
                ? "Vous n'avez pas encore créé de recettes"
                : "Vous n'avez pas encore aimé de recettes"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
