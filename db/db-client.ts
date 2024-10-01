import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'
import { eq, sql } from 'drizzle-orm'

const { DATABASE_URL } = process.env

const client = postgres(DATABASE_URL!)
const db = drizzle(client, { schema })

export const getRecipeById = async (
  id: number
): Promise<schema.Recipe | undefined> => {
  const data = await db.query.recipe.findFirst({
    where: eq(schema.recipe.id, id),
  })
  return data
}

export const getAllRecipes = async (): Promise<schema.Recipe[]> => {
  const recipes = await db.query.recipe.findMany()
  return recipes
}

export const getRandomRecipes = async (
  randomCount: number
): Promise<schema.Recipe[]> => {
  const recipes = await db
    .select()
    .from(schema.recipe)
    .orderBy(sql`RANDOM()`)
    .limit(randomCount)
  return recipes
}

export const createRecipe = async (
  input: schema.InsertRecipe
): Promise<number> => {
  const [{ id }] = await db
    .insert(schema.recipe)
    .values(input)
    .returning({ id: schema.recipe.id })
  return id
}

export const updateRecipe = async (
  recipeId: number,
  input: schema.InsertRecipe
): Promise<number> => {
  const [{ id }] = await db
    .update(schema.recipe)
    .set(input)
    .where(eq(schema.recipe.id, recipeId))
    .returning({ id: schema.recipe.id })
  return id
}
