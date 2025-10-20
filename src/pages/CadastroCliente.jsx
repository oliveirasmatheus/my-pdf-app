import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import db from '../firebaseConfig';
import './CadastroCliente.css';

export default function CadastroCliente() {
  const [cliente, setCliente] = useState({
    nome: '',
    cpf: '',
    rg: '',
    cnh: '',
    dataNascimento: '',
    profissao: '',
    endereco: '',
    estadoCivil: '',
    possuiEmpresa: false,
    razaoSocial: '',
    cnpj: '',
    enderecoEmpresa: '',
  });

  const [clientesCadastrados, setClientesCadastrados] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [viewingId, setViewingId] = useState(null); // for mobile 'Detalhes' view (read-only)

  // --- FORMATAÇÕES CPF/CNPJ ---
  const formatCPF = (value) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 11);
    let formatted = numericValue;
    if (numericValue.length > 3 && numericValue.length <= 6) {
      formatted = numericValue.replace(/(\d{3})(\d+)/, '$1.$2');
    } else if (numericValue.length > 6 && numericValue.length <= 9) {
      formatted = numericValue.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
    } else if (numericValue.length > 9) {
      formatted = numericValue.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4');
    }
    return formatted;
  };

  const formatCNPJ = (value) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 14);
    let formatted = numericValue;
    if (numericValue.length > 2 && numericValue.length <= 5) {
      formatted = numericValue.replace(/(\d{2})(\d+)/, '$1.$2');
    } else if (numericValue.length > 5 && numericValue.length <= 8) {
      formatted = numericValue.replace(/(\d{2})(\d{3})(\d+)/, '$1.$2.$3');
    } else if (numericValue.length > 8 && numericValue.length <= 12) {
      formatted = numericValue.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, '$1.$2.$3/$4');
    } else if (numericValue.length > 12) {
      formatted = numericValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d+)/, '$1.$2.$3/$4-$5');
    }
    return formatted;
  };

  // --- INPUT CHANGE ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = value;

    if (name === 'cpf') newValue = formatCPF(value);
    else if (name === 'cnpj') newValue = formatCNPJ(value);

    setCliente((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : newValue,
    }));
  };

  // --- SALVAR OU EDITAR ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // validate RG (required, only digits)
      if (!/^\d+$/.test(cliente.rg)) {
        alert('RG deve conter apenas números.');
        return;
      }

      // validate CNH only if provided (allow empty/null)
      if (cliente.cnh && !/^\d+$/.test(cliente.cnh)) {
        alert('CNH deve conter apenas números.');
        return;
      }

      const clienteData = {
        nome: cliente.nome,
        cpf: cliente.cpf,
        rg: cliente.rg,
        cnh: cliente.cnh ? cliente.cnh : null,
        dataNascimento: cliente.dataNascimento,
        profissao: cliente.profissao,
        enderecoResidencial: cliente.endereco,
        estadoCivil: cliente.estadoCivil,
        possuiEmpresa: cliente.possuiEmpresa,
        empresa: cliente.possuiEmpresa
          ? {
              razaoSocial: cliente.razaoSocial,
              cnpj: cliente.cnpj,
              enderecoEmpresa: cliente.enderecoEmpresa,
            }
          : null,
      };

      if (editandoId) {
        // Atualiza
        const clienteRef = doc(db, 'clientes', editandoId);
        await updateDoc(clienteRef, clienteData);
        setEditandoId(null);
      } else {
        // Novo cadastro
        await addDoc(collection(db, 'clientes'), clienteData);
      }

      setCliente({
        nome: '',
        cpf: '',
        rg: '',
        cnh: '',
        dataNascimento: '',
        profissao: '',
        endereco: '',
        estadoCivil: '',
        possuiEmpresa: false,
        razaoSocial: '',
        cnpj: '',
        enderecoEmpresa: '',
      });

      fetchClientes();
    } catch (err) {
      console.error('Erro ao salvar cliente:', err);
    }
  };

  // --- BUSCAR CLIENTES ---
  const fetchClientes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'clientes'));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClientesCadastrados(data);
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  // --- EDITAR CLIENTE ---
  const handleEdit = (c) => {
    setCliente({
      nome: c.nome,
      cpf: c.cpf,
      rg: c.rg,
      cnh: c.cnh,
      dataNascimento: c.dataNascimento,
      profissao: c.profissao,
      endereco: c.enderecoResidencial,
      estadoCivil: c.estadoCivil,
      possuiEmpresa: !!c.empresa,
      razaoSocial: c.empresa?.razaoSocial || '',
      cnpj: c.empresa?.cnpj || '',
      enderecoEmpresa: c.empresa?.enderecoEmpresa || '',
    });
    setEditandoId(c.id);
    setViewingId(null);
  };

  // --- DELETAR CLIENTE ---
  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      await deleteDoc(doc(db, 'clientes', id));
      fetchClientes();
    }
  };

  return (
    <div className="cadastro-container">
      <form className="form-cliente" onSubmit={handleSubmit}>
        <h2>{viewingId ? 'Visualizar Cliente' : editandoId ? 'Editar Cliente' : 'Cadastro de Cliente'}</h2>
        <div className="grid-2">
          <input name="nome" placeholder="Nome" value={cliente.nome} onChange={handleChange} disabled={!!viewingId} />
          <input name="cpf" placeholder="CPF" value={cliente.cpf} onChange={handleChange} inputMode="numeric" disabled={!!viewingId} />
          <input name="rg" placeholder="RG" value={cliente.rg} onChange={handleChange} inputMode="numeric" disabled={!!viewingId} />
          <input name="cnh" placeholder="CNH" value={cliente.cnh} onChange={handleChange} inputMode="numeric" disabled={!!viewingId} />
          <input type="date" name="dataNascimento" value={cliente.dataNascimento} onChange={handleChange} disabled={!!viewingId} />
          <input name="profissao" placeholder="Profissão" value={cliente.profissao} onChange={handleChange} disabled={!!viewingId} />
          <input name="endereco" placeholder="Endereço Residencial" value={cliente.endereco} onChange={handleChange} disabled={!!viewingId} />
          <input name="estadoCivil" placeholder="Estado Civil" value={cliente.estadoCivil} onChange={handleChange} disabled={!!viewingId} />
        </div>

        <div className="checkbox-container">
          <label htmlFor="possuiEmpresa">Possui Empresa?</label>
          <input
            type="checkbox"
            id="possuiEmpresa"
            name="possuiEmpresa"
            checked={cliente.possuiEmpresa}
            onChange={handleChange}
            disabled={!!viewingId}
          />
        </div>

        {cliente.possuiEmpresa && (
          <div className="grid-2">
            <input name="razaoSocial" placeholder="Razão Social" value={cliente.razaoSocial} onChange={handleChange} disabled={!!viewingId} />
            <input name="cnpj" placeholder="CNPJ" value={cliente.cnpj} onChange={handleChange} disabled={!!viewingId} />
            <input name="enderecoEmpresa" placeholder="Endereço da Empresa" value={cliente.enderecoEmpresa} onChange={handleChange} disabled={!!viewingId} />
          </div>
        )}

        {!viewingId && (
          <button type="submit" className="submit-btn">
            {editandoId ? 'Atualizar Cliente' : 'Salvar Cliente'}
          </button>
        )}
      </form>

      <div>
        <h3>Clientes Cadastrados</h3>
        {clientesCadastrados.length === 0 ? (
          <p>Nenhum cliente cadastrado ainda.</p>
        ) : (
          <div className="table-responsive">
          <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>RG</th>
                <th>CNH</th>
                <th>Data Nasc.</th>
                <th>Profissão</th>
                <th>Endereço Residencial</th>
                <th>Estado Civil</th>
                <th>Empresa</th>
                <th>CNPJ</th>
                <th>Endereço Empresa</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientesCadastrados.map((c) => (
                <tr key={c.id}>
                  <td>{c.nome}</td>
                  <td>{c.cpf}</td>
                  <td>{c.rg}</td>
                  <td>{c.cnh}</td>
                  <td>{c.dataNascimento}</td>
                  <td>{c.profissao}</td>
                  <td>{c.enderecoResidencial}</td>
                  <td>{c.estadoCivil}</td>
                  <td>{c.empresa?.razaoSocial || '-'}</td>
                  <td>{c.empresa?.cnpj || '-'}</td>
                  <td>{c.empresa?.enderecoEmpresa || '-'}</td>
                  <td>
                    <div className="acoes">
                      <button className="btn-editar" onClick={() => handleEdit(c)}>Editar</button>
                      <button className="btn-excluir" onClick={() => handleDelete(c.id)}>Excluir</button>
                      <button
                        className="btn-detalhes"
                        onClick={() => {
                          // Open the top form in read-only mode on mobile
                          setCliente({
                            nome: c.nome,
                            cpf: c.cpf,
                            rg: c.rg,
                            cnh: c.cnh,
                            dataNascimento: c.dataNascimento,
                            profissao: c.profissao,
                            endereco: c.enderecoResidencial,
                            estadoCivil: c.estadoCivil,
                            possuiEmpresa: !!c.empresa,
                            razaoSocial: c.empresa?.razaoSocial || '',
                            cnpj: c.empresa?.cnpj || '',
                            enderecoEmpresa: c.empresa?.enderecoEmpresa || '',
                          });
                          setViewingId(c.id);
                          setEditandoId(null);
                        }}
                        aria-expanded={viewingId === c.id}
                      >
                        Detalhes
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
