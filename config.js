import path from "path";
import dotenv from "dotenv";

dotenv.config();

const basePath = process.cwd();

export const paths = {
  basePath,
  markdown: path.join(basePath, "markdown"),
  html: path.join(basePath, "html"),
  template: path.join(basePath, "template"),
  outputMarkdown: path.join(basePath, "markdown", "generated-cv"),
  outputHtml: path.join(basePath, "output"),
  jobDescription: path.join(basePath, "job-description.txt"),
};

export const SECTION_ORDER = [
  "1-header.md",
  "2-summary.md",
  "3-skills.md",
  "4-experience.md",
  "5-education.md",
  "6-certificates.md",
  "7-languages.md",
];
