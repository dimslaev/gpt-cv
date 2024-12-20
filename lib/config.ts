import path from "path";
import dotenv from "dotenv";
import { CV, GeneratorLog } from "./interfaces";

dotenv.config();

const basePath = process.cwd();

export const paths = {
  basePath,
  yaml: path.join(basePath, "yaml"),
  html: path.join(basePath, "html"),
  template: path.join(basePath, "template"),
  baseFile: path.join(basePath, "yaml", "_base.yaml"),
  generatedFile: path.join(basePath, "yaml", "_generated.yaml"),
  jobDescription: path.join(basePath, "job-description.txt"),
};

export const MODEL_CONFIG = {
  MODEL: "gpt-4o-mini",
  MAX_TOKENS: 3000,
  TEMPERATURE: 0,
};

export const SECTION_ORDER: Array<keyof CV> = [
  "header",
  "summary",
  "skills",
  "experience",
  "education",
  "certificates",
  "languages",
];

export const DEFAULT_LOG: GeneratorLog = {
  changes: [],
  recommendations: [],
  usage: {
    promptTokens: 0,
    cachedPromptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
  },
};
