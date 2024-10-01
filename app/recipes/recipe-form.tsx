"use client"
import axios from "axios"
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RecipeInput } from "@/app/model";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { FunctionComponent } from "react";
import { Recipe } from "@/db/schema";
import { omit } from "lodash/fp";
import { useToast } from "@/hooks/use-toast";

const unitOptions = ["grams", "cups", "liters", "tablespoons", "teaspoons", "ounces", "pieces"];
const defaultUnit = unitOptions[0]

export const RecipeForm: FunctionComponent<{
  recipe?: Recipe
}> = ({ recipe }) => {
  const router = useRouter()
  const { toast } = useToast()
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RecipeInput>({
    resolver: zodResolver(RecipeInput),
    defaultValues: recipe ? omit("id", recipe) : {
      ingredients: [{ name: "", amount: 0, unit: defaultUnit }],
      tags: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "ingredients",
  });

  const onSubmit = async (input: RecipeInput) => {
    if (!recipe) {
      const { data } = await axios.post("/api/recipes", input)
      const recipeId = z.number().parse(data)
      toast({ title: "New recipe created!" })
      router.push("/recipes/" + recipeId)
    } else {
      await axios.put("/api/recipes/" + recipe.id, input)
      toast({ title: "Recipe updated!" })
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Recipe Name */}
      <div>
        <label htmlFor="name">Recipe Name</label>
        <Input id="name" {...register("name")} placeholder="Recipe Name" />
        {errors.name && <p className="text-red-500">{errors.name.message}</p>}
      </div>

      {/* Instructions */}
      <div>
        <label htmlFor="instructions">Instructions</label>
        <Textarea
          id="instructions"
          {...register("instructions")}
          placeholder="Instructions"
        />
        {errors.instructions && (
          <p className="text-red-500">{errors.instructions.message}</p>
        )}
      </div>

      {/* Ingredients */}
      <div>
        <h3>Ingredients</h3>
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center space-x-2">
            <Input
              {...register(`ingredients.${index}.name`)}
              placeholder="Ingredient Name"
            />
            <Input
              type="number"
              {...register(`ingredients.${index}.amount`, {
                valueAsNumber: true,
              })}
              placeholder="Amount"
            />
            <Input
              {...register(`ingredients.${index}.unit`)}
              placeholder="Unit (e.g., grams, cups)"
            />
            <Button
              type="button"
              onClick={() => remove(index)}
              className="text-red-500"
            >
              Remove
            </Button>
          </div>
        ))}
        {errors.ingredients && (
          <p className="text-red-500">{errors.ingredients.message}</p>
        )}
        <Button
          type="button"
          onClick={() =>
            append({ name: "", amount: 0, unit: defaultUnit })
          }
        >
          Add Ingredient
        </Button>
      </div>

      {/* Tags */}
      <div>
        <h3>Tags</h3>
        <div className="flex flex-wrap space-x-4">
          {["dairy", "vegetarian", "vegan", "chicken", "red meat"].map((tag) => (
            <div key={tag} className="flex items-center">
              <Checkbox
                {...register("tags")}
                value={tag}
                id={tag}
              />
              <label htmlFor={tag} className="ml-2 capitalize">
                {tag}
              </label>
            </div>
          ))}
        </div>
        {errors.tags && (
          <p className="text-red-500">{errors.tags.message}</p>
        )}
      </div>

      <Button type="submit">Submit Recipe</Button>
    </form>);
};

