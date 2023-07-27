const path = require("path");
const fs = require("fs");
const util = require("util");
const xml2js = require("xml2js");
const htmlToDocx = require("html-to-docx");
const sanitizeHtml = require("sanitize-html");
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const readdir = util.promisify(fs.readdir);

async function convertHtmlToDocx(html) {
  const buffer = await htmlToDocx(html);
  fs.writeFileSync("output.docx", buffer);
}

function sanitizeContent(htmlContent) {
  const allowedTags = sanitizeHtml.defaults.allowedTags.filter(
    (tag) => tag !== "img"
  );
  return sanitizeHtml(htmlContent, { allowedTags });
}

let contents = [];

async function convertXmlToHtml(xml) {
  const parser = new xml2js.Parser();
  const json = await parser.parseStringPromise(xml);

  let content = "";
  let type = "";

  if (json.activity && json.activity.page && json.activity.page[0].content) {
    content = json.activity.page[0].content[0];
    type = "Page Activity";
  } else if (
    json.activity &&
    json.activity.scorm &&
    json.activity.scorm[0].intro
  ) {
    content = json.activity.scorm[0].intro[0];
    type = "Scorm Activity";
  }

  const html = `${content}`;

  return html;
}

async function processDirectory(dir) {
  const entries = await readdir(dir, { withFileTypes: true });

  const pageAndScormDirs = entries.filter(
    (entry) =>
      entry.isDirectory() &&
      (entry.name.startsWith("page_") || entry.name.startsWith("scorm_"))
  );

  pageAndScormDirs.sort((a, b) => {
    const numA = Number(a.name.split("_")[1]);
    const numB = Number(b.name.split("_")[1]);
    return numA - numB;
  });

  for (const dirent of pageAndScormDirs) {
    const fullPath = path.join(dir, dirent.name);
    const subEntries = await readdir(fullPath, { withFileTypes: true });
    const xmlFiles = subEntries.filter(
      (entry) => entry.isFile() && path.extname(entry.name) === ".xml"
    );

    for (const file of xmlFiles) {
      const xmlPath = path.join(fullPath, file.name);
      const xml = await readFile(xmlPath, "utf-8");
      const html = await convertXmlToHtml(xml);
      contents.push(html);
    }
  }
}
const activitiesPath = path.join(__dirname, "activities");
processDirectory(activitiesPath)
  .then(() => {
    const htmlContent = contents.join('\n');
    const sanitizedHtmlContent = sanitizeContent(htmlContent);
    return writeFile('extract.html', sanitizedHtmlContent)
        .then(() => convertHtmlToDocx(sanitizedHtmlContent));
  })
  .catch(console.error);
