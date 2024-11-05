import path from "path";
import fs from "fs/promises";
import { paths, SECTION_ORDER } from "./lib/config";
import * as wrappers from "./lib/wrappers";
import { CV } from "./lib/interfaces";
import { parseFile } from "./lib/utils";
import { CVSchema, OptionalCVSchema } from "./lib/schemas";

class CVBuilder {
  getInnerHtml(sections: CV): string {
    return SECTION_ORDER.map((section) => {
      switch (section) {
        case "header":
          return wrappers.wrapHeader(sections.header);
        case "summary":
          return wrappers.wrapSummary(sections.summary);
        case "skills":
          return wrappers.wrapSkills(sections.skills);
        case "experience":
          return wrappers.wrapExperience(sections.experience);
        case "education":
          return wrappers.wrapEducation(sections.education);
        case "certificates":
          return wrappers.wrapCertificates(sections.certificates);
        case "languages":
          return wrappers.wrapLanguages(sections.languages);
        default:
          return "";
      }
    }).join("\n");
  }

  getOuterHtml(template: string, innerHtml: string): string {
    return template.replace("{{ content }}", innerHtml);
  }

  async build(): Promise<void> {
    const files = await fs.readdir(paths.yaml);
    const baseFile = path.join(paths.yaml, "_base.yaml");
    const baseSections = await parseFile<CV>(baseFile, OptionalCVSchema);
    const versionFiles = files.filter((file) => file !== "_base.yaml");
    const template = await fs.readFile(
      path.join(paths.template, "template.html"),
      "utf-8"
    );

    await Promise.all(
      versionFiles.map(async (versionFile) => {
        const versionPath = path.join(paths.yaml, versionFile);
        const versionSections = await parseFile<Partial<CV>>(
          versionPath,
          CVSchema.partial()
        );
        const sectionData = { ...baseSections, ...versionSections };

        const innerHtml = this.getInnerHtml(sectionData);
        const outerHtml = this.getOuterHtml(template, innerHtml);

        const outputFileName = versionFile.replace(".yaml", ".html");
        await fs.writeFile(path.join(paths.html, outputFileName), outerHtml);
      })
    );
  }
}

new CVBuilder().build().catch(console.error);
