import { useState } from "react";
import type { FormEvent } from "react";
import ImageUpload from "./ImageUpload";
import TextEditor from "./TextEditor";
import IngredientsList from "./IngredientsList";
import StepsList from "./StepsList";
import RecipeMetadata from "./RecipeMetadata";

export default function RecipeEditor() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [steps, setSteps] = useState<string[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [origin, setOrigin] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Recipe data:", {
      title,
      description,
      ingredients,
      steps,
      image,
      prepTime,
      cookTime,
      tags,
      origin,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <ImageUpload image={image} onImageChange={setImage} />

            <IngredientsList
              ingredients={ingredients}
              onIngredientsChange={setIngredients}
            />

            <RecipeMetadata
              prepTime={prepTime}
              cookTime={cookTime}
              tags={tags}
              origin={origin}
              onPrepTimeChange={setPrepTime}
              onCookTimeChange={setCookTime}
              onTagsChange={setTags}
              onOriginChange={setOrigin}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-teal-400 hover:bg-teal-500 text-white px-6 py-2.5 rounded-md flex items-center gap-2 transition-colors font-medium"
              >
                Publier
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>

            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre"
                className="w-full text-4xl font-light text-gray-400 placeholder-gray-300 border-none focus:outline-none focus:ring-0 bg-transparent"
                required
              />
            </div>

            <TextEditor value={description} onChange={setDescription} />

            <StepsList steps={steps} onStepsChange={setSteps} />
          </div>
        </div>
      </form>
    </div>
  );
}
