import { FunctionComponent } from "react"
import { RecipeForm } from "../recipe-form"
import { z } from "zod"
import { getRecipeById } from "@/db/db-client"
import { redirect } from "next/navigation"

const Page: FunctionComponent<{
  params: {
    recipeId: number
  }
}> = async ({ params }) => {
  const { recipeId } = z.object({
    recipeId: z.coerce.number()
  }).parse(params)

  const recipe = await getRecipeById(recipeId)

  if (!recipe) return redirect("/")
  return <RecipeForm recipe={recipe} />
}

export default Page
