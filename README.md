# Moodle Course Extractor

This GitHub repository contains the Moodle Course Extractor application which allows you to extract course content from Moodle. The application provides an easy-to-use method of extracting course content and reformatting it into both an HTML file and a Google Docs file.

Please note, this application does not currently support the extraction of images due to the way Moodle handles file backups.

## Prerequisites

Before running this application, you will need to install the following:

- [Node.js](https://nodejs.org/en/download/)
- [npm](https://www.npmjs.com/get-npm) (comes bundled with Node.js)

## Installation

After you have installed Node.js and npm, clone the repository to your local machine:

```bash
git clone https://github.com/jschof1/moodle-course-extractor.git
cd moodle-course-extractor
```

Next, install the project dependencies:

```bash
npm install
```

## Usage

To use the Moodle Course Extractor application, follow these steps:

1. **Backup your Moodle Course**: In Moodle, navigate to the course you want to extract and create a backup. Download the backup to your local machine.
2. **Rename and Unzip the Backup**: Change the file extension of the downloaded backup from `.mbz` to `.zip`. Once the file extension has been changed, unzip the file.
3. **Locate the Activities Folder**: Inside the unzipped folder, look for the "activities" folder.
4. **Move the Activities Folder**: Drag the "activities" folder into the Moodle Course Extractor folder.
5. **Run the Application**: In your terminal, navigate to the Moodle Course Extractor folder and run the following command:

```bash
node xml-to-html
```

After running the command, the application will create two files: an HTML file containing the raw course content and a `.docx` file that can be imported directly into Google Drive.

## Limitations

Please note that the current version of this application does not support the extraction of images. This is due to how Moodle handles file backups, which prevents images from being included in the backup.

## Contributing

Contributions to the Moodle Course Extractor are welcomed. To contribute, please submit a pull request.

## License

This project is licensed under the MIT License. For more details, see the [LICENSE](./LICENSE) file.

## Contact

If you have any questions or issues, please submit an issue in this repository.
