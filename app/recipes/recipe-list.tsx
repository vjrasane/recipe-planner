
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllRecipes } from '@/db/db-client';
import { truncate } from 'lodash/fp';
import Link from 'next/link';


export const RecipeList = async () => {
  const recipes = await getAllRecipes()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Recipes</h1>

      <Link href="/recipes/create"><Button>Create</Button></Link>
      {/* Search Bar */}
      {/* <div className="mb-6"> */}
      {/*   <Input */}
      {/*     type="text" */}
      {/*     placeholder="Search recipes..." */}
      {/*     value={searchTerm} */}
      {/*     onChange={(e) => setSearchTerm(e.target.value)} */}
      {/*   /> */}
      {/* </div> */}

      {/* Recipe Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.length > 0 ? (
          recipes.map((recipe) => (
            <Link href={"/recipes/" + recipe.id}>
              <Card key={recipe.id}>
                <CardHeader>
                  <CardTitle>{recipe.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{truncate({ length: 30 }, recipe.instructions)}</p>
                  <div className="mt-2">
                    {recipe.tags.map((tag: string) => (
                      <Button key={tag} variant="secondary" size="sm" className="mr-2">
                        {tag}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <p>No recipes found.</p>
        )}
      </div>
    </div>
  );
}
