import { HOST } from "./constants";
import type { Recipe } from "../types/Recipe";

export interface RecipesResponse {
  recipes: Recipe[];
  total: number;
  page: number;
  limit: number;
}

export async function fetchRecipes(page: number = 1): Promise<RecipesResponse> {
  try {
    const url = page === 1 ? `${HOST}/recipes` : `${HOST}/recipes?page=${page}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Si l'API renvoie directement un tableau (ancienne version), on le transforme
    if (Array.isArray(data)) {
      return {
        recipes: data,
        total: data.length,
        page: page,
        limit: 12
      };
    }
    
    // L'API renvoie maintenant { recipes, total, page, limit }
    return data;
  } catch (error) {
    console.error("Error fetching recipes:", error);
    throw error;
  }
}
