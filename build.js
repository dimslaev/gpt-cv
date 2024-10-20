import path from "path";
import fs from "fs/promises";
import { marked } from "marked";
import { paths, SECTION_ORDER } from "./config.js"; // Import the config

// Wraps the HTML content of a markdown file into a section and its subsections (h3) into articles
export const wrapSection = (filename, html) => {
  const sectionName = filename.split("-")[1].replace(".md", "");
  let result = `<section class="${sectionName}">\n`;

  // Split the content by h3 tags and wrap each h3 and its content in an <article> tag
  const articleWrappedHtml = html
    .split(/(<h3[^>]*>.*<\/h3>)/g) // Split on h3 tags
    .map((part, index) => {
      if (part.startsWith("<h3")) {
        return `<article>\n${part}\n`; // Start an article for h3
      } else if (
        index > 0 &&
        html.split(/(<h3[^>]*>.*<\/h3>)/g)[index - 1].startsWith("<h3")
      ) {
        return `${part}\n</article>\n`; // End the article after the content
      } else {
        return part; // Return any content that is not part of h3 section
      }
    })
    .join("");

  result += articleWrappedHtml;
  result += "</section>\n";

  return result;
};

// Reads Markdown files from a directory, converts them to HTML, and organizes them by section.
export const getInnerHtml = async (dir, filenames, baseFiles = {}) => {
  for (const filename of filenames) {
    if (!filename.startsWith("_") && SECTION_ORDER.includes(filename)) {
      const file = await fs.readFile(
        path.join(paths.markdown, dir, filename),
        "utf-8"
      );
      const html = marked.parse(file.toString());
      baseFiles[filename] = wrapSection(filename, html); // Overwrite or add the file
    }
  }
  return baseFiles;
};

// Reads the template file, inserts the inner HTML content, and returns the complete HTML document.
export const getOuterHtml = async (html) => {
  const template = await fs.readFile(
    path.join(paths.template, "template.html"),
    "utf-8"
  );
  return template.replace("{{ content }}", html);
};

// Builds HTML files from Markdown content and templates.
// For each directory (except __base), it outputs an HTML file that contains base + overwrites.
export const build = async () => {
  const dirs = await fs.readdir(paths.markdown);

  // Start by processing __base directory
  const baseDir = "__base";
  let baseFiles = {};

  if (dirs.includes(baseDir)) {
    const baseFilenames = await fs.readdir(path.join(paths.markdown, baseDir));
    baseFiles = await getInnerHtml(baseDir, baseFilenames, baseFiles); // Collect base files
  }

  // Process other directories
  const otherDirs = dirs.filter((dir) => dir !== baseDir);

  await Promise.all(
    otherDirs.map(async (dir) => {
      const filenames = await fs.readdir(path.join(paths.markdown, dir));

      // Clone the baseFiles to avoid overwriting them for each dir
      let dirFiles = { ...baseFiles };

      // Overwrite base files with the current directory files
      dirFiles = await getInnerHtml(dir, filenames, dirFiles);

      // Combine all the dirFiles in the specified SECTION_ORDER
      const innerHtml = SECTION_ORDER.filter((section) => dirFiles[section]) // Only include files that exist
        .map((section) => dirFiles[section]) // Order them correctly
        .join("");

      const outerHtml = await getOuterHtml(innerHtml);

      // Write the final HTML output for this directory
      await fs.writeFile(path.join(paths.html, `${dir}.html`), outerHtml);
    })
  );
};

build().catch(console.error);
