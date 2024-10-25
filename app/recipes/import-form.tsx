
"use client"
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { FunctionComponent } from "react";
import { useToast } from "@/hooks/use-toast";
import { ImportInput } from "../model";



export const ImportForm: FunctionComponent = () => {
  const router = useRouter()
  const { toast } = useToast()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ImportInput),
    defaultValues: {
      url: ""
    },
  });

  const onSubmit = async (input: ImportInput) => {
    const { data } = await axios.post("/api/recipes/import", input)
    const recipeId = z.number().parse(data)
    toast({ title: "New recipe created!" })
    router.push("/recipes/" + recipeId)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Recipe URL */}
      <div>
        <label htmlFor="url">Recipe URL</label>
        <Input id="url" {...register("url")} placeholder="Recipe URL" />
        {errors.url && <p className="text-red-500">{errors.url.message}</p>}
      </div>
      <Button type="submit">Import Recipe</Button>
    </form>);
};

