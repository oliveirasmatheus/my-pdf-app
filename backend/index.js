const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const libre = require("libreoffice-convert");

const app = express();
const PORT = process.env.PORT || 3001;

// Define the allowed origins (both prod and dev)
const allowedOrigins = [
  "https://arqwillianoliveira.com.br", // Frontend production domain
  "http://localhost:5173", // Local development domain
];

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      // Allow the request if origin is in the list or it's a non-browser request (like Postman)
      callback(null, true);
    } else {
      console.error("CORS error: Origin not allowed:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "OPTIONS"], // Allow GET, POST, and OPTIONS (preflight)
  allowedHeaders: ["Content-Type", "Authorization"], // Allow specific headers
  preflightContinue: true, // Make sure OPTIONS requests are handled correctly
};

// Apply the CORS middleware globally
app.use(cors(corsOptions));

// Parse JSON requests
app.use(express.json());

// Serve raw .docx templates
app.get("/templates/:name", (req, res) => {
  const name = req.params.name;
  const filePath = path.join(__dirname, "templates", `${name}.docx`);
  if (!fs.existsSync(filePath)) {
    console.error("Template not found:", filePath);
    return res.status(404).send("Template not found");
  }
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Error sending template:", err);
      res.status(err.status || 500).send("Failed to send template");
    }
  });
});

// Handle document generation
app.post("/generate", (req, res) => {
  const { templateName, data } = req.body;

  if (!templateName) {
    return res.status(400).send("Missing template name");
  }

  if (!data || typeof data !== "object") {
    return res.status(400).send("Missing or invalid data");
  }

  console.log("Data received for template:", data);

  const templatePath = path.join(__dirname, "templates", `${templateName}.docx`);

  if (!fs.existsSync(templatePath)) {
    return res.status(404).send(`Template '${templateName}.docx' not found`);
  }

  try {
    const template = fs.readFileSync(templatePath, "binary");
    const zip = new PizZip(template);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Convert all values to strings to avoid undefined/null errors
    const safeData = {};
    Object.keys(data).forEach((key) => {
      const val = data[key];
      safeData[key] = val !== undefined && val !== null ? String(val) : "";
    });

    try {
      doc.render(safeData);
    } catch (error) {
      if (error.properties && error.properties.errors) {
        error.properties.errors.forEach((e) => {
          console.error("Template error:", e.properties.explanation);
        });
      }
      console.error("Full template error:", error);
      return res.status(500).send("Failed to render the document.");
    }

    const buf = doc.getZip().generate({ type: "nodebuffer" });

    // Check if PDF is requested
    const wantsPdf = req.body.output === "pdf" || req.query.format === "pdf";
    if (wantsPdf) {
      try {
        libre.convert(buf, ".pdf", undefined, (err, pdfBuf) => {
          if (err) {
            console.error("PDF conversion failed:", err);
            return res.status(500).send("Failed to convert to PDF. Ensure LibreOffice is installed.");
          }
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Content-Disposition", `attachment; filename=${templateName}.pdf`);
          res.send(pdfBuf);
        });
        return;
      } catch (convErr) {
        console.error("Conversion error:", convErr);
        return res.status(500).send("PDF conversion error");
      }
    }

    // Default response is DOCX
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename=${templateName}.docx`);
    res.send(buf);
  } catch (err) {
    console.error("Document generation error:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
