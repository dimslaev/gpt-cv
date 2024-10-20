# Markdown CV

Manage multiple versions of your CV and customize them for specific job descriptions using ChatGPT (requires OpenAI API key in `.env`).

### Folder Structure

```
/markdown          # Your markdown CV files
    └── base       # Base version of CV
    ├── version1   # Overrides for version 1
    └── version2   # Overrides for version 2

/template          # HTML templates for rendering
/html              # Output directory for generated HTML files
```

### Commands

Watch for changes in the `markdown` and `template` folders.

```
yarn dev
```

Build html files in html folder once.

```
yarn build
```

Generate cv based on specific job description in `./job-description.txt`. This will generate a new folder inside `markdown` that you can further edit as necessary.

```
yarn generate-cv
```

### Save PDF

Open any of the generated files from `html` folder in your browser and use `cmd + p` to print the page.
