# Moodle Document Extractor

This is a web-based application to extract the text from Moodle pages and SCORM activities from Moodle backup files (.mbz) and convert them into a .docx document.

The application uses a React-based frontend for the user interface and a Node.js backend for file handling and conversion.

## Getting Started

### Prerequisites

- Node.js
- npm

### Installing

1. Clone this repository:

   ```
   git clone https://github.com/jschof1/moodle-course-extractor.git
   ```
2. Navigate into the project directory:

   ```
   cd moodle-course-extractor
   ```
3. Install the dependencies for the server:

   ```
   cd server
   npm install
   ```
4. Install the dependencies for the client:

   ```
   cd ../client
   npm install
   ```

### Running the Application

1. Start the backend server:

   ```
   cd ../server
   npm start
   ```

   The backend server will start on `http://localhost:1001`.
2. In a new terminal, start the frontend client:

   ```
   cd ../client
   npm run dev
   ```

   The frontend client will start on `http://localhost:5174`.

## Usage

1. On the homepage, click the "Upload" button and select the Moodle backup file (.mbz) that you wish to convert. Note: If your Moodle backup file has a .mbz extension, you will first need to change the file extension to .zip, then rezip the contents of the archive.
2. Click the "Download" button. The application will upload the file, extract the relevant contents, convert them to a .docx format, and initiate a download of the resulting document.

## File Structure

```
.
├── client
│   ├── README.md
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── public
│   │   └── vite.svg
│   ├── src
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── assets
│   │   │   └── react.svg
│   │   ├── index.css
│   │   └── main.jsx
│   └── vite.config.js
├── output
│   └── output.docx
└── server
    ├── README.md
    ├── package-lock.json
    ├── package.json
    ├── route.js
    └── xml-to-html.js
```

- The `client` directory contains the frontend of the application, created with React. The entry point of the application is `main.jsx` and the main application component is in `App.jsx`.
- The `server` directory contains the backend of the application, implemented with Node.js. The main server file is `route.js`, which handles the file upload, extraction, and conversion processes.
- The `output` directory is where the converted .docx file will be saved.

## Built With

- React
- Node.js
- Express
- Multer
- Unzipper

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Authors

- [jschof1](https://github.com/jschof1)

See also the list of [contributors](https://github.com/jschof1/moodle-course-extractor/contributors) who participated in this project.
