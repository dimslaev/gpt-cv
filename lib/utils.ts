import fs from "fs/promises";
import { load as loadYaml, dump as dumpYaml } from "js-yaml";
import { z } from "zod";

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
