import { Link } from "react-router-dom";
import type { Recipe } from "../types/Recipe";

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const prepTimeMinutes = parseInt(recipe.preparation_time) || 0;
  
  const validTags = recipe.tags.filter(tag => tag && tag.trim() !== '');
  
  return (
    <Link
      to={`/recipe/${recipe._id}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={"http://localhost:5000/images"+recipe.image_url}
          alt={recipe.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        {validTags.length > 0 && (
          <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
            {validTags.slice(0, 2).map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className="px-2 py-1 bg-teal-400 text-white text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          {recipe.title}
        </h3>

        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <span>Par {recipe.author_id}</span>
        </div>

        <div className="flex items-center justify-between">
          {/* Origin */}
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
              {recipe.origin}
            </span>
          </div>

          {/* Prep time */}
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{recipe.preparation_time}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
