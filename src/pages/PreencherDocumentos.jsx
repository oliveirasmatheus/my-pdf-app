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

  const API_URL = import.meta.env.VITE_API_URL;

  // Buscar clientes
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

  // Buscar terrenos quando cliente muda
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
      setSelectedTerrenoId(''); // resetar seleção
    };

    fetchTerrenos();
  }, [selectedClienteId]);

  const handleGenerateDocument = async () => {
    if (!selectedPdf || !selectedClienteId) {
      alert('Por favor, selecione o PDF e o cliente.');
      return;
    }

    const cliente = clientes.find(c => c.id === selectedClienteId);
    const terreno = terrenos.find(t => t.id === selectedTerrenoId);

    const today = new Date();
    const dia = String(today.getDate()).padStart(2, '0');
    const ano = today.getFullYear();
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const mes = meses[today.getMonth()];

    if (!cliente) {
      alert("Cliente não encontrado.");
      return;
    }

    try {
      let templateName = selectedPdf;
      if (selectedPdf === 'procuracao' && !cliente.possuiEmpresa) {
        templateName = 'procuracaoSemEmpresa';
      }

      // Monta os dados para enviar, incluindo terreno apenas se selecionado
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

      <div className='form-group'>
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

      <div className='form-group'>
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

      <div className='form-group'>
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

      <button onClick={handleGenerateDocument} type="submit" className="submit-btn">Gerar Documento</button>
    </div>
  );
}
