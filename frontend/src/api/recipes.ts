import { HOST } from "./constants";
import type { Recipe } from "../types/recipe";

export interface RecipesResponse {
  data: Recipe[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

export async function fetchRecipes(page: number = 1): Promise<RecipesResponse> {
  try {
    const url = page === 1 ? `${HOST}/recipes` : `${HOST}/recipes?page=${page}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json() as RecipesResponse;
    
    return data;
  } catch (error) {
    console.error("Error fetching recipes:", error);
    throw error;
  }
}
