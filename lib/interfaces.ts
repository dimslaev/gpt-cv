import { z } from "zod";
import {
  CVSchema,
  JobDescriptionSchema,
  RecommendationSchema,
} from "./schemas";

export type CV = z.infer<typeof CVSchema>;
export type JobDescription = z.infer<typeof JobDescriptionSchema>;
export type Recommendation = z.infer<typeof RecommendationSchema>;
