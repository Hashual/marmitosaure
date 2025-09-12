import type { Tag } from "./Tag"
import type { User } from "./User"

export type Recipe = {
  _id: string
  title: string
  description: string
  ingredients: string[]
  steps: string[]
  tags: Tag[]
  author: User[]
  date_creation: Date
}
