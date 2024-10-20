import fs from "fs/promises";
import path from "path";
import { paths } from "./config.js"; // Import the config
import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const MODEL = "gpt-4o-mini";

// Reads the job description from a designated file.
async function getJobDescription() {
  try {
    const description = await fs.readFile(paths.jobDescription, "utf-8");

    if (description.trim().length === 0) {
      throw new Error("Job description file does not contain any lines.");
    }

    return description;
  } catch (error) {
    const message =
      error.message ||
      `Error reading job description file: ${path.jobDescription}`;
    throw new Error(message);
  }
}

// Read CV sections from the base and versioned Markdown files and concatenate the content.
async function readCVSections() {
  const basePath = path.join(paths.markdown, "__base");
  const versionDirs = await fs.readdir(paths.markdown);

  const sections = {
    header: await fs.readFile(path.join(basePath, "1-header.md"), "utf-8"),
    summary: await fs.readFile(path.join(basePath, "2-summary.md"), "utf-8"),
    skills: await fs.readFile(path.join(basePath, "3-skills.md"), "utf-8"),
    experience: await fs.readFile(
      path.join(basePath, "4-experience.md"),
      "utf-8"
    ),
    education: await fs.readFile(
      path.join(basePath, "5-education.md"),
      "utf-8"
    ),
    certificates: await fs.readFile(
      path.join(basePath, "6-certificates.md"),
      "utf-8"
    ),
    languages: await fs.readFile(
      path.join(basePath, "7-languages.md"),
      "utf-8"
    ),
  };

  // Loop through version directories and concatenate sections
  for (const dir of versionDirs) {
    if (dir !== "__base") {
      const versionPath = path.join(paths.markdown, dir);
      const versionFiles = await fs.readdir(versionPath);

      for (const file of versionFiles) {
        const sectionType = file.split("-")[1].split(".")[0]; // Get section type e.g., 'skills', 'experience'
        const filePath = path.join(versionPath, file);

        if (sections[sectionType]) {
          const versionContent = await fs.readFile(filePath, "utf-8"); // Read version-specific content

          if (["summary", "skills", "experience"].includes(sectionType)) {
            sections[sectionType] += `\n\n${versionContent}`; // Concatenate with base section
          } else {
            sections[sectionType] = versionContent; // Replace base section
          }
        }
      }
    }
  }

  return sections;
}

// Closure for chat completions with internal message history
function createChatCompletion({
  model = MODEL,
  temperature = 0,
  tokens = 2000,
}) {
  let messages = [];

  // Function to initialize the system message and maintain the conversation
  async function sendCompletion(userPrompt) {
    // Append the user prompt to the message history
    messages.push({ role: "user", content: userPrompt });

    const response = await openai.chat.completions.create({
      model,
      messages,
      max_tokens: tokens,
      temperature,
    });

    // Extract the assistant's response
    const assistantMessage = response.choices[0].message.content;

    // Append the assistant's response to the message history
    messages.push({ role: "assistant", content: assistantMessage });

    return assistantMessage;
  }

  // Function to initialize the system message
  function initializeSystemPrompt(systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }

  // Expose the sendCompletion function and initialization method
  return { sendCompletion, initializeSystemPrompt };
}

// Generates a custom CV tailored to a specific job description.
async function generateCustomCV(jobDescription, cvSections) {
  const chatCompletion = createChatCompletion({ model: MODEL });

  const systemPrompt = `
    You are an AI expert specializing in tailoring CVs for specific jobs.
    Your task is to adapt the user's CV to best match a given job description.
    Clean up the input, removing repetitive or unimportant information.
    Do not invent content that the user does not mention in their input.
    Start by determining the role, key skills and technologies required for the job description and align the content of the CV as necessary. 
  `;
  chatCompletion.initializeSystemPrompt(systemPrompt);

  const summaryPrompt = `
    Rewrite the summary section based on both the current CV summary and the experience section, in 3-4 sentences.
    Focus on highlighting the most relevant achievements and skills that match the job description.

    ## Current Summary:
    ${cvSections.summary}

    ## Current Experience: 
    ${cvSections.experience}

    ## Job Description:
    ${jobDescription}

    Always include the section title: ## Summary
    Ensure the new summary is concise and does not include phrases like "Excited to contribute to [COMPANY NAME]."
    Avoid using first person.
  `;

  const summary = await chatCompletion.sendCompletion(summaryPrompt);

  const skillsPrompt = `
    Rewrite the skills section based on the current CV and the job description.
    Prioritize the most relevant skills keeping them in their respective categories.
    Do not add new skills not present in the current CV. 

    ## Current Skills:
    ${cvSections.skills}

    ## Job Description:
    ${jobDescription}

    Always include the section title: ## Skills
    Use the same markdown formatting as the input:
    **Expert**: Skill 1, Skill 2
    **Advanced**: Skill 3, Skill 4
  `;

  const skills = await chatCompletion.sendCompletion(skillsPrompt);

  const experiencePrompt = `
    Rewrite the experience section based on the current CV and job description while avoiding specific negative patterns. 
    Prioritize the bullet points to match the most relevant skills and experiences for the job.
    Do not skip any of the experiences the user has had.

    ## Current Experience:
    ${cvSections.experience}

    ## Job Description:
    "${jobDescription}"

    ## Patterns to avoid: 
    
    1. Do not try to complete the bullet points to stress on the result of the activity, unless the result is already present.
    
    Example input: 
    "Created style guide and components from designs"
    Positive output: 
    "Developed a comprehensive style guide and reusable components from designs"
    Negative output: 
    "Developed a comprehensive style guide and reusable components from designs, resulting in enhanced client engagement"
    
    Example input: 
    "Created style guide and components from designs"
    Positive output: 
    "Integrated responsive designs across all marketplace pages"
    Negative output: 
    "Integrated responsive designs across all marketplace pages, enhancing user experience"
  `;

  const experience = await chatCompletion.sendCompletion(experiencePrompt);

  return {
    summary,
    skills,
    experience,
  };
}

// Writes the updated CV sections to Markdown and HTML files based on the job description.
async function writeUpdatedCV(jobDescription) {
  // Ensure output directories exist
  await fs.mkdir(paths.outputMarkdown, { recursive: true });
  await fs.mkdir(paths.outputHtml, { recursive: true });

  // Read base and versioned sections
  const cvSections = await readCVSections();

  // Generate custom CV content with ChatGPT
  const { summary, skills, experience } = await generateCustomCV(
    jobDescription,
    cvSections
  );

  cvSections.summary = summary;
  cvSections.skills = skills;
  cvSections.experience = experience;

  const sectionKeys = Object.keys(cvSections);

  for (let i = 0; i < sectionKeys.length; i++) {
    const sectionFilePath = path.join(
      paths.outputMarkdown,
      `${i + 1}-${sectionKeys[i]}.md`
    );
    await fs.writeFile(sectionFilePath, cvSections[sectionKeys[i]].trim());
  }
}

async function main() {
  const jobDescription = await getJobDescription();
  await writeUpdatedCV(jobDescription);
}

main().catch(console.error);
