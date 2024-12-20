import fs from "fs/promises";
import { Chat } from "./chat";
import { paths, DEFAULT_LOG } from "../lib/config";
import {
  getDefaultLogs,
  parseFile,
  writeYaml,
  interpolate,
} from "../lib/utils";
import {
  JobDescriptionSchema,
  RevisionArraySchema,
  RevisionStringSchema,
  CVSchema,
} from "../lib/schemas";
import {
  type CV,
  type JobDescription,
  type RevisionArray,
  type RevisionString,
  type GeneratorLogs,
} from "../lib/interfaces";
import { PROMPTS } from "../lib/prompts";

export class Generator {
  baseCV: CV;
  customCV: CV;
  jobDescription: JobDescription;
  logs: GeneratorLogs = getDefaultLogs(DEFAULT_LOG);
  chat: Chat;

  async init() {
    this.chat = new Chat();
    this.baseCV = await parseFile<CV>(paths.baseFile, CVSchema);
    this.customCV = { ...this.baseCV };
    this.jobDescription = await this.parseJobDescription();
  }

  async parseJobDescription(): Promise<JobDescription> {
    const fileContent = await fs.readFile(paths.jobDescription, "utf-8");
    const completion = await this.chat.completeParsed<JobDescription>({
      system: `Parse job description in the required format`,
      user: fileContent,
      schema: JobDescriptionSchema,
      schemaName: "job-description",
    });
    const parsed = this.chat.getParsedContent<JobDescription>(completion);
    if (!parsed) {
      throw new Error("Error parsing job description");
    }
    return parsed;
  }

  async generateSummary() {
    const completion = await this.chat.completeParsed<RevisionString>({
      system: interpolate(PROMPTS.SYSTEM, this.jobDescription),
      user: interpolate(PROMPTS.SUMMARY, this.baseCV),
      schema: RevisionStringSchema,
      schemaName: "summary",
    });
    const parsed = this.chat.getParsedContent<RevisionString>(completion);
    const usage = this.chat.getUsage(completion);

    this.customCV.summary = parsed.result;
    this.logs.summary = {
      changes: parsed.changes,
      recommendations: parsed.recommendations,
      usage,
    };
  }

  async generateSkills(skillType: "technical" | "nonTechnical") {
    if (!this.baseCV.skills[skillType]?.length) return;

    const completion = await this.chat.completeParsed<RevisionArray>({
      system: interpolate(PROMPTS.SYSTEM, this.jobDescription),
      user: interpolate(PROMPTS.SKILLS, {
        ...this.baseCV,
        skills: this.baseCV.skills[skillType],
        skillType,
      }),
      schema: RevisionArraySchema,
      schemaName: skillType,
    });
    const parsed = this.chat.getParsedContent<RevisionArray>(completion);
    const usage = this.chat.getUsage(completion);

    this.customCV.skills[skillType] = parsed.result;
    this.logs.skills[skillType] = {
      changes: parsed.changes,
      recommendations: parsed.recommendations,
      usage,
    };
  }

  async generateTechnicalSkills() {
    await this.generateSkills("technical");
  }

  async generateNonTechnicalSkills() {
    await this.generateSkills("nonTechnical");
  }

  async generateExperienceItem(item: CV["experience"][number]) {
    const completion = await this.chat.completeParsed<RevisionArray>({
      system: interpolate(PROMPTS.SYSTEM, this.jobDescription),
      user: interpolate(PROMPTS.EXPERIENCE, {
        ...this.baseCV,
        experience: item.responsibilities.join("\n"),
      }),
      schema: RevisionArraySchema,
      schemaName: "experience",
    });
    const parsed = this.chat.getParsedContent<RevisionArray>(completion);
    const usage = this.chat.getUsage(completion);
    return {
      result: parsed.result,
      changes: parsed.changes,
      recommendations: parsed.recommendations,
      usage,
    };
  }

  async generateExperience() {
    await Promise.all(
      this.baseCV.experience.map(async (item, index) => {
        const { result, ...logs } = await this.generateExperienceItem(item);
        this.customCV.experience[index].responsibilities = result;
        this.logs.experience[index] = logs;
      })
    );
  }

  async generateCustomCV() {
    await this.generateSummary();
    await this.generateTechnicalSkills();
    await this.generateNonTechnicalSkills();
    await this.generateExperience();
  }

  async writeToYaml() {
    await writeYaml(paths.generatedFile, {
      ...this.baseCV,
      ...this.customCV,
    });
  }
}
