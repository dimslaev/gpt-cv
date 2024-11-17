import fs from "fs/promises";
import { load as loadYaml, dump as dumpYaml } from "js-yaml";
import { z } from "zod";
import { GeneratorLog, GeneratorLogs, ResponseMeta } from "./interfaces";
import { BaseMessage } from "@langchain/core/messages";

export async function parseFile<T = unknown>(
  filePath: string,
  schema: z.Schema
): Promise<T> {
  const fileContent = await fs.readFile(filePath, "utf-8");
  const result = loadYaml(fileContent);
  schema.parse(result);
  return result as T;
}

export async function writeYaml(filePath: string, yamlContent: any) {
  try {
    const yamlData = dumpYaml(yamlContent, { noRefs: true, lineWidth: 120 });
    await fs.writeFile(filePath, yamlData, "utf-8");
    console.log(`Recommendations written to ${filePath}`);
  } catch (error) {
    console.error(`Error writing to YAML file: ${error}`);
  }
}

export function getDefaultLogs(defaultLog: GeneratorLog): GeneratorLogs {
  return {
    summary: { ...defaultLog },
    skills: {
      technical: { ...defaultLog },
      nonTechnical: { ...defaultLog },
    },
    experience: [],
  };
}

export function getResponseMeta(
  metadata: BaseMessage["response_metadata"]
): ResponseMeta {
  return {
    promptTokens: metadata?.tokenUsage?.promptTokens || 0,
    completionTokens: metadata?.tokenUsage?.completionTokens || 0,
    totalTokens: metadata?.tokenUsage?.totalTokens || 0,
    cachedTokens: metadata?.usage?.prompt_tokens_details?.cached_tokens || 0,
  };
}

export function stripHttp(link: string) {
  return link.replace(/http(s?):\/\//, "");
}
