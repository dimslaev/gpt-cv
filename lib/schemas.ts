import { z } from "zod";

export const HeaderSectionSchema = z.object({
  name: z.string(),
  title: z.string(),
  contact: z.object({
    email: z.string().email(),
    website: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    phone: z.string().optional(),
  }),
});

export const SkillsSectionSchema = z.object({
  technical: z.array(z.string()).optional(),
  nonTechnical: z.array(z.string()).optional(),
});

export const ExperienceSectionSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string(),
  dates: z.string(),
  responsibilities: z.array(z.string()),
});

export const EducationSectionSchema = z.object({
  degree: z.string(),
  institution: z.string(),
  location: z.string(),
  dates: z.string(),
});

export const CertificateSectionSchema = z.object({
  title: z.string(),
  issuer: z.string(),
  link: z.string().url().optional(),
});

export const LanguageSectionSchema = z.object({
  language: z.string(),
  proficiency: z.string(),
  rating: z.number().optional(),
});

export const ProjectsSectionSchema = z.object({
  title: z.string(),
  link: z.string().url().optional(),
  description: z.string(),
});

export const CVSchema = z.object({
  header: HeaderSectionSchema,
  summary: z.string(),
  skills: SkillsSectionSchema,
  experience: z.array(ExperienceSectionSchema),
  education: z.array(EducationSectionSchema),
  certificates: z.array(CertificateSectionSchema),
  languages: z.array(LanguageSectionSchema),
  projects: z.array(ProjectsSectionSchema),
});

export const OptionalCVSchema = z.object({
  header: HeaderSectionSchema.optional(),
  summary: z.string().optional(),
  skills: SkillsSectionSchema.optional(),
  experience: z.array(ExperienceSectionSchema).optional(),
  education: z.array(EducationSectionSchema).optional(),
  certificates: z.array(CertificateSectionSchema).optional(),
  languages: z.array(LanguageSectionSchema).optional(),
  projects: z.array(ProjectsSectionSchema).optional(),
});

export const JobDescriptionSchema = z.object({
  jobTitle: z.string().optional(),
  jobSummary: z.string().optional(),
  jobDuties: z.array(z.string()).optional(),
  jobSkills: z.array(z.string()).optional(),
  jobAtsKeywords: z.array(z.string()).optional(),
});

export const RevisionSchema = z.object({
  result: z.array(z.string()),
  changes: z.array(z.string()),
  recommendations: z.array(z.string()),
});
