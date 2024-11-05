import path from "path";
import dotenv from "dotenv";
import { CV } from "./interfaces";

dotenv.config();

const basePath = process.cwd();

export const paths = {
  basePath,
  yaml: path.join(basePath, "yaml"),
  html: path.join(basePath, "html"),
  template: path.join(basePath, "template"),
  baseFile: path.join(basePath, "yaml", "_base.yaml"),
  jobDescription: path.join(basePath, "job-description.txt"),
  recommendations: path.join(basePath, "recommendations.txt"),
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
