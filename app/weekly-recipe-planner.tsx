"use client"
import queryString from "query-string"
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Recipe } from '@/db/schema';
import axios from 'axios';
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import * as schema from "@/db/schema"

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const fetchRecipes = async (count: number, excludeIds: number[]): Promise<schema.Recipe[]> => {
  const { data } = await axios.get("/api/recipes?" + queryString.stringify({ count, excludeIds: excludeIds.join(",") }))
  return data
}
export const WeeklyRecipePlanner: FunctionComponent<{ initialRecipes: Recipe[] }> = ({ initialRecipes }) => {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes)
  const randomizeAll = useCallback(async () => {
    const recipes = await fetchRecipes(daysOfWeek.length, [])
    setRecipes(recipes)
  }, [])


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Weekly Recipe Planner</h1>
      <Button onClick={randomizeAll}>Randomize</Button>

      {/* Weekly Recipe List */}
      <div className="space-y-4">
        {recipes.map((recipe, index) => {
          const day = daysOfWeek[index]

          return (
            <div key={day} className="space-y-2">
              <h2 className="text-xl font-semibold">{day}</h2>

              <Card>
                <CardHeader>
                  <CardTitle>{recipe.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{recipe.instructions}</p>
                  <div className="mt-2">
                    {recipe.tags.map((tag) => (
                      <Button key={tag} variant="secondary" size="sm" className="mr-2">
                        {tag}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div >
  );
}
