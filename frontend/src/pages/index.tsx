import { useState, useEffect } from "react";
import RecipeCard from "../components/RecipeCard";
import Filter from "../components/filter";
import Pagination from "../components/Pagination";
import type { FilterGroup } from "../mocks/filters";
import type { Recipe } from "../types/recipe";
import { fetchRecipes } from "../api/recipes";

const ITEMS_PER_PAGE = 12;

export default function Home() {
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Vérifie si des filtres sont actifs
  const hasActiveFilters = filterGroups.some(g => g.items.some(i => i.checked));

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        setLoading(true);
        setError(null);
        // On charge uniquement la page demandée si pas de filtres
        const data = await fetchRecipes(hasActiveFilters ? 1 : currentPage);
        setRecipes(data.recipes);
        setTotalRecipes(data.total);
      } catch (err) {
        setError("Erreur lors du chargement des recettes");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadRecipes();
  }, [currentPage, hasActiveFilters]);

  const handleFilterChange = (groups: FilterGroup[]) => {
    setFilterGroups(groups);
    setCurrentPage(1);
  };

  const filteredRecipes = recipes.filter((recipe) => {
    const regimeGroup = filterGroups.find(g => g.id === 'regime');
    if (regimeGroup) {
      const checkedRegimes = regimeGroup.items.filter(i => i.checked).map(i => i.name);
      if (checkedRegimes.length > 0) {
        return checkedRegimes.some((regime) => recipe.tags.includes(regime));
      }
    }
    return true;
  });
  
  const totalPages = hasActiveFilters 
    ? Math.ceil(filteredRecipes.length / ITEMS_PER_PAGE)
    : Math.ceil(totalRecipes / ITEMS_PER_PAGE);
  
  const currentRecipes = hasActiveFilters
    ? filteredRecipes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
    : recipes;

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
                {hasActiveFilters ? filteredRecipes.length : totalRecipes} recette
                {(hasActiveFilters ? filteredRecipes.length : totalRecipes) > 1 ? "s" : ""} disponible
                {(hasActiveFilters ? filteredRecipes.length : totalRecipes) > 1 ? "s" : ""}
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Chargement des recettes...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500 text-lg">{error}</p>
              </div>
            ) : filteredRecipes.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {currentRecipes.map((recipe) => (
                    <RecipeCard key={recipe._id} recipe={recipe} />
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
