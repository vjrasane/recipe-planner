import { getRandomRecipes } from "@/db/db-client";
import { WeeklyRecipePlanner } from "./weekly-recipe-planner";

export default async function Home() {
  const recipes = await getRandomRecipes(7)
  return <WeeklyRecipePlanner initialRecipes={recipes} />;
}
