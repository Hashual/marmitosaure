import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../../components/Header";

interface Recipe {
  _id: string;
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  author: {
    _id: string;
    username: string;
  };
  date_creation: string;
  imageUrl?: string;
}

export default function RecipePage() {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch recipe data from API
    const fetchRecipe = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/recipes/${id}`);
        const data = await response.json();
        setRecipe(data);
      } catch (error) {
        console.error("Error fetching recipe:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRecipe();
    }
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  if (!recipe) {
    return <div className="flex items-center justify-center h-screen">Recette non trouvée</div>;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="bg-white relative min-h-screen w-full">
      <Header />

      {/* Recipe Image */}
      <div className="absolute left-[270px] top-[122px] w-[507px] h-[507px] rounded-[140px] border-2 border-white/25 overflow-hidden shadow-lg">
        <img
          alt={recipe.title}
          className="w-full h-full object-cover"
          src={recipe.imageUrl || "https://via.placeholder.com/507"}
        />
      </div>

      {/* Recipe Title */}
      <h1 className="absolute left-[1150px] top-[281px] -translate-x-1/2 w-[1252px] text-[96px] text-center text-black whitespace-pre-wrap" style={{ fontFamily: 'SF Pro, sans-serif' }}>
        {recipe.title}
      </h1>

      {/* Author and Date Info */}
      <div className="absolute left-[819px] top-[419px] w-[663px] h-[92px] rounded-[25px] flex flex-col justify-center px-[80px]" style={{ backgroundColor: 'rgba(217, 217, 217, 0.25)' }}>
        <p className="text-[20px] text-black" style={{ fontFamily: 'SF Pro, sans-serif' }}>
          Posté par : <span className="text-[#ff754d] underline">{recipe.author.username}</span>
        </p>
        <p className="text-[20px] text-black" style={{ fontFamily: 'SF Pro, sans-serif' }}>
          le : {formatDate(recipe.date_creation)}
        </p>
      </div>

      {/* Ingredients Section */}
      <div className="absolute left-[281px] top-[680px] w-[486px] min-h-[341px] rounded-[25px] p-[50px]" style={{ backgroundColor: 'rgba(217, 217, 217, 0.25)' }}>
        <h2 className="text-[40px] text-black mb-[20px]" style={{ fontFamily: 'SF Pro, sans-serif' }}>
          Ingredients: {recipe.ingredients.length} pers
        </h2>
        <ul className="text-[25px] text-black list-disc pl-[37.5px] space-y-[5px]" style={{ fontFamily: 'SF Pro, sans-serif' }}>
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index}>{ingredient}</li>
          ))}
        </ul>
      </div>

      {/* Steps Section */}
      <div className="absolute left-[822px] top-[679px] w-[660px] min-h-[706px] text-[25px] text-black" style={{ fontFamily: 'SF Pro, sans-serif' }}>
        {recipe.steps.map((step, index) => (
          <div key={index} className="mb-[30px]">
            <p className="font-bold mb-[10px]">Étape {index + 1}</p>
            <p className="leading-normal whitespace-pre-wrap">{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
