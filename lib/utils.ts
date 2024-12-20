import fs from "fs/promises";
import { load as loadYaml, dump as dumpYaml } from "js-yaml";
import { z } from "zod";
import { GeneratorLog, GeneratorLogs, ParsedTemplateNode } from "./interfaces";

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

export function getNestedValue(value: any, path: string, defaultValue: any) {
  return path.split(".").reduce((acc, v) => {
    try {
      acc = acc[v];
    } catch (e) {
      return defaultValue;
    }
    return acc;
  }, value);
}

export function parseTemplate(template: string): ParsedTemplateNode[] {
  const chars = template.split("");
  const nodes: ParsedTemplateNode[] = [];

  const nextBracket = (bracket: "}" | "{" | "{}", start: number) => {
    for (let i = start; i < chars.length; i += 1) {
      if (bracket.includes(chars[i])) {
        return i;
      }
    }
    return -1;
  };

  let i = 0;
  while (i < chars.length) {
    if (chars[i] === "{" && i + 1 < chars.length && chars[i + 1] === "{") {
      nodes.push({ type: "literal", text: "{" });
      i += 2;
    } else if (
      chars[i] === "}" &&
      i + 1 < chars.length &&
      chars[i + 1] === "}"
    ) {
      nodes.push({ type: "literal", text: "}" });
      i += 2;
    } else if (chars[i] === "{") {
      const j = nextBracket("}", i);
      if (j < 0) {
        throw new Error("Unclosed '{' in template.");
      }

      nodes.push({
        type: "variable",
        name: chars.slice(i + 1, j).join(""),
      });
      i = j + 1;
    } else if (chars[i] === "}") {
      throw new Error("Single '}' in template.");
    } else {
      const next = nextBracket("{}", i);
      const text = (next < 0 ? chars.slice(i) : chars.slice(i, next)).join("");
      nodes.push({ type: "literal", text });
      i = next < 0 ? chars.length : next;
    }
  }
  return nodes;
}

export function interpolate(
  template: string,
  values: Record<string, any> = {}
) {
  return parseTemplate(template).reduce((res, node) => {
    if (node.type === "variable") {
      const value = getNestedValue(values, node.name, "");
      const stringValue =
        typeof value === "string" ? value : JSON.stringify(value);
      return res + stringValue;
    }

    return res + node.text;
  }, "");
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

export function stripHttp(link: string) {
  return link.replace(/http(s?):\/\//, "");
}
