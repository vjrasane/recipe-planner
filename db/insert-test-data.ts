import postgres from 'postgres'
import recipes from './recipes.json'
import dotenv from 'dotenv'
import * as schema from './schema'
import { drizzle } from 'drizzle-orm/postgres-js'
import { omit } from 'lodash/fp'

dotenv.config({ path: '.env' })

const { DATABASE_URL } = process.env

const client = postgres(DATABASE_URL!)
const db = drizzle(client, { schema })

const insertRecipes = async () => {
  await db.insert(schema.recipe).values(recipes.map(omit('id')))
  await client.end()
}

insertRecipes()
