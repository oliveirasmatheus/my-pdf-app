const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const { exec } = require("child_process");
const { promisify } = require("util");
const os = require("os");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const execAsync = promisify(exec);

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

app.post("/generate-pdf", async (req, res) => {
  const { templateName, data } = req.body;

  if (!templateName) {
    return res.status(400).send("Missing template name");
  }

  if (!data || typeof data !== "object") {
    return res.status(400).send("Missing or invalid data");
  }

  console.log("Data recebida para PDF:", data);

  const templatePath = path.join(__dirname, "templates", `${templateName}.docx`);

  if (!fs.existsSync(templatePath)) {
    return res.status(404).send(`Template '${templateName}.docx' not found`);
  }

  const tempDir = os.tmpdir();
  const timestamp = Date.now();
  const tempDocxPath = path.join(tempDir, `temp_${timestamp}.docx`);
  const tempPdfPath = path.join(tempDir, `temp_${timestamp}.pdf`);

  try {
    // Step 1: Generate the Word document
    const template = fs.readFileSync(templatePath, "binary");
    const zip = new PizZip(template);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Convert all values to string to avoid errors with undefined/null
    const safeData = {};
    Object.keys(data).forEach((key) => {
      const val = data[key];
      safeData[key] = val !== undefined && val !== null ? String(val) : "";
    });

    // Render the template
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

    const docxBuffer = doc.getZip().generate({ type: "nodebuffer" });

    // Write DOCX to temp file
    fs.writeFileSync(tempDocxPath, docxBuffer);
    console.log("DOCX temp file created:", tempDocxPath);

    // Step 2: Convert DOCX to PDF using LibreOffice command line
    try {
      const command = `libreoffice --headless --convert-to pdf --outdir "${tempDir}" "${tempDocxPath}"`;
      console.log("Executing command:", command);
      
      await execAsync(command, { timeout: 30000 });

      // Read the generated PDF
      const pdfBuffer = fs.readFileSync(tempPdfPath);
      console.log("PDF conversion successful, file size:", pdfBuffer.length);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=${templateName}.pdf`);
      res.send(pdfBuffer);

      // Clean up temp files
      setTimeout(() => {
        try {
          if (fs.existsSync(tempDocxPath)) fs.unlinkSync(tempDocxPath);
          if (fs.existsSync(tempPdfPath)) fs.unlinkSync(tempPdfPath);
          console.log("Temp files cleaned up");
        } catch (e) {
          console.error("Erro ao limpar arquivos temporários:", e);
        }
      }, 1000);
    } catch (convertError) {
      console.error("Erro ao converter para PDF:", convertError);
      console.error("Detalhes do erro:", convertError.message);
      
      // Clean up temp files on error
      try {
        if (fs.existsSync(tempDocxPath)) fs.unlinkSync(tempDocxPath);
        if (fs.existsSync(tempPdfPath)) fs.unlinkSync(tempPdfPath);
      } catch (e) {
        console.error("Erro ao limpar arquivo temporário:", e);
      }
      
      res.status(500).send("Falha ao converter documento para PDF: " + convertError.message);
    }
  } catch (err) {
    console.error("PDF generation error:", err);
    console.error("Detalhes do erro:", err.message);
    
    // Clean up temp files on error
    try {
      if (fs.existsSync(tempDocxPath)) fs.unlinkSync(tempDocxPath);
    } catch (e) {
      console.error("Erro ao limpar arquivo temporário:", e);
    }
    
    res.status(500).send("Internal Server Error: " + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
