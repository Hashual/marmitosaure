import type { Ingredient } from "./Ingredient"

export type Recipe = {
  _id: string
  title: string
  description: string
  preparation_time: string
  steps: string[]
  ingredients: Ingredient[]
  ustensils: Ingredient[]
  tags: string[]
  origin: string
  author_id: string
  image_url?: string
  creation_date: Date
}


export type RecipeSearchFilters = {
  title?: string,
  tags?: string[]
  author_id?: string
  maxPreparationTime?: number;
  ingredients?: string[]
}