import { useEffect, useState } from 'react';
import db from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

export default function PreencherDocumentos() {
  const [clientes, setClientes] = useState([]);
  const [selectedClienteId, setSelectedClienteId] = useState('');
  const [selectedPdf, setSelectedPdf] = useState('');

  const pdfTemplates = [
    { value: 'procuracao', label: 'Procuração' },
    { value: 'template2', label: 'template 2' },
    { value: 'template3', label: 'template 3' },
  ];

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchClientes = async () => {
      const querySnapshot = await getDocs(collection(db, 'clientes'));
      const fetchedClientes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClientes(fetchedClientes);
    };

    fetchClientes();
  }, []);

  const handleGenerateDocument = async () => {
    if (!selectedPdf || !selectedClienteId) {
      alert('Por favor, selecione o PDF e o cliente.');
      return;
    }

    const cliente = clientes.find(c => c.id === selectedClienteId);
    if (!cliente) {
      alert("Cliente não encontrado.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateName: selectedPdf, // e.g., 'procuracao'
          data: {
            nome: cliente.nome,
            cpf: cliente.cpf,
            rg: cliente.rg,
            cnh: cliente.cnh,
            dataNascimento: cliente.dataNascimento,
            profissao: cliente.profissao,
            enderecoResidencial: cliente.enderecoResidencial,
            estadoCivil: cliente.estadoCivil,
            razaoSocial: cliente.empresa?.razaoSocial || '',
            cnpj: cliente.empresa?.cnpj || '',
            enderecoEmpresa: cliente.empresa?.enderecoEmpresa || '',
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao gerar documento");
      }

      const blob = await response.blob();

      // Trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedPdf}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Erro ao gerar o documento:", error);
      alert("Erro ao gerar o documento. Verifique o console.");
    }
  };


  return (
    <div>
      <h2>Preencher Documentos</h2>

      <div style={{ margin: '20px 0' }}>
        <label>
          Selecionar Documento:
          <select
            value={selectedPdf}
            onChange={(e) => setSelectedPdf(e.target.value)}
            style={{ marginLeft: '10px' }}
          >
            <option value="">-- Selecione --</option>
            {pdfTemplates.map((pdf) => (
              <option key={pdf.value} value={pdf.value}>
                {pdf.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ margin: '20px 0' }}>
        <label>
          Selecionar Cliente:
          <select
            value={selectedClienteId}
            onChange={(e) => setSelectedClienteId(e.target.value)}
            style={{ marginLeft: '10px' }}
          >
            <option value="">-- Selecione --</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button onClick={handleGenerateDocument}>Gerar Documento</button>
    </div>
  );
}
