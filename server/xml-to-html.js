const path = require("path");
const fs = require("fs");
const util = require("util");
const xml2js = require("xml2js");
const htmlToDocx = require("html-to-docx");
const sanitizeHtml = require("sanitize-html");
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const readdir = util.promisify(fs.readdir);
const cheerio = require("cheerio");

async function convertHtmlToDocx(html) {
  if (!html || html.trim() === '') {
    console.error('No HTML content to convert to Docx');
    return;
  }
  try {
    const buffer = await htmlToDocx(html);
    await fs.promises.writeFile(path.join(__dirname, "..", "output", "output.docx"), buffer);
  } catch (error) {
    console.error('Error converting HTML to Docx: ', error);
  }
}

function sanitizeContent(htmlContent) {
    const allowedTags = sanitizeHtml.defaults.allowedTags.filter(
      (tag) => tag !== "img" && tag !== "span"
    );
  return sanitizeHtml(htmlContent, { allowedTags });
}
function removeDuplicateHeadings(content) {
    const $ = cheerio.load(content);
  
    $('h2').each(function() {
      const h2Text = $(this).text().trim();
  
      $(this).next('section').find('h4').each(function() {
        const h4Text = $(this).text().trim();
        
        if (h2Text === h4Text) {
          $(this).remove();
        }
      });
    });
  
    return $.html();
  }
function downgradeHeadings(content) {
    const $ = cheerio.load(content);
    const highestHeadingNumber = 6; // HTML allows headings h1 to h6

    for(let i = highestHeadingNumber; i > 0; i--) {
        $(`h${i}`).each(function () {
            $(this).replaceWith(`<h${i+1}>${$(this).html()}</h${i+1}>`);
        });
    }
    
    $("h7").each(function () {
        $(this).replaceWith(`<h6>${$(this).html()}</h6>`);
    });

    return $.html();
}

let contents = [];

async function convertXmlToHtml(xml) {
    const parser = new xml2js.Parser();
    const json = await parser.parseStringPromise(xml);
    
    let content = "";
    let type = "";
    let html = "";
  
    if (json.activity && json.activity.page && json.activity.page[0].content) {
      content = json.activity.page[0].content[0];
      type = "Page Activity";
      html = '<h1>' + json.activity.page[0].name + '</h1>';
    } else if (
      json.activity &&
      json.activity.scorm &&
      json.activity.scorm[0].intro
    ) {
      content = json.activity.scorm[0].intro[0];
      type = "Scorm Activity";
    }
  
    // Remove the div class="banner-img"
    const $ = cheerio.load(content);
    $(".banner-img").remove();
    content = $.html();
  
    html += `${content}`;
  
    // Downgrade headings
    html = downgradeHeadings(html);
    html = removeDuplicateHeadings(html);
  
    return html;
  }
  
module.exports = {
  processDirectory: async function (dir) {
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
  },
  convertFiles: async function (activitiesPath) {
    try {
      await this.processDirectory(activitiesPath);
      const htmlContent = contents.join("\n");
      const sanitizedHtmlContent = sanitizeContent(htmlContent);
      await fs.promises.writeFile(path.join(__dirname, "..", "output", "output.html"), sanitizedHtmlContent);
      await convertHtmlToDocx(sanitizedHtmlContent);
    } catch (err) {
      console.error("Error converting files:", err);
    }
  },
};