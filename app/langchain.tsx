import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter, TokenTextSplitter } from "langchain/text_splitter";
import { loadSummarizationChain } from "langchain/chains";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { pull } from "langchain/hub";
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser, StructuredOutputParser } from "@langchain/core/output_parsers";
import { formatDocumentsAsString } from "langchain/util/document";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import dotenv from "dotenv";
import { RecipeInput } from "./model";
import { z } from "zod";

dotenv.config()
const Ingredient = z.object({
  name: z.string(),
  amount: z.string(),
  unit: z.string()
})

const Section = z.object({
  name: z.string().optional(),
  instructions: z.string(),
  ingredients: z.array(Ingredient),
  notes: z.string().optional()
})

const RecipeWithSections = z.object({
  name: z.string(),
  sections: z.array(Section),
  notes: z.string().optional()
})

const Recipe = z.union([RecipeWithSections, Section])

const main = async (url: string) => {
  const loader = new CheerioWebBaseLoader(
    url, { selector: "body" }
  );

  const docs = await loader.load();

  // const textSplitter = new RecursiveCharacterTextSplitter({
  //   chunkSize: 1000,
  //   chunkOverlap: 200,
  // });
  const tokenSplitter = new TokenTextSplitter({
    chunkSize: 10000,
    chunkOverlap: 250
  })
  const splits = await tokenSplitter.splitDocuments(docs);
  // const vectorStore = await MemoryVectorStore.fromDocuments(
  //   splits,
  //   new OpenAIEmbeddings()
  // );
  // Retrieve and generate using the relevant snippets of the blog.
  // const retriever = vectorStore.asRetriever();
  // const prompt = await pull<ChatPromptTemplate>("rlm/rag-prompt");


  const parser = StructuredOutputParser.fromZodSchema(z.array(Recipe))
  // prompt.partialVariables.format_instructions = parser.getFormatInstructions()

  const questionPrompt = PromptTemplate.fromTemplate(`
You are an expert in summarizing recipe articles.
Your goal is to create a step by step guide to preparing the dish, including all ingredients and instructions.
Below you find the content of the article:
-------
{text}
-------

A single recipe may consist of multiple separate sections. Each section may contain multiple ingredients and instructions. Summarize each section separately and include the instructions and ingredients of that section under that section header only. If the recipe doesn't have sections, summarize the recipe as a whole. 

In both cases the instructions should be summarized as numbered steps, each on a new line.

The article may also include multiple recipes. Create a separate summary for each recipe. Total output will be a list of recipes with their respective ingredients and instructions.

SUMMARY:
`)

  const refinePrompt = PromptTemplate.fromTemplate(`
You are an expert in summarizing recipe articles.
Your goal is to create a step by step guide to preparing the dish, including all ingredients and instructions.

We have provided an existing summary up to a certain point: {existing_answer}

Below you find the content of the article:
-------
{text}
-------

A single recipe may consist of multiple separate sections. Each section may contain multiple ingredients and instructions. Summarize each section separately and include the instructions and ingredients of that section under that section header only. If the recipe doesn't have sections, summarize the recipe as a whole. 

In both cases the instructions should be summarized as numbered steps, each on a new line.

The article may also include multiple recipes. Create a separate summary for each recipe. Total output will be a list of recipes with their respective ingredients and instructions.

Given the new context, refine the summary. If the context isn't useful, return the original summary.

SUMMARY:
`)

  const llm = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 });

  const summarizeChain = loadSummarizationChain(llm, {
    type: "refine",
    verbose: true,
    questionPrompt,
    refinePrompt
  })

  const summary = await summarizeChain.invoke({
    input_documents: splits,
    // format_instructions: parser.getFormatInstructions()
  });

  const formatPrompt = PromptTemplate.fromTemplate(`
You are an expert in formatting recipe summaries to JSON format.

Below you find the recipe summary:
----------
{summary}
----------

The summary may include multiple recipes. Additionally, each recipe may contain multiple sections.

Format it to JSON according to the following instructions.

{format_instructions}
` )

  const chain = RunnableSequence.from([

    formatPrompt,
    llm,
    parser
  ])
  // const formatChain = await createStuffDocumentsChain({
  //   llm,
  //   prompt: formatPrompt,
  //   outputParser: new StringOutputParser(),
  // });

  const answer = await chain.invoke({ summary: summary.output_text, format_instructions: parser.getFormatInstructions() })

  console.log(answer)

  // const ragChain = RunnableSequence.from([
  //   {
  //     context: retriever.pipe(formatDocumentsAsString),
  //     question: new RunnablePassthrough(),
  //     format_instructions: new RunnablePassthrough(),
  //   },
  //   prompt,
  //   llm,
  //   new StringOutputParser(),
  // ])
  // const question = "what recipes does this web page contain? what are the ingredients and instructions? list amounts for each ingredient and give a detailed step by step guide to preparing the dish, each step on a new line"
  // const retrievedDocs = await retriever.invoke(question);

  // const answer = await ragChain.invoke(
  //   { question, format_instructions: parser.getFormatInstructions() }
  // )
  // const answer = await ragChain.invoke({
  //   question,
  //   format_instructions: parser.getFormatInstructions(),
  //   context: retrievedDocs,
  // });
  // console.log(answer);
  // console.log(docs.length);
  // console.log(docs[0].pageContent.length);
}

const test = async () => {
  const prompt = await pull<ChatPromptTemplate>("rlm/rag-prompt");
  // const chain = RunnableSequence.from([
  //   {
  //     context: "context here",
  //     question: new RunnablePassthrough(),
  //     format_instructions: "formatting instructions here",
  //   },
  //   prompt
  // ])
  // const output = await chain.invoke("input")
  console.log(prompt.promptMessages[0])
}

// test()
main("https://aaronandclaire.com/jjajangmyeon-korean-black-bean-sauce-noodles-recipe")
