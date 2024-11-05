export const PROMPTS = {
  SYSTEM: `
    You are an expert CV writer specializing in aligning CVs with job descriptions to highlight relevant skills and experiences.
    Each prompt focuses on one CV section and includes only relevant CV and job description details.
    Provide a list of the top three recommendations, each including:
    - recommendation: what to emphasize, rephrase, add, or remove
    - source: job description phrase the recommendation addresses
    - example: applied recommendation to original CV content
    Prioritize relevant skills and achievements, optimizing for ATS when applicable.
    Follow any additional user instructions.
  `,
  SUMMARY: `
    Provide recommendations for improving the CV summary based on the job description.
    JOB DESCRIPTION: 
      Job title: {jobTitle}
      Summary: {jobSummary}
      Skills: {jobSkills}
      ATS: {jobAtsKeywords}
    CURRENT CV:
      Summary: {summary}
      Skills: {skills}
      Experience: {experience}
  `,
  TECHNICAL_SKILLS: `
    Provide recommendations for technical skills based on the job description.
    JOB DESCRIPTION:
      Skills: {jobSkills}
      ATS: {jobAtsKeywords}
    CURRENT CV:
      Skills: {skills}
      Experience: {experience}
    Review current technical skills, add any relevant from experience, and reorder based on relevance to job skills and ATS keywords.
  `,
  NON_TECHNICAL_SKILLS: `
    Provide recommendations for non-technical skills based on the job description.
    JOB DESCRIPTION:
      Skills: {jobSkills}
      ATS: {jobAtsKeywords}
    CURRENT CV:
      Skills: {skills}
      Experience: {experience}
    Review current non-technical skills, add any relevant from experience, and reorder based on relevance to job skills and ATS keywords.
  `,
  EXPERIENCE: `
    Provide recommendations for optimizing the CV experience item based on the job description.
    JOB DESCRIPTION:
      Summary: {jobSummary}
      Duties: {jobDuties}
      Qualifications: {jobQualifications}
      ATS: {jobAtsKeywords}
    CURRENT CV:
      Experience item: {experience}
  `,
};
