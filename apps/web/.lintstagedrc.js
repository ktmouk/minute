const path = require("path");
const { ESLint } = require("eslint");

// https://github.com/okonet/lint-staged#how-can-i-ignore-files-from-eslintignore
const removeIgnoredFiles = async (files) => {
  const eslint = new ESLint();
  const isIgnored = await Promise.all(
    files.map((file) => {
      return eslint.isPathIgnored(file);
    }),
  );
  return files.filter((_, i) => !isIgnored[i]);
};

const buildEslintCommand = async (filenames) => {
  const targets = await removeIgnoredFiles(filenames);
  if (targets.length <= 0) return [];

  return `next lint --max-warnings=0 --fix --file ${targets
    .map((f) => path.relative(__dirname, f))
    .join(" --file ")}`;
};

module.exports = {
  "*.{ts,tsx,js,jsx,mjs}": [buildEslintCommand, "prettier -w -u"],
  "*.{md,html,css,scss,json,yml,yaml}": ["prettier -w -u"],
};
