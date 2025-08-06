import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCliente((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const clienteData = {
        nome: cliente.nome,
        cpf: cliente.cpf,
        rg: cliente.rg,
        cnh: cliente.cnh,
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

      await addDoc(collection(db, 'clientes'), clienteData);

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

      fetchClientes(); // Reload list
    } catch (err) {
      console.error('Erro ao adicionar cliente:', err);
    }
  };

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

  return (
    <div style={{ padding: '2rem' }}>
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <h2>Cadastro de Cliente</h2>

        <input name="nome" placeholder="Nome" value={cliente.nome} onChange={handleChange} />
        <input name="cpf" placeholder="CPF" value={cliente.cpf} onChange={handleChange} />
        <input name="rg" placeholder="RG" value={cliente.rg} onChange={handleChange} />
        <input name="cnh" placeholder="CNH" value={cliente.cnh} onChange={handleChange} />
        <input type="date" name="dataNascimento" value={cliente.dataNascimento} onChange={handleChange} />
        <input name="profissao" placeholder="Profissão" value={cliente.profissao} onChange={handleChange} />
        <input name="endereco" placeholder="Endereço Residencial" value={cliente.endereco} onChange={handleChange} />
        <input name="estadoCivil" placeholder="Estado Civil" value={cliente.estadoCivil} onChange={handleChange} />

        <label>
          <input type="checkbox" name="possuiEmpresa" checked={cliente.possuiEmpresa} onChange={handleChange} />
          Possui Empresa?
        </label>

        {cliente.possuiEmpresa && (
          <>
            <input name="razaoSocial" placeholder="Razão Social" value={cliente.razaoSocial} onChange={handleChange} />
            <input name="cnpj" placeholder="CNPJ" value={cliente.cnpj} onChange={handleChange} />
            <input name="enderecoEmpresa" placeholder="Endereço da Empresa" value={cliente.enderecoEmpresa} onChange={handleChange} />
          </>
        )}

        <button type="submit">Salvar Cliente</button>
      </form>

      <div>
        <h3>Clientes Cadastrados</h3>
        {clientesCadastrados.length === 0 ? (
          <p>Nenhum cliente cadastrado ainda.</p>
        ) : (
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
