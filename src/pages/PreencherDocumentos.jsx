import { useEffect, useState } from 'react';
import db from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

export default function PreencherDocumentos() {
  const [clientes, setClientes] = useState([]);
  const [selectedClienteId, setSelectedClienteId] = useState('');
  const [selectedPdf, setSelectedPdf] = useState('');

  const pdfTemplates = [
    { value: 'contrato_servico', label: 'Contrato de Serviço' },
    { value: 'orcamento', label: 'Orçamento' },
    { value: 'recibo', label: 'Recibo' },
    // Add more options as needed
  ];

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

  const handleGenerateDocument = () => {
    if (!selectedPdf || !selectedClienteId) {
      alert('Por favor, selecione o PDF e o cliente.');
      return;
    }

    const cliente = clientes.find(c => c.id === selectedClienteId);
    console.log('Gerando documento:', selectedPdf, cliente);

    // 👉 Replace this with your document generation logic
    alert(`Documento "${selectedPdf}" será gerado para ${cliente.nome}`);
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
