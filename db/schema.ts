import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { json, pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';

type Ingredient = {
  name: string,
  amount: number,
  unit: string
}

export const recipe = pgTable('recipes', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  instructions: text('instructions').notNull(),
  ingredients: json("ingredients").$type<Ingredient[]>().default([]).notNull(),
  tags: json("tags").$type<string[]>().default([]).notNull()
});

export type Recipe = InferSelectModel<typeof recipe>
export type InsertRecipe = InferInsertModel<typeof recipe>
