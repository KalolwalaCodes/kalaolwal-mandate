const express = require("express");
const { exec } = require("child_process");
const bodyParser = require("body-parser");
const { Poppler } = require("node-poppler");
const cheerio = require("cheerio");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const { launch } = require("puppeteer");
const { rm, mkdirSync, existsSync } = require("fs");
const app = express();
const port = 4000;
if (!existsSync("output")) mkdirSync("output");

const upload = multer({ dest: "uploads/" });

// Serving the static files
app.use(express.static("static"));

// Middleware to parse JSON bodies
app.use(express.json({ limit: "10mb" }));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(cors("*"));
const inputPath = "./Proposal Template_Non AR.docx";
const outputPath = "./demo_new_final_Updated_Proposal_Template.docx";
const headerImagePath = path.resolve("./static/header.jpg");

const oldText = [
  "KAPL/__/25-26",
  "__/__/20__",
  "________________ a Company",
  "its corporate office at __________ ",
  "the business of _______________",
  "shall be Kolkata/ ____________",
  "Name: ___________________",
  "Designation: ________________",
  "Date: ___/___/20___",
];

app.post("/api/download", (req, res) => {
  const { newText } = req.body;
  console.log(newText, "-----the new text is ------------", req.body);
  const finalText = [
    `KAPL/${newText.kaplNumber}`,
    `${newText.agreementDate}`,
    `${newText.clientName} a Company`,
    `its corporate office at ${newText.clientOffice}`,
    `the business of ${newText.clientBusiness}`,
    `shall be Kolkata/ ${newText.arbitrationPlace}`,
    `Name: ${newText.makerName}`,
    `Designation: ${newText.kaplNumber}`,
    `Date: ${newText.signatureDate}`,
  ];
  console.log(
    finalText,
    "-----the final text is ------------",
    newText,
    typeof finalText,
    typeof newText
  );
  if (!Array.isArray(finalText) || finalText.length !== oldText.length) {
    return res.status(400).json({
      error:
        "Invalid input: `newText` must be an array with the same length as `oldText`.",
    });
  }

  // const inputPath = path.resolve("./input.docx"); // Replace with your input file path
  // const outputPath = path.resolve("./output.docx"); // Replace with your desired output file path

  const command = `python3 ./python/replacetext.py "${inputPath}" "${outputPath}" '${JSON.stringify(
    oldText
  )}' '${JSON.stringify(finalText)}'`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    console.log(`stdout: ${stdout}`);

    // Send the updated file for download
    res.download(outputPath, "updated-document.docx", (err) => {
      if (err) {
        console.error("Error sending file:", err);
        return res.status(500).json({ error: "Failed to send updated file." });
      }
    });
  });
});

app.post("/api/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  convertToHtml(file.path).then((outputFile) => {
    fs.readFile(outputFile, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading file:", err);
        return;
      }

      // Load the HTML into cheerio
      const $ = cheerio.load(data);

      // Extract text from all paragraph tags
      let paragraphs = [];
      $("p").each((index, element) => {
        paragraphs.push($(element).html().trim().toString());
      });
      paragraphs = paragraphs.filter((line) => line.trim().length > 0);

      res.send(paragraphs);
    });

    // Deleting all the files created
    fs.readdirSync(path.resolve("./uploads")).forEach((f) => {
      if (f.startsWith(file.filename)) {
        fs.unlinkSync(path.resolve(`./uploads/${f}`));
      }
    });
  });
});

app.post("/convert/html", (req, res) => {
  const htmlContent = req.body.html;

  convertToPdf(htmlContent).then((path) => {
    fs.readFile(path, null, (err, file) => {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Length", file.byteLength);
      res.setHeader("Content-Disposition", "attachment; filename=download");
      res.write(file, "binary", (error) => rm(path, () => {}));
    });
  });
});

/**
 *
 * @param {string} file Takes path to a PDF file.
 * @returns path to the HTML file.
 * Takes a pdf file and generates an HTML file.
 */
const convertToHtml = async (file) => {
  const poppler = new Poppler();
  const outputFile = path.resolve(`${file}.html`);
  await poppler.pdfToHtml(path.resolve(file), outputFile, {
    ignoreImages: true,
    singlePage: true,
  });
  return path.resolve(`${file}-html.html`);
};

async function convertToPdf(htmlContent) {
  // Launch a headless browser
  const browser = await launch({ headless: true });
  const page = await browser.newPage();
  const outputFile = `./output/${Math.round(Math.random() * 1000000)}.pdf`;

  // Set content (HTML string)
  await page.setContent(`${htmlContent}`, { waitUntil: "domcontentloaded" });

  await page.waitForFunction(() => {
    const cells = document.getElementsByTagName("td");
    for (let i = 0; i < cells.length; i++) {
      cells[i].style.border = "1px solid black"
    }
    const headings = document.getElementsByTagName("th")
    for (let i = 0; i < headings.length; i++) {
      headings[i].style.border = "1px solid black"
    }
    const tables = document.getElementsByTagName("table")
    for (let i = 0; i < tables.length; i++) {
      tables[i].style.borderCollapse = "collapse"
    }
    return 1;
  });
  // Generate PDF
  await page.pdf({
    path: outputFile, // Save as file
    printBackground: true, // Include background styles
    margin: { top: "150px", bottom: "30px", left: "35px", right: "35px" },
    preferCSSPageSize: true,
    waitForFonts: true,
    height: "1128px",
    width: "800px",
    displayHeaderFooter: true,
    headerTemplate: `<div style="height: 120px; width: 100%; font-size: 16px; font-family: Arial, Helvetica, sans-serif; margin-left:50px; margin-right: 50px; display: flex; justify-content: space-between; align-items: center; width:100%">
  <div style="display: flex; flex-direction: column;">
  <img height="100%" style="width: 100%;" src="data:image/png;base64,${base64Encode(
    headerImagePath
  )}"/>
</div>
`,
    footerTemplate: "<span></span>",
  });

  // Close the browser
  await browser.close();

  return outputFile;
}

app.get("/hello", (req, res) => {
  res.json(JSON.stringify({ name: "Sumit" }));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

function base64Encode(file) {
  return fs.readFileSync(file, { encoding: "base64" });
}
