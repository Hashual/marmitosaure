import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../../components/header";
import LoadingMask from "../../components/LoadingMask";

interface Recipe {
  _id: string;
  title: string;
  description: string;
  preparation_time: string;
  steps: string[];
  utensils: {
    name: string;
    type: string;
  }[];
  tags: string[];
  origin: string;
  author_id: string;
  image_url: string;
  creation_date: string;
}

export default function RecipePage() {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch recipe data from API
    const fetchRecipe = async () => {
      try {
        const response = await fetch(`http://localhost:5000/recipes/${id}`);
        const result = await response.json();
        // L'API renvoie { data: [recipe] } donc on prend le premier élément
        if (result.data && result.data.length > 0) {
          setRecipe(result.data[0]);
        } else {
          setRecipe(null);
        }
      } catch (error) {
        console.error("Error fetching recipe:", error);
        setRecipe(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRecipe();
    }
  }, [id]);

  if (loading) {
    return <LoadingMask visible={true} text="Chargement de la recette..." />;
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-500 text-lg">Recette non trouvée</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="bg-white relative min-h-screen w-full flex justify-center">
      <div className="relative w-[1400px] min-h-screen">

      {/* Recipe Image */}
      <div className="absolute left-[200px] top-[100px] w-[350px] h-[350px] rounded-[100px] overflow-hidden shadow-lg z-10">
        <img
          alt={recipe.title}
          className="w-full h-full object-cover"
          src={recipe.image_url || "https://via.placeholder.com/507"}
        />
      </div>

      {/* Recipe Title */}
      <h1 className="absolute left-[800px] top-[200px] -translate-x-1/2 w-[500px] text-[40px] text-center text-black z-10" style={{ fontFamily: 'SF Pro, sans-serif', lineHeight: '1.2' }}>
        {recipe.title}
      </h1>

      {/* Info Section */}
      <div className="absolute left-[600px] top-[320px] w-[500px] min-h-[70px] rounded-[20px] flex flex-col justify-center px-[60px] py-[15px] z-10" style={{ backgroundColor: 'rgba(217, 217, 217, 0.25)' }}>
        <p className="text-[16px] text-black" style={{ fontFamily: 'SF Pro, sans-serif' }}>
          Origine : <span className="text-[#ff754d] underline">{recipe.origin}</span>
        </p>
        <p className="text-[16px] text-black" style={{ fontFamily: 'SF Pro, sans-serif' }}>
          le : {formatDate(recipe.creation_date)}
        </p>
      </div>

      {/* Utensils Section */}
      <div className="absolute left-[200px] top-[480px] w-[350px] min-h-[250px] rounded-[20px] p-[35px] z-10" style={{ backgroundColor: 'rgba(217, 217, 217, 0.25)' }}>
        <h2 className="text-[28px] text-black mb-[15px]" style={{ fontFamily: 'SF Pro, sans-serif' }}>
          Ustensiles
        </h2>
        {recipe.utensils && recipe.utensils.length > 0 ? (
          <ul className="text-[18px] text-black list-disc pl-[30px] space-y-[3px]" style={{ fontFamily: 'SF Pro, sans-serif' }}>
            {recipe.utensils.map((utensil, index) => (
              <li key={index}>{utensil.name}</li>
            ))}
          </ul>
        ) : (
          <p className="text-[16px] text-gray-500" style={{ fontFamily: 'SF Pro, sans-serif' }}>
            Aucun ustensile spécifié
          </p>
        )}
        <h2 className="text-[28px] text-black mb-[15px] mt-[30px]" style={{ fontFamily: 'SF Pro, sans-serif' }}>
          Temps: {recipe.preparation_time}
        </h2>
      </div>

      {/* Steps Section */}
      <div className="absolute left-[600px] top-[480px] w-[500px] min-h-[500px] text-[18px] text-black z-10" style={{ fontFamily: 'SF Pro, sans-serif' }}>
        {recipe.steps && recipe.steps.length > 0 ? (
          recipe.steps.map((step, index) => (
            <div key={index} className="mb-[20px]">
              <p className="font-bold mb-[8px]">Étape {index + 1}</p>
              <p className="leading-normal whitespace-pre-wrap">{step}</p>
            </div>
          ))
        ) : (
          <p className="text-[16px] text-gray-500">
            Aucune étape disponible
          </p>
        )}
      </div>

      {/* Tags Section */}
      {recipe.tags && recipe.tags.length > 0 && (
        <div className="absolute left-[200px] top-[800px] w-[350px] z-10">
          <div className="flex flex-wrap gap-[10px]">
            {recipe.tags.map((tag, index) => (
              <span
                key={index}
                className="px-[15px] py-[8px] bg-[#ff754d] text-white rounded-[15px] text-[14px]"
                style={{ fontFamily: 'SF Pro, sans-serif' }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
      
      </div>
    </div>
  );
}
