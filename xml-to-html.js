import path from 'path';
import fs from 'fs';
import util from 'util';
import xml2js from 'xml2js';

// Use util.promisify to convert callback-based functions to Promise-based.
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const readdir = util.promisify(fs.readdir);

let contents = []; // To store the contents of all files

async function convertXmlToHtml(xml) {
    // Convert XML to JSON
    const parser = new xml2js.Parser();
    const json = await parser.parseStringPromise(xml);
    // Extract the content field
    let content = "";
    let type = "";

    // Handle 'page' activity
    if (json.activity && json.activity.page && json.activity.page[0].content) {
        content = json.activity.page[0].content[0];
        type = "Page Activity";
    }

    // Handle 'scorm' activity
    else if (json.activity && json.activity.scorm && json.activity.scorm[0].intro) {
        content = json.activity.scorm[0].intro[0];
        type = "Scorm Activity";
    }

    // Prepend the type to the content
    if(content){
        content = `<h2>${type}</h2>\n${content}`;
    }

    // TODO: Convert content to HTML
    // Depending on your needs, you might want to wrap `content` in some basic HTML tags
    const html = `${content}`; 

    return html;
}

async function processDirectory(dir) {
    const entries = await readdir(dir, { withFileTypes: true });

    // Filter out directories that start with 'page_' or 'scorm_'
    const pageAndScormDirs = entries.filter(entry => entry.isDirectory() && (entry.name.startsWith('page_') || entry.name.startsWith('scorm_')));

    // Extract the trailing number from the directory name, convert it to a number, and sort
    pageAndScormDirs.sort((a, b) => {
        const numA = Number(a.name.split('_')[1]);
        const numB = Number(b.name.split('_')[1]);
        return numA - numB;
    });

    // Loop over the sorted directories
    for (const dirent of pageAndScormDirs) {
        const fullPath = path.join(dir, dirent.name);
        const subEntries = await readdir(fullPath, { withFileTypes: true });
        const xmlFiles = subEntries.filter(entry => entry.isFile() && path.extname(entry.name) === '.xml');

        for (const file of xmlFiles) {
            const xmlPath = path.join(fullPath, file.name);
            const xml = await readFile(xmlPath, 'utf-8');
            const html = await convertXmlToHtml(xml);
            contents.push(html);
        }
    }
}

processDirectory('/Users/jackschofield/Downloads/moodle-odi-scarper/course/activities')
    .then(() => {
        // Write all contents to file.html
        return writeFile('file.html', contents.join('\n'));
    })
    .catch(console.error);
