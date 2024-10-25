
import { ImportInput } from '@/app/model'
import { createRecipe } from '@/db/db-client'
import { NextRequest, NextResponse } from 'next/server'
import { getRecipeFromUrl } from './import-from-url'


export const POST = async (request: NextRequest) => {
  try {
    const data = await request.json()
    const input = ImportInput.parse(data)
    const recipeData = await getRecipeFromUrl(input.url)
    const recipe = await createRecipe(recipeData)
    return NextResponse.json(recipe, { status: 201 })
  } catch (err) {
    console.log(err)
    return NextResponse.json({ error: err }, { status: 500 })
  }
}
