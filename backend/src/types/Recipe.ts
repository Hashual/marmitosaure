import type { Ingredient } from "./Ingredient"
import type { User } from "./User"

export type Recipe = {
  _id: string
  title: string
  description: string
  preparation_time: string
  steps: string[]
  tags: string[]
  origines: string[]
  author: User
  creation_date: Date
  ingredients: Ingredient[]  
}
