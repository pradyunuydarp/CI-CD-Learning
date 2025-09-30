#!/usr/bin/env node

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const docsDir = path.join(projectRoot, "docs");
const artifacts = {
  changelog: path.join(projectRoot, "CHANGELOG.md"),
  reportTex: path.join(docsDir, "report.tex"),
  reportPdf: path.join(docsDir, "report.pdf"),
  submissionHtml: path.join(docsDir, "submission.html"),
};
const screenshotsDir = path.resolve(projectRoot, "..", "screenshots");

async function readFileSafe(targetPath) {
  try {
    return await fs.readFile(targetPath, "utf8");
  } catch (error) {
    return "";
  }
}

async function getLatestChangelogEntry() {
  const content = await readFileSafe(artifacts.changelog);
  if (!content.trim()) {
    return null;
  }
  const match = content.match(/## \[[^\]]+\][^]*?(?=\n## |$)/);
  if (!match) {
    return null;
  }
  const raw = match[0].trim();
  const [headingLine, ...restLines] = raw.split("\n");
  const bodyLines = restLines
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[-*]\s*/, ""));
  return {
    heading: headingLine.replace(/^##\s*/, ""),
    bullets: bodyLines,
  };
}

function sanitizeTexItem(text) {
  return text
    .replace(/\\texttt\{([^}]*)\}/g, "`$1`")
    .replace(/\\\\/g, "")
    .replace(/\\%/g, "%")
    .trim();
}

async function getReportSummary() {
  const tex = await readFileSafe(artifacts.reportTex);
  if (!tex.trim()) {
    return [];
  }
  const lines = tex.split(/\r?\n/);
  const items = [];
  for (const line of lines) {
    const match = line.match(/^\s*\\item\s+(.*)$/);
    if (!match) {
      continue;
    }
    items.push(sanitizeTexItem(match[1]));
  }
  return items;
}

async function getScreenshots() {
  try {
    const entries = await fs.readdir(screenshotsDir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && !entry.name.startsWith("."))
      .map((entry) => entry.name)
      .sort();
  } catch (error) {
    return [];
  }
}

function renderList(items, { className = "" } = {}) {
  if (!items.length) {
    return "<p class=\"muted\">No data recorded.</p>";
  }
  const cls = className ? ` class="${className}"` : "";
  const listItems = items
    .map((item) => `<li>${htmlEscape(item)}</li>`)
    .join("\n");
  return `<ul${cls}>${listItems}</ul>`;
}

function renderScreenshotList(items) {
  if (!items.length) {
    return "<p class=\"muted\">No screenshots found yet.</p>";
  }
  return (
    "<ul class=\"screenshot-list\">" +
    items
      .map((name) => {
        const relativePath = `../../screenshots/${name}`;
        return `  <li><a href="${relativePath}">${name}</a></li>`;
      })
      .join("\n") +
    "</ul>"
  );
}

function htmlEscape(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function buildHtml() {
  await fs.mkdir(docsDir, { recursive: true });

  const [latestChangelog, reportPoints, screenshots] = await Promise.all([
    getLatestChangelogEntry(),
    getReportSummary(),
    getScreenshots(),
  ]);

  const now = new Date();
  const generatedAt = now.toISOString();

  const changelogSection = latestChangelog
    ? `<h2>Latest Release</h2>
<p class="muted">${htmlEscape(latestChangelog.heading)}</p>
${renderList(latestChangelog.bullets, { className: "bullet-list" })}`
    : `<h2>Latest Release</h2><p class="muted">Changelog entry unavailable.</p>`;

  const reportSection = reportPoints.length
    ? `<h2>Highlights</h2>
${renderList(reportPoints, { className: "bullet-list" })}`
    : `<h2>Highlights</h2><p class="muted">Report data unavailable.</p>`;

  const screenshotSection = `<h2>Artifacts</h2>
<div class="artifact-links">
  <a href="report.pdf">Report PDF</a>
  <a href="report.tex">Report LaTeX</a>
  <a href="../CHANGELOG.md">CHANGELOG</a>
</div>
<h3>UI Evidence</h3>
${renderScreenshotList(screenshots)}`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>SciCalc Next Submission</title>
    <style>
      :root {
        color-scheme: dark;
        font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: #0f141f;
        color: #f5f9ff;
      }
      body {
        margin: 0;
        padding: 3rem 1.5rem 4rem;
        display: flex;
        justify-content: center;
      }
      main {
        max-width: 920px;
        width: 100%;
        background: rgba(18, 24, 36, 0.9);
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
        padding: clamp(2rem, 4vw, 3rem);
        display: grid;
        gap: clamp(1.8rem, 4vw, 2.6rem);
      }
      header h1 {
        margin: 0;
        font-size: clamp(2rem, 4vw, 2.8rem);
      }
      header p {
        margin: 0.35rem 0 0;
        color: rgba(255, 255, 255, 0.75);
      }
      section {
        display: grid;
        gap: 1rem;
      }
      h2 {
        margin: 0;
        font-size: clamp(1.3rem, 3vw, 1.7rem);
      }
      h3 {
        margin: 0;
        font-size: 1.1rem;
      }
      .muted {
        color: rgba(255, 255, 255, 0.65);
        margin: 0;
      }
      .bullet-list {
        margin: 0;
        padding-left: 1.1rem;
        display: grid;
        gap: 0.4rem;
      }
      .bullet-list li::marker {
        color: #4c8bf5;
      }
      .artifact-links {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      .artifact-links a {
        color: #d7e4ff;
        background: rgba(76, 139, 245, 0.2);
        border: 1px solid rgba(76, 139, 245, 0.45);
        padding: 0.45rem 0.9rem;
        border-radius: 999px;
        text-decoration: none;
        transition: background 0.2s ease, border 0.2s ease;
      }
      .artifact-links a:hover {
        background: rgba(76, 139, 245, 0.35);
        border-color: rgba(76, 139, 245, 0.75);
      }
      .screenshot-list {
        display: grid;
        gap: 0.4rem;
        margin: 0;
        padding-left: 1.1rem;
      }
      .screenshot-list a {
        color: #9ec4ff;
        text-decoration: none;
      }
      .screenshot-list a:hover {
        text-decoration: underline;
      }
      footer {
        font-size: 0.85rem;
        color: rgba(255, 255, 255, 0.5);
      }
      footer strong {
        color: rgba(255, 255, 255, 0.75);
      }
    </style>
  </head>
  <body>
    <main>
      <header>
        <h1>SciCalc Next Submission</h1>
        <p>Automatically generated overview of the project deliverables.</p>
      </header>
      <section>
        <h2>Snapshot</h2>
        <p class="muted">Generated on <strong>${generatedAt}</strong></p>
      </section>
      <section>
        ${changelogSection}
      </section>
      <section>
        ${reportSection}
      </section>
      <section>
        ${screenshotSection}
      </section>
      <footer>
        <p><strong>Note:</strong> Re-run <code>npm run report:submission</code> after major updates to refresh this document.</p>
      </footer>
    </main>
  </body>
</html>`;
}

async function main() {
  const html = await buildHtml();
  await fs.writeFile(artifacts.submissionHtml, html, "utf8");
  // eslint-disable-next-line no-console
  console.log(`Submission report written to ${artifacts.submissionHtml}`);
}

main().catch((error) => {
  console.error("Failed to generate submission report:", error);
  process.exitCode = 1;
});
