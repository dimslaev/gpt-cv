import { z } from "zod";
import {
  CVSchema,
  JobDescriptionSchema,
  RevisionArraySchema,
  RevisionStringSchema,
} from "./schemas";

export type CV = z.infer<typeof CVSchema>;
export type JobDescription = z.infer<typeof JobDescriptionSchema>;
export type RevisionArray = z.infer<typeof RevisionArraySchema>;
export type RevisionString = z.infer<typeof RevisionStringSchema>;

export type Usage = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cachedPromptTokens: number;
};

export type GeneratorLog = {
  changes: string[];
  recommendations: string[];
  usage: Usage;
};

export type GeneratorLogs = {
  summary: GeneratorLog;
  skills: {
    technical: GeneratorLog;
    nonTechnical: GeneratorLog;
  };
  experience: GeneratorLog[];
};

export type ParsedTemplateNode =
  | { type: "literal"; text: string }
  | { type: "variable"; name: string };
