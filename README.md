# YAML CV

Manage multiple versions of your CV and tailor them for specific job descriptions using ChatGPT (requires an OpenAI API key in .env).

### Folder Structure

```
/yaml                   # Your YAML CV files
    ├── base.yaml       # Base version of your CV
    ├── version1.yaml   # Custom version 1 of your CV
    └── version2.yaml   # Custom version 2 of your CV

/template               # HTML templates for rendering CVs
/html                   # Output directory for generated HTML files
```

### Commands

#### Build HTML files

Converts the base and versioned YAML CVs into HTML files, which are saved in the html folder.

```
yarn build
```

#### Generate tailored recommendations

Based on a specific job description file (`job-description.yaml`), this script generates a list of recommendations for tailoring the CV, saved in a new YAML file. The recommendations specify updates for each CV section, helping you adjust content effectively.

```
yarn tailor
```
