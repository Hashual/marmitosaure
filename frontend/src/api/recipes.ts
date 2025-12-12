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

export interface CreateRecipeData {
  title: string;
  description: string;
  preparation_time: string;
  origin: string;
  steps: string[];
  ingredients: { quantity: string; name: string; type: string }[];
  utensils: { name: string; type: string }[];
  tags: string[];
  image?: File;
}

export async function createRecipe(data: CreateRecipeData, token: string): Promise<Recipe> {
  try {
    const formData = new FormData();
    
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('preparation_time', data.preparation_time);
    formData.append('origin', data.origin);
    formData.append('steps', JSON.stringify(data.steps));
    formData.append('ingredients', JSON.stringify(data.ingredients));
    formData.append('utensils', JSON.stringify(data.utensils));
    formData.append('tags', JSON.stringify(data.tags));
    
    if (data.image) {
      formData.append('image', data.image);
    }
    
    const response = await fetch(`${HOST}/recipes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error creating recipe:', error);
    throw error;
  }
}

export async function fetchUserRecipes(userId: string): Promise<Recipe[]> {
  try {
    const response = await fetch(`${HOST}/recipes?author_id=${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json() as RecipesResponse;
    return data.data;
  } catch (error) {
    console.error('Error fetching user recipes:', error);
    throw error;
  }
}
