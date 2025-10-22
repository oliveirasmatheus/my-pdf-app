import { useEffect, useState } from 'react';
import db from '../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import './PreencherDocumentos.css';

export default function PreencherDocumentos() {
  const [clientes, setClientes] = useState([]);
  const [selectedClienteId, setSelectedClienteId] = useState('');
  const [terrenos, setTerrenos] = useState([]);
  const [selectedTerrenoId, setSelectedTerrenoId] = useState('');
  const [selectedPdf, setSelectedPdf] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingType, setGeneratingType] = useState(null); // 'word' or 'pdf'

  const API_URL = import.meta.env.VITE_API_URL;

  const pdfTemplates = [
    { value: 'procuracao', label: 'Procuração' },
    { value: 'aprovacao_projeto', label: 'Aprovação de Projeto' },
    { value: 'certidao_confrontacoes', label: 'Certidão de Confrontações' },
    { value: 'levantamento_cadastral', label: 'Levantamento Cadastral' },
    { value: 'ampliacao_construcao', label: 'Ampliação da Construção' },
    { value: 'demolicao_predio', label: 'Demolição de Prédio' },
    { value: 'pedido_prescricao', label: 'Pedido de Prescrição' },
    { value: 'certidao_negativa', label: 'Certidão Negativa' },
    { value: 'dm_declaracao_munic', label: 'DM – Declaração Munic.' },
    { value: 'vistoria', label: 'Vistoria' },
    { value: 'certidao_lancamento', label: 'Certidão de Lançamento' },
    { value: 'devolucao_receita', label: 'Devolução de Receita' },
    { value: 'habite_se', label: 'Habite-se' },
    { value: 'certidao_valor_venal', label: 'Certidão de Valor Venal' },
    { value: 'unificacao_lote', label: 'Unificação de lote' },
    { value: 'levantamento_cadastral_2', label: 'Levantam. Cadastral' },
    { value: 'certidao_demolicao', label: 'Certidão de Demolição' },
    { value: 'desmembramento_lote', label: 'Desmembramento de lote' },
    { value: 'regularizacao_obra', label: 'Regularização de obra' },
  ];

  const terrainRequiredTemplates = [
    'aprovacao_projeto',
    'certidao_confrontacoes',
    'levantamento_cadastral',
    'ampliacao_construcao',
    'demolicao_predio',
    'vistoria',
    'certidao_lancamento',
    'habite_se',
    'certidao_valor_venal',
    'unificacao_lote',
    'levantamento_cadastral_2',
    'certidao_demolicao',
    'desmembramento_lote',
    'regularizacao_obra',
  ];

  function Spinner() {
    return <span className="pd-spinner" aria-hidden="true" />;
  }

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

  useEffect(() => {
    const fetchTerrenos = async () => {
      if (!selectedClienteId) {
        setTerrenos([]);
        setSelectedTerrenoId('');
        return;
      }

      const q = query(
        collection(db, 'terrenos'),
        where('clienteId', '==', selectedClienteId)
      );

      const querySnapshot = await getDocs(q);
      const fetchedTerrenos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTerrenos(fetchedTerrenos);
      setSelectedTerrenoId('');
    };

    fetchTerrenos();
  }, [selectedClienteId]);

  const getDocumentData = () => {
    if (!selectedPdf || !selectedClienteId) {
      alert('Por favor, selecione o documento e o cliente.');
      return null;
    }

    const cliente = clientes.find(c => c.id === selectedClienteId);
    const terreno = terrenos.find(t => t.id === selectedTerrenoId);

    if (!cliente) {
      alert('Cliente não encontrado.');
      return null;
    }

    if (!terreno && terrainRequiredTemplates.includes(selectedPdf)) {
      alert('Por favor, selecione um terreno.');
      return null;
    }

    const today = new Date();
    const dia = String(today.getDate()).padStart(2, '0');
    const ano = today.getFullYear();
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const mes = meses[today.getMonth()];

    let templateName = selectedPdf;
    if (selectedPdf === 'procuracao' && !cliente.possuiEmpresa) {
      templateName = 'procuracaoSemEmpresa';
    }

    const dataToSend = {
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
      dia,
      mes,
      ano
    };

    if (terreno) {
      dataToSend.endereco = terreno.endereco;
      dataToSend.setor = terreno.setor;
      dataToSend.quadra = terreno.quadra;
      dataToSend.lote = terreno.lote;
    }

    return { templateName, dataToSend, cliente };
  };

  const handleGenerateWord = async () => {
    const docData = getDocumentData();
    if (!docData) return;

    const { templateName, dataToSend, cliente } = docData;

    try {
      setIsGenerating(true);
      setGeneratingType('word');
      
      const response = await fetch(`${API_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateName,
          data: dataToSend
        }),
      });

      if (!response.ok) throw new Error("Erro ao gerar documento");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      
      const rawName = `${selectedPdf}_${cliente.nome || 'document'}`;
      const safeName = rawName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-\.]/g, '');
      a.download = `${safeName}.docx`;
      
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);

    } catch (error) {
      console.error('Erro ao gerar Word:', error);
      alert('Erro ao gerar o documento Word. Verifique o console para detalhes.');
    } finally {
      setIsGenerating(false);
      setGeneratingType(null);
    }
  };

  const handleGeneratePDF = async () => {
    const docData = getDocumentData();
    if (!docData) return;

    const { templateName, dataToSend, cliente } = docData;

    try {
      setIsGenerating(true);
      setGeneratingType('pdf');
      
      const response = await fetch(`${API_URL}/generate-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateName,
          data: dataToSend
        }),
      });

      if (!response.ok) throw new Error("Erro ao gerar PDF");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      
      const rawName = `${selectedPdf}_${cliente.nome || 'document'}`;
      const safeName = rawName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-\.]/g, '');
      a.download = `${safeName}.pdf`;
      
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar o documento PDF. Verifique o console para detalhes.');
    } finally {
      setIsGenerating(false);
      setGeneratingType(null);
    }
  };

  return (
    <div className="cadastro-container">
      <h2>Preencher Documentos</h2>

      <div className="form-cliente">
        <div style={{ padding: 0 }}>
          <div className="form-group">
            <label>
              Selecionar Documento:
              <select
                value={selectedPdf}
                onChange={(e) => setSelectedPdf(e.target.value)}
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

          <div className="form-group">
            <label>
              Selecionar Cliente:
              <select
                value={selectedClienteId}
                onChange={(e) => setSelectedClienteId(e.target.value)}
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

          <div className="form-group">
            <label>
              Selecionar Terreno:
              <select
                value={selectedTerrenoId}
                onChange={(e) => setSelectedTerrenoId(e.target.value)}
                disabled={!terrenos.length}
              >
                <option value="">-- Selecione --</option>
                {terrenos.map((terreno) => (
                  <option key={terreno.id} value={terreno.id}>
                    {terreno.endereco} - Setor {terreno.setor}, Quadra {terreno.quadra}, Lote {terreno.lote}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="button-group">
            <button
              onClick={handleGenerateWord}
              type="button"
              className="submit-btn"
              disabled={isGenerating}
            >
              {isGenerating && generatingType === 'word' ? 'Gerando...' : 'Gerar Word'} {isGenerating && generatingType === 'word' && <Spinner />}
            </button>
            <button
              onClick={handleGeneratePDF}
              type="button"
              className="submit-btn submit-btn-secondary"
              disabled={isGenerating}
            >
              {isGenerating && generatingType === 'pdf' ? 'Gerando...' : 'Gerar PDF'} {isGenerating && generatingType === 'pdf' && <Spinner />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
