import { z } from "zod";

const IngredientInput = z.object({
  name: z.string().min(1, "Ingredient name is required"),
  amount: z.number().positive("Amount must be positive"),
  unit: z.string().min(1, "Unit is required"),
});

export const RecipeInput = z.object({
  name: z.string().min(1, "Recipe name is required"),
  instructions: z.string().min(1, "Instructions are required"),
  ingredients: z.array(IngredientInput).min(1, "At least one ingredient is required"),
  tags: z.array(z.string()),
});

export type RecipeInput = z.infer<typeof RecipeInput>

export const ImportInput = z.object({
  url: z.string().url()
})

export type ImportInput = z.infer<typeof ImportInput>
