const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const libre = require('libreoffice-convert');

const app = express();
const PORT = process.env.PORT || 3001;

// List of allowed origins (production and local dev)
const allowedOrigins = [
  'https://arqwillianoliveira.com.br',  // Production frontend domain
  'http://localhost:5173',              // Local development frontend domain
];

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);  // Allow the request from the allowed origin
    } else {
      console.error("CORS error: Origin not allowed:", origin);
      callback(new Error('Not allowed by CORS'));  // Deny the request if origin is not allowed
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],  // Allow these HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'],  // Allow these headers in the request
  preflightContinue: false,  // Preflight request handling is done by the middleware
};

// Use CORS middleware globally with the configured options
app.use(cors(corsOptions));

// Middleware to parse JSON bodies
app.use(express.json());

// Serve .docx templates for download
app.get('/templates/:name', (req, res) => {
  const name = req.params.name;
  const filePath = path.join(__dirname, 'templates', `${name}.docx`);

  if (!fs.existsSync(filePath)) {
    console.error('Template not found:', filePath);
    return res.status(404).send('Template not found');
  }

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error sending template:', err);
      res.status(err.status || 500).send('Failed to send template');
    }
  });
});

// POST route to generate documents (DOCX or PDF)
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
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

    // Convert all values to strings to avoid errors with undefined or null
    const safeData = {};
    Object.keys(data).forEach((key) => {
      const val = data[key];
      safeData[key] = val !== undefined && val !== null ? String(val) : "";
    });

    // Render the document with the safe data
    try {
      doc.render(safeData);
    } catch (error) {
      if (error.properties && error.properties.errors) {
        error.properties.errors.forEach((e) => {
          console.error("Template error:", e.properties.explanation);
        });
      }
      console.error("Template rendering error:", error);
      return res.status(500).send("Failed to render document.");
    }

    const buf = doc.getZip().generate({ type: "nodebuffer" });

    // Check if client requested PDF (by body.output or query.format)
    const wantsPdf = (req.body && req.body.output === 'pdf') || (req.query && req.query.format === 'pdf');
    if (wantsPdf) {
      try {
        libre.convert(buf, '.pdf', undefined, (err, pdfBuf) => {
          if (err) {
            console.error('Conversion to PDF failed. Is LibreOffice installed on the host?', err);
            return res.status(500).send('Failed to convert to PDF. Ensure LibreOffice is installed on the server.');
          }
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename=${templateName}.pdf`);
          res.send(pdfBuf);
        });
        return;
      } catch (convErr) {
        console.error('Conversion error', convErr);
        return res.status(500).send('PDF conversion error');
      }
    }

    // Default response: send DOCX file
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
