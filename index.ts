import { Builder } from "./modules/builder";
import { Generator } from "./modules/generator";

const args = process.argv.slice(2);

(async () => {
  const arg = args.find((it) => it.startsWith("--m="));
  const module = arg?.split("=")[1] || "builder";

  if (module === "builder") {
    const builder = new Builder();
    await builder.build();
  } else {
    console.log("Starting generation... ");

    const generator = new Generator();
    await generator.init();
    // console.log("Summarized job description: \n:", generator.jobDescription);

    // Generate CV sections separately
    await generator.generateSummary();
    await generator.generateTechnicalSkills();
    await generator.generateNonTechnicalSkills();
    await generator.generateExperience();

    // Or generate all sections at once
    // await generator.generateCustomCV();

    await generator.writeToYaml();

    // Logs
    const logs = generator.logs;
    process.stdout.write(JSON.stringify(logs, null, 2) + "\n");
  }
})();
