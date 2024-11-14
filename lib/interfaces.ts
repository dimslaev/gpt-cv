import { z } from "zod";
import { CVSchema, JobDescriptionSchema, RevisionSchema } from "./schemas";

export type CV = z.infer<typeof CVSchema>;
export type JobDescription = z.infer<typeof JobDescriptionSchema>;
export type Revision = z.infer<typeof RevisionSchema>;

export type ResponseMeta = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cachedTokens: number;
};

export type GeneratorLog = {
  changes: string[];
  recommendations: string[];
  meta: ResponseMeta;
};

export type GeneratorLogs = {
  summary: GeneratorLog;
  skills: {
    technical: GeneratorLog;
    nonTechnical: GeneratorLog;
  };
  experience: GeneratorLog[];
};
