import { RecipeInput } from '@/app/model'
import { updateRecipe } from '@/db/db-client'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const PUT = async (
  request: NextRequest,
  { params }: { params: { recipeId: number } }
) => {
  try {
    const { recipeId } = z.object({ recipeId: z.coerce.number() }).parse(params)
    const data = await request.json()
    const input = RecipeInput.parse(data)
    const recipe = await updateRecipe(recipeId, input)
    return NextResponse.json(recipe, { status: 201 })
  } catch (err) {
    console.log(err)
    return NextResponse.json({ error: err }, { status: 500 })
  }
}
