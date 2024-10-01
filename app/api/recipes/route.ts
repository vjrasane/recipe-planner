import { RecipeInput } from '@/app/model'
import { createRecipe, getRandomRecipes } from '@/db/db-client'
import { NextRequest, NextResponse } from 'next/server'

export const POST = async (request: NextRequest) => {
  try {
    const data = await request.json()
    const input = RecipeInput.parse(data)
    const recipe = await createRecipe(input)
    return NextResponse.json(recipe, { status: 201 })
  } catch (err) {
    console.log(err)
    return NextResponse.json({ error: err }, { status: 500 })
  }
}

export const GET = async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams
    const count = +(searchParams.get('count') ?? 7)
    const recipes = await getRandomRecipes(count)
    return NextResponse.json(recipes, { status: 201 })
  } catch (err) {
    console.log(err)
    return NextResponse.json({ error: err }, { status: 500 })
  }
}
