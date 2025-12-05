import { useState } from "react";
import RecipeCard from "../components/RecipeCard";
import Filter from "../components/Filter";
import Pagination from "../components/Pagination";
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
  {
    id: "7",
    title: "Pizza Margherita",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400",
    author: "Giuseppe",
    rating: 4.7,
    prepTime: 35,
    tags: ["Végétarien"],
  },
  {
    id: "8",
    title: "Pad Thai",
    image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400",
    author: "Somchai",
    rating: 4.4,
    prepTime: 30,
    tags: ["Rapide"],
  },
  {
    id: "9",
    title: "Lasagnes Bolognaise",
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400",
    author: "Maria",
    rating: 4.8,
    prepTime: 90,
    tags: ["Facile"],
  },
  {
    id: "10",
    title: "Ramen Végétarien",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400",
    author: "Takeshi",
    rating: 4.6,
    prepTime: 40,
    tags: ["Végétarien"],
  },
  {
    id: "11",
    title: "Tacos au Poulet",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400",
    author: "Carlos",
    rating: 4.5,
    prepTime: 25,
    tags: ["Rapide", "Facile"],
  },
  {
    id: "12",
    title: "Quiche Lorraine",
    image: "https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=400",
    author: "Pierre",
    rating: 4.3,
    prepTime: 55,
    tags: ["Végétarien"],
  },
  {
    id: "13",
    title: "Soupe Miso",
    image: "https://images.unsplash.com/photo-1560717799-c4a1dfe8e19c?w=400",
    author: "Yuki",
    rating: 4.1,
    prepTime: 15,
    tags: ["Vegan", "Rapide"],
  },
  {
    id: "14",
    title: "Couscous Royal",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400",
    author: "Fatima",
    rating: 4.9,
    prepTime: 75,
    tags: ["Sans gluten"],
  },
  {
    id: "15",
    title: "Risotto aux Champignons",
    image: "https://images.unsplash.com/photo-1476124369491-f3c5e82e5526?w=400",
    author: "Antonio",
    rating: 4.7,
    prepTime: 40,
    tags: ["Végétarien"],
  },
  {
    id: "16",
    title: "Fajitas Végétariennes",
    image: "https://images.unsplash.com/photo-1599974789516-25592e4e3ee9?w=400",
    author: "Rosa",
    rating: 4.4,
    prepTime: 30,
    tags: ["Végétarien", "Rapide"],
  },
  {
    id: "17",
    title: "Bouillon de Pho",
    image: "https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=400",
    author: "Linh",
    rating: 4.8,
    prepTime: 120,
    tags: ["Sans gluten"],
  },
  {
    id: "18",
    title: "Pancakes Américains",
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400",
    author: "Sarah",
    rating: 4.6,
    prepTime: 20,
    tags: ["Végétarien", "Facile"],
  },
  {
    id: "19",
    title: "Bruschetta Italienne",
    image: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400",
    author: "Marco",
    rating: 4.2,
    prepTime: 15,
    tags: ["Vegan", "Rapide"],
  },
  {
    id: "20",
    title: "Chili Con Carne",
    image: "https://images.unsplash.com/photo-1525059696034-4967a729f0b5?w=400",
    author: "Juan",
    rating: 4.7,
    prepTime: 60,
    tags: ["Sans gluten"],
  },
  {
    id: "21",
    title: "Smoothie Bowl Tropical",
    image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400",
    author: "Emma",
    rating: 4.5,
    prepTime: 10,
    tags: ["Vegan", "Rapide", "Facile"],
  },
  {
    id: "22",
    title: "Moussaka Grecque",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400",
    author: "Nikos",
    rating: 4.8,
    prepTime: 80,
    tags: ["Sans gluten"],
  },
  {
    id: "23",
    title: "Croque-Monsieur",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400",
    author: "Jacques",
    rating: 4.3,
    prepTime: 20,
    tags: ["Rapide", "Facile"],
  },
  {
    id: "24",
    title: "Bibimbap Coréen",
    image: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=400",
    author: "Min-jun",
    rating: 4.6,
    prepTime: 45,
    tags: ["Sans gluten"],
  },
  {
    id: "25",
    title: "Gaufres Belges",
    image: "https://images.unsplash.com/photo-1568051243858-533a607809a5?w=400",
    author: "Léa",
    rating: 4.5,
    prepTime: 25,
    tags: ["Végétarien", "Facile"],
  },
];

const ITEMS_PER_PAGE = 9;

export default function Home() {
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const handleFilterChange = (groups: FilterGroup[]) => {
    setFilterGroups(groups);
    setCurrentPage(1);
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

  
  const totalPages = Math.ceil(filteredRecipes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRecipes = filteredRecipes.slice(startIndex, endIndex);

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
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
