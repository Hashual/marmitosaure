import { useState } from "react";
import Header from "../components/Header";
import RecipeCard from "../components/RecipeCard";
import Filter from "../components/Filter";
import type { FilterGroup } from "../mocks/filters";

const MOCK_RECIPES = [
  {
    id: "1",
    title: "Pâtes Carbonara Authentiques",
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400",
    author: "Mario",
    rating: 4.5,
    prepTime: 30,
    tags: ["Facile", "Rapide"],
  },
  {
    id: "2",
    title: "Salade César Fraîche",
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400",
    author: "Julie",
    rating: 4.2,
    prepTime: 15,
    tags: ["Végétarien", "Rapide"],
  },
  {
    id: "3",
    title: "Curry de Légumes Indien",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400",
    author: "Raj",
    rating: 4.8,
    prepTime: 45,
    tags: ["Vegan", "Sans gluten"],
  },
  {
    id: "4",
    title: "Tarte aux Pommes Maison",
    image: "https://images.unsplash.com/photo-1535920527002-b35e96722eb9?w=400",
    author: "Sophie",
    rating: 4.6,
    prepTime: 60,
    tags: ["Végétarien"],
  },
  {
    id: "5",
    title: "Sushi Rolls Maison",
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400",
    author: "Yuki",
    rating: 4.9,
    prepTime: 50,
    tags: ["Sans gluten"],
  },
  {
    id: "6",
    title: "Burger Végétarien",
    image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400",
    author: "Alex",
    rating: 4.3,
    prepTime: 25,
    tags: ["Végétarien", "Facile"],
  },
];

export default function Home() {
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([]);

  const handleFilterChange = (groups: FilterGroup[]) => {
    setFilterGroups(groups);
  };

  const filteredRecipes = MOCK_RECIPES.filter((recipe) => {
    const regimeGroup = filterGroups.find(g => g.id === 'regime');
    if (regimeGroup) {
      const checkedRegimes = regimeGroup.items.filter(i => i.checked).map(i => i.name);
      if (checkedRegimes.length > 0) {
        return checkedRegimes.some((regime) => recipe.tags.includes(regime));
      }
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <Filter onChange={handleFilterChange} />
          </aside>

            <div className="lg:col-span-3">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800">
                Découvrez nos recettes
              </h1>
              <p className="text-gray-600 mt-2">
                {filteredRecipes.length} recette
                {filteredRecipes.length > 1 ? "s" : ""} disponible
                {filteredRecipes.length > 1 ? "s" : ""}
              </p>
            </div>

            {filteredRecipes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  Aucune recette ne correspond à vos critères
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
