import { CV } from "./interfaces";
import { stripHttp } from "./utils";

export function wrapHeader(header: CV["header"]): string {
  return `
      <section class="header">
        <h1>${header.name}</h1>
        <h2>${header.title}</h2>
        <ul>
        <li><a href="mailto:${header.contact.email}">${
    header.contact.email
  }</a></li>
        ${
          header.contact.website
            ? `<li><a href="${header.contact.website}">${stripHttp(
                header.contact.website
              )}</a></li>`
            : ""
        }
        ${
          header.contact.linkedin
            ? `<li><a href="${header.contact.linkedin}">${stripHttp(
                header.contact.linkedin
              )}</a></li>`
            : ""
        }
        ${
          header.contact.phone
            ? `<li><a href="tel:${header.contact.phone}">${stripHttp(
                header.contact.phone
              )}</a></li>`
            : ""
        }
      </section>`;
}

export function wrapSummary(summary: string): string {
  return `
      <section class="summary">
        <h3>Summary</h3>
        <p>${summary}</p>
      </section>`;
}

export function wrapSkills(skillCategory: CV["skills"]): string {
  return `
      <section class="skills">
        <h3>Skills</h3>
        ${Object.keys(skillCategory)
          .map((key) => {
            const skills = skillCategory[key as keyof CV["skills"]]!;
            return `
              <article>
                <strong>${
                  key === "technical" ? "Technical" : "Soft skills"
                }:</strong>
                  ${
                    skills.map((skill) => `<span>${skill}</span>`).join(", ") ??
                    ""
                  }
              </article>`;
          })
          .join("\n")}
      </section>`;
}

export function wrapExperience(experience: CV["experience"]): string {
  return `
      <section class="experience">
        <h3>Experience</h3>
        ${experience
          .map(
            (job) => `
            <article>
              <h4>${job.title} | ${job.company}</h4>
              <p>${job.location} | ${job.dates}</p>
              <ul>
                ${job.responsibilities
                  .map((item) => `<li>${item}</li>`)
                  .join("\n")}
              </ul>
            </article>`
          )
          .join("\n")}
      </section>`;
}

export function wrapEducation(education: CV["education"]): string {
  return `
      <section class="education">
        <h3>Education</h3>
        ${education
          .map(
            (edu) => `
            <article>
              <h4>${edu.degree}</h4>
              <p>${edu.institution}, ${edu.location} | ${edu.dates}</p>
            </article>`
          )
          .join("\n")}
      </section>`;
}

export function wrapCertificates(certificates: CV["certificates"]): string {
  return `
      <section class="certificates">
        <h3>Certificates</h3>
        <ul>
          ${certificates
            .map(
              (cert) => `
              <li>
                ${
                  cert.link
                    ? `<a href="${cert.link}">${cert.title}</a>`
                    : cert.title
                }
                - ${cert.issuer}
              </li>`
            )
            .join("\n")}
        </ul>
      </section>`;
}

export function wrapLanguages(languages: CV["languages"]): string {
  return `
      <section class="languages">
        <h3>Languages</h3>
        <ul>
          ${languages
            .map(
              (lang) =>
                `<li>${lang.language}: ${lang.proficiency} ${
                  lang.rating ? `(${lang.rating}/5)` : ""
                }</li>`
            )
            .join("\n")}
        </ul>
      </section>`;
}
