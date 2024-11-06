import fs from "fs/promises";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { paths } from "./lib/config";
import { parseFile, writeYaml } from "./lib/utils";
import {
  JobDescriptionSchema,
  RecommendationListSchema,
  CVSchema,
} from "./lib/schemas";
import {
  type CV,
  type JobDescription,
  type Recommendation,
} from "./lib/interfaces";
import { PROMPTS } from "./lib/prompts";

class CVTailor {
  static baseCV: CV;
  static jobDescription: JobDescription;
  static recommendations: {
    summary?: Recommendation[];
    skills?: {
      technical?: Recommendation[];
      nonTechnical?: Recommendation[];
    };
    experience?: Recommendation[][];
  } = {};
  static model: ChatOpenAI;

  static async init() {
    this.model = new ChatOpenAI({
      openAIApiKey: process.env.OPEN_API_KEY,
      modelName: "gpt-4o-mini",
      temperature: 0,
      maxTokens: 1000,
    });
    this.baseCV = await parseFile<CV>(paths.baseFile, CVSchema);
    this.jobDescription = await this.parseJobDescription();
  }

  static async parseJobDescription(): Promise<JobDescription> {
    const fileContent = await fs.readFile(paths.jobDescription, "utf-8");
    const structuredLlm = this.model.withStructuredOutput(JobDescriptionSchema);
    const result = await structuredLlm.invoke(
      `Parse this the job description in the required json format: ${fileContent}`
    );
    return result;
  }

  static async getRecommendationsPrompt(
    prompt: string,
    variables: any
  ): Promise<Recommendation[]> {
    const promptTemplate = ChatPromptTemplate.fromMessages([
      ["system", PROMPTS.SYSTEM],
      ["user", prompt],
    ]);

    const structuredLlm = this.model.withStructuredOutput(
      RecommendationListSchema
    );

    const llmChain = promptTemplate.pipe(structuredLlm);

    return (await llmChain.invoke(variables)).list;
  }

  static async getSummaryRecommendations() {
    this.recommendations.summary = await this.getRecommendationsPrompt(
      PROMPTS.SUMMARY,
      { ...this.baseCV, ...this.jobDescription }
    );
  }

  static async getSkillsRecommendations() {
    this.recommendations.skills = {
      technical: this.baseCV.skills.technical
        ? await this.getRecommendationsPrompt(PROMPTS.TECHNICAL_SKILLS, {
            ...this.baseCV,
            skills: this.baseCV.skills.technical,
            ...this.jobDescription,
          })
        : [],
      nonTechnical: this.baseCV.skills.nonTechnical
        ? await this.getRecommendationsPrompt(PROMPTS.NON_TECHNICAL_SKILLS, {
            ...this.baseCV,
            skills: this.baseCV.skills.nonTechnical,
            ...this.jobDescription,
          })
        : [],
    };
  }

  static async getExperienceRecommendations() {
    this.recommendations.experience = await Promise.all(
      this.baseCV.experience.map(async (item) => {
        return await this.getRecommendationsPrompt(PROMPTS.EXPERIENCE, {
          ...this.baseCV,
          experience: item.responsibilities,
          ...this.jobDescription,
        });
      })
    );
  }

  static async getRecommendations() {
    await this.getSummaryRecommendations();
    await this.getSkillsRecommendations();
    await this.getExperienceRecommendations();
  }

  static async writeRecommendationsToYaml() {
    // Structure the content for YAML formatting
    const yamlContent = {
      summary: {
        content: this.baseCV.summary,
        recommendations: this.recommendations.summary,
      },
      skills: {
        technical: {
          content: this.baseCV.skills.technical,
          recommendations: this.recommendations.skills?.technical,
        },
        nonTechnical: {
          content: this.baseCV.skills.nonTechnical,
          recommendations: this.recommendations.skills?.nonTechnical,
        },
      },
      experience: this.baseCV.experience.map((exp, index) => ({
        content: exp,
        recommendations: this.recommendations.experience?.[index],
      })),
    };

    await writeYaml(paths.recommendations, yamlContent);
  }
}

async function main() {
  await CVTailor.init();
  await CVTailor.getRecommendations();
  await CVTailor.writeRecommendationsToYaml();
}

main();
