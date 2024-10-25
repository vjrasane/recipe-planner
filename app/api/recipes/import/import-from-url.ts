
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

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
import { RecipeInput } from "@/app/model";
import { z } from "zod";

export const getRecipeFromUrl = async (url: string): Promise<RecipeInput> => {
  const loader = new CheerioWebBaseLoader(
    url, { selector: "body" }
  );

  const docs = await loader.load();

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const splits = await textSplitter.splitDocuments(docs);
  const vectorStore = await MemoryVectorStore.fromDocuments(
    splits,
    new OpenAIEmbeddings()
  );
  // Retrieve and generate using the relevant snippets of the blog.
  const retriever = vectorStore.asRetriever();
  // const prompt = await pull<ChatPromptTemplate>("rlm/rag-prompt");


  const parser = StructuredOutputParser.fromZodSchema(RecipeInput)
  // prompt.partialVariables.format_instructions = parser.getFormatInstructions()
  //
  const prompt = PromptTemplate.fromTemplate(`
Answer the users question as best as possible

{format_instructions}

Question: {question}
Context: {context}
`)

  const question = "what recipes does this web page contain? what are the ingredients and instructions? list amounts for each ingredient and give a detailed step by step guide to preparing the dish, each step on a new line"
  const retrievedDocs = await retriever.invoke(question);
  const llm = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 });

  const ragChain = await createStuffDocumentsChain({
    llm,
    prompt,
    outputParser: new StringOutputParser(),
  });
  const answer = await ragChain.invoke({
    question,
    format_instructions: parser.getFormatInstructions(),
    context: retrievedDocs,
  });

  return parser.parse(answer)
}
