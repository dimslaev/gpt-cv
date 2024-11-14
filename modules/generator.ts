import fs from "fs/promises";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { paths, MODEL_CONFIG, DEFAULT_LOG } from "../lib/config";
import {
  getDefaultLogs,
  getResponseMeta,
  parseFile,
  writeYaml,
} from "../lib/utils";
import { JobDescriptionSchema, RevisionSchema, CVSchema } from "../lib/schemas";
import {
  type CV,
  type JobDescription,
  type Revision,
  type GeneratorLogs,
  ResponseMeta,
} from "../lib/interfaces";
import { PROMPTS } from "../lib/prompts";
import { ZodObjectAny } from "@langchain/core/dist/types/zod";

export class Generator {
  baseCV: CV;
  customCV: CV;
  jobDescription: JobDescription;
  logs: GeneratorLogs = getDefaultLogs(DEFAULT_LOG);
  model: ChatOpenAI;

  async init() {
    this.model = new ChatOpenAI({
      openAIApiKey: process.env.OPEN_API_KEY,
      modelName: MODEL_CONFIG.MODEL,
      temperature: MODEL_CONFIG.TEMPERATURE,
      maxTokens: MODEL_CONFIG.MAX_TOKENS,
    });
    this.baseCV = await parseFile<CV>(paths.baseFile, CVSchema);
    this.customCV = { ...this.baseCV };
    this.jobDescription = await this.parseJobDescription();
  }

  async parseJobDescription(): Promise<JobDescription> {
    const fileContent = await fs.readFile(paths.jobDescription, "utf-8");
    const structuredLlm = this.model.withStructuredOutput(JobDescriptionSchema);
    const result = await structuredLlm.invoke(
      `Parse job description in the required format: ${fileContent}`
    );
    return result;
  }

  async getStructuredOutput<T>({
    user,
    schema = RevisionSchema,
    variables,
  }: {
    user: string;
    schema?: ZodObjectAny;
    variables: any;
  }): Promise<T & { meta: ResponseMeta }> {
    const template = ChatPromptTemplate.fromMessages([
      ["system", PROMPTS.SYSTEM(this.jobDescription)],
      ["user", user],
    ]);
    const llm = this.model.withStructuredOutput(schema, {
      includeRaw: true,
    });
    const chain = template.pipe(llm);
    const { raw, parsed } = await chain.invoke(variables);
    return { ...parsed, meta: getResponseMeta(raw.response_metadata) };
  }

  async generateSummary() {
    const { result, ...logs } = await this.getStructuredOutput<Revision>({
      user: PROMPTS.SUMMARY,
      variables: this.baseCV,
    });
    this.customCV.summary = result[0];
    this.logs.summary = logs;
  }

  async generateSkills(skillType: "technical" | "nonTechnical") {
    if (!this.baseCV.skills[skillType]?.length) return;

    const { result, ...logs } = await this.getStructuredOutput<Revision>({
      user: PROMPTS.SKILLS,
      variables: {
        ...this.baseCV,
        skills: this.baseCV.skills[skillType],
        skillType,
      },
    });
    this.customCV.skills[skillType] = result;
    this.logs.skills[skillType] = logs;
  }

  async generateTechnicalSkills() {
    await this.generateSkills("technical");
  }

  async generateNonTechnicalSkills() {
    await this.generateSkills("nonTechnical");
  }

  async generateExperienceItem(item: CV["experience"][number]) {
    return await this.getStructuredOutput<Revision>({
      user: PROMPTS.EXPERIENCE,
      schema: RevisionSchema,
      variables: {
        ...this.baseCV,
        experience: item.responsibilities.join("\n"),
      },
    });
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
