import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

const imgGroup1 = "https://www.figma.com/api/mcp/asset/f912f357-1d3e-485d-bc72-9078d1e678af";
const imgLucidePlus = "https://www.figma.com/api/mcp/asset/67d8e788-2a79-4aa4-b050-1086a2bb9024";
const imgLucideHeart = "https://www.figma.com/api/mcp/asset/b91610f7-fd64-45ca-b632-7efaf04f60d2";
const imgGroup2 = "https://www.figma.com/api/mcp/asset/d2d93cd4-c26f-496d-9314-2e4f2bc396a9";
const imgImage4 = "https://www.figma.com/api/mcp/asset/8bb478b7-370e-4ad4-8905-1b7cd86c3d0e";

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
    <div className="bg-white relative min-h-screen w-full overflow-x-hidden">
      {/* Header */}
      <div className="absolute h-[235px] left-0 top-0 w-full" style={{ background: 'linear-gradient(180deg, #7dd3bd 0%, #ecf9f5 100%)' }}>
        <div className="absolute h-[40px] left-1/2 top-[32px] -translate-x-1/2 w-[1030px]">
          <div className="flex items-center justify-between w-full">
            {/* Logo */}
            <div className="w-[40px] h-[40px]">
              <img alt="Logo" className="w-full h-full object-cover" src={imgImage4} />
            </div>

            {/* Search Bar */}
            <div className="flex items-center gap-[10px] bg-[#ecf9f5] px-[24px] py-[11px] rounded-md w-[400px]">
              <div className="w-[16.5px] h-[16.5px] opacity-75">
                <img alt="Search" className="w-full h-full" src={imgGroup1} />
              </div>
              <input
                type="text"
                placeholder="Commencez à rechercher une recette..."
                className="bg-transparent border-none outline-none text-[#24755d] text-[12px] opacity-75 flex-1"
                style={{ fontFamily: 'Inria Serif, sans-serif' }}
              />
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-[24px]">
              <div className="w-[24px] h-[24px] cursor-pointer">
                <img alt="Plus" className="w-full h-full" src={imgLucidePlus} />
              </div>
              <div className="w-[24px] h-[24px] cursor-pointer">
                <img alt="Heart" className="w-full h-full" src={imgLucideHeart} />
              </div>
              <div className="w-[24px] h-[24px] cursor-pointer">
                <img alt="User" className="w-full h-full" src={imgGroup2} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recipe Image */}
      <div className="absolute left-[270px] top-[122px] w-[507px] h-[507px] rounded-[140px] border-2 border-white/25 overflow-hidden">
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
