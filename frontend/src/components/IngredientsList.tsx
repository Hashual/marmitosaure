import { useState } from "react";
import type { KeyboardEvent } from "react";

interface IngredientsListProps {
  ingredients: string[];
  onIngredientsChange: (ingredients: string[]) => void;
}

export default function IngredientsList({
  ingredients,
  onIngredientsChange,
}: IngredientsListProps) {
  const [ingredientInput, setIngredientInput] = useState("");
  const [stepInput, setStepInput] = useState("");

  const handleAddIngredient = () => {
    if (ingredientInput.trim()) {
      onIngredientsChange([...ingredients, ingredientInput.trim()]);
      setIngredientInput("");
    }
  };

  const handleIngredientKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddIngredient();
    }
  };

  const handleRemoveIngredient = (index: number) => {
    onIngredientsChange(ingredients.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-gray-600 font-medium mb-4">Ingredients:</h3>
        <div className="space-y-2">
          {ingredients.map((ingredient, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded"
            >
              <span className="text-sm text-gray-700">{ingredient}</span>
              <button
                type="button"
                onClick={() => handleRemoveIngredient(index)}
                className="text-red-400 hover:text-red-600 text-sm"
              >
                ×
              </button>
            </div>
          ))}
          <input
            type="text"
            value={ingredientInput}
            onChange={(e) => setIngredientInput(e.target.value)}
            onKeyPress={handleIngredientKeyPress}
            placeholder="Ajouter un ingrédient..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-teal-400"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-gray-600 font-medium mb-4">Qtés:</h3>
        <div className="space-y-2">
          <input
            type="text"
            value={stepInput}
            onChange={(e) => setStepInput(e.target.value)}
            placeholder="Ex: 4 personnes..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-teal-400"
          />
        </div>
      </div>
    </div>
  );
}
