import path from "path";
import fs from "fs/promises";
import { marked } from "marked";

const basePath = process.cwd();
const mdPath = path.join(basePath, "markdown");
const htmlPath = path.join(basePath, "html");
const templatePath = path.join(basePath, "template");

const EXTRACT_NAME_REGEX = /^(\d+)-([a-zA-Z]+)\.md$/;
const SUB_FILENAME_REGEX = /(\d+\.\d+)/;

/**
 * Wraps html from individual files depending on the filename / folder structure.
 * If file is on root level, e.g. `3-skills.md` wraps contents inside a `<section>`.
 * If file is one level deeper, `3.1-expert.md` wraps contents inside an `<article>`.
 *
 * @param {string} filename - The name of the Markdown file.
 * @param {number} index - The index of the current filename in the array.
 * @param {string} html - The HTML content generated from the Markdown file.
 * @returns {string} The formatted HTML section or article.
 */
export const addSections = (filenames, index, html) => {
  const isRootFile = !SUB_FILENAME_REGEX.test(filenames[index]);
  const nextIsRoot =
    !filenames[index + 1] || !SUB_FILENAME_REGEX.test(filenames[index + 1]);

  let result = "";

  if (isRootFile) {
    const className = filenames[index].match(EXTRACT_NAME_REGEX)[2];
    result += `<section class="${className}">\n`;
  } else {
    result += "<article>";
  }

  result += html;

  if (!isRootFile) {
    result += "</article>";
  }

  if (nextIsRoot) {
    result += "</section>\n";
  }

  return result;
};

/**
 * Reads Markdown files, converts them to HTML, and organizes them into sections and articles.
 *
 * @param {string} dir - The directory containing Markdown files.
 * @param {string[]} filenames - An array of Markdown file names in the directory.
 * @returns {Promise<string>} A promise that resolves to the formatted inner HTML content.
 */
export const getInnerHtml = async (dir, filenames) => {
  const htmlArray = await Promise.all(
    filenames.map(async (filename, index) => {
      const file = await fs.readFile(path.join(mdPath, dir, filename));
      const html = marked.parse(file.toString());
      return addSections(filenames, index, html);
    })
  );

  return htmlArray.join("");
};

/**
 * Reads the template file, inserts the inner HTML content, and returns the complete HTML document.
 *
 * @param {string} html - The formatted inner HTML content.
 * @returns {Promise<string>} A promise that resolves to the complete HTML document.
 */
export const getOuterHtml = async (html) => {
  const template = await fs.readFile(
    path.join(templatePath, "template.html"),
    "utf-8"
  );
  return template.replace("{{ content }}", html);
};

/**
 * Builds HTML files from Markdown content and templates.
 *
 * @returns {Promise<void>} A promise that resolves when the HTML files are successfully built.
 */
export const build = async () => {
  const dirs = await fs.readdir(mdPath);

  await Promise.all(
    dirs.map(async (dir) => {
      const filenames = await fs.readdir(path.join(mdPath, dir));
      const innerHtml = await getInnerHtml(dir, filenames);
      const outerHtml = await getOuterHtml(innerHtml);
      await fs.writeFile(path.join(htmlPath, `${dir}.html`), outerHtml);
    })
  );
};

build();
