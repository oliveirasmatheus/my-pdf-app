const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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

    doc.setData(safeData);

    try {
      doc.render();
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

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
