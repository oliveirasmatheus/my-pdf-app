const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const libre = require('libreoffice-convert');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS setup - allow requests only from your domain
const corsOptions = {
  origin: 'https://arqwillianoliveira.com.br', // Specify the allowed origin
  methods: ['GET', 'POST'], // Allow only GET and POST methods
  allowedHeaders: ['Content-Type'], // Allow only specific headers
};

// Use CORS middleware with the options defined above
app.use(cors(corsOptions));

app.use(express.json());

// Serve raw .docx templates so frontend can fetch them (e.g. GET /templates/procuracao)
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

app.post("/generate", (req, res) => {
  const { templateName, data } = req.body;

  if (!templateName) {
    return res.status(400).send("Missing template name");
  }

  if (!data || typeof data !== "object") {
    return res.status(400).send("Missing or invalid data");
  }

  console.log("Data recebida para template:", data);

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

    // Converte todos os valores para string para evitar erros com undefined/null
    const safeData = {};
    Object.keys(data).forEach((key) => {
      const val = data[key];
      safeData[key] = val !== undefined && val !== null ? String(val) : "";
    });

    // 🚀 Novo padrão: render diretamente com os dados
    try {
      doc.render(safeData);
    } catch (error) {
      if (error.properties && error.properties.errors) {
        error.properties.errors.forEach((e) => {
          console.error("Erro no template:", e.properties.explanation);
        });
      }
      console.error("Erro completo do template:", error);
      return res.status(500).send("Falha ao renderizar o documento.");
    }

    const buf = doc.getZip().generate({ type: "nodebuffer" });

    // If the client requests PDF (body.output === 'pdf' or ?format=pdf), convert
    // the generated DOCX buffer to PDF using libreoffice-convert and return PDF.
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

    // Default: send DOCX
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader("Content-Disposition", `attachment; filename=${templateName}.docx`);
    res.send(buf);
  } catch (err) {
    console.error("Document generation error:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
