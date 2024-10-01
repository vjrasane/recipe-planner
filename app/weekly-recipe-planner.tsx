"use client"
import queryString from "query-string"
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Recipe } from '@/db/schema';
import axios from 'axios';
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import * as schema from "@/db/schema"
import { set, stubFalse, times, truncate } from "lodash/fp";
import { Switch } from "@/components/ui/switch";

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const fetchRecipes = async (count: number, excludeIds: number[]): Promise<schema.Recipe[]> => {
  const { data } = await axios.get("/api/recipes?" + queryString.stringify({ count, excludeIds: excludeIds.join(",") }))
  return data
}
export const WeeklyRecipePlanner: FunctionComponent<{ initialRecipes: Recipe[] }> = ({ initialRecipes }) => {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes)
  const [disabledDays, setDisabledDays] = useState<boolean[]>(() => times(stubFalse, daysOfWeek.length))
  const randomizeAll = useCallback(async () => {
    const recipes = await fetchRecipes(daysOfWeek.length, [])
    setRecipes(recipes)
  }, [])

  const randomizeOne = useCallback(async (index: number) => {
    const [recipe] = await fetchRecipes(1, [])
    if (!recipe) return
    setRecipes(set(index, recipe))
  }, [])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Weekly Recipe Planner</h1>
      <Button onClick={randomizeAll}>Randomize</Button>

      {/* Weekly Recipe List */}
      <div className="space-y-4">
        {recipes.map((recipe, index) => {
          const day = daysOfWeek[index]
          const disabled = disabledDays[index]

          return (

            <Card>
              <CardHeader>
                <div className="flex justify-between">
                  <CardTitle>{day}</CardTitle>
                  <Switch checked={!disabled} onCheckedChange={(checked) => setDisabledDays(set(index, !checked))} />
                </div>
              </CardHeader>
              {!disabled ? <>
                <CardContent>
                  <div className="flex justify-between items-baseline">
                    <div className="flex items-baseline gap-4">
                      <div className="text-l">{recipe.name}</div>
                      <div className="mt-2">
                        {recipe.tags.map((tag) => (
                          <Button key={tag} variant="secondary" size="sm" className="mr-2">
                            {tag}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <Button onClick={() => randomizeOne(index)}>Randomize</Button>
                  </div>
                </CardContent>
              </> : null}
            </Card>
          );
        })}
      </div>
    </div >
  );
}
