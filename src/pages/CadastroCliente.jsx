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

  const formatCPF = (value) => {
    // Remove tudo que não seja número
    const numericValue = value.replace(/\D/g, '').slice(0, 11); // máximo 11 dígitos

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
    // Remove tudo que não é número
    const numericValue = value.replace(/\D/g, '').slice(0, 14); // limita a 14 dígitos
    
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



  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let newValue = value;

  if (name === 'cpf') {
    newValue = formatCPF(value); // seu CPF já existente
  } else if (name === 'cnpj') {
    newValue = formatCNPJ(value);
  }

    setCliente((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : newValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      
      if (!/^\d+$/.test(cliente.rg) || !/^\d+$/.test(cliente.cnh)) {
        alert('RG e CNH devem conter apenas números.');
        return;
      }

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

      fetchClientes();
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
    <div className="cadastro-container">
      <form className="form-cliente" onSubmit={handleSubmit}>
        <h2>Cadastro de Cliente</h2>
        <div className="grid-2">
          <input name="nome" placeholder="Nome" value={cliente.nome} onChange={handleChange} />
          <input name="cpf" placeholder="CPF" value={cliente.cpf} onChange={handleChange} inputMode="numeric" />
          <input name="rg" placeholder="RG" value={cliente.rg} onChange={handleChange} inputMode="numeric" pattern="\d*" maxLength={10} />
          <input name="cnh" placeholder="CNH" value={cliente.cnh} onChange={handleChange} inputMode="numeric" pattern="\d*" maxLength={11} />
          <input type="date" name="dataNascimento" value={cliente.dataNascimento} onChange={handleChange} />
          <input name="profissao" placeholder="Profissão" value={cliente.profissao} onChange={handleChange} />
          <input name="endereco" placeholder="Endereço Residencial" value={cliente.endereco} onChange={handleChange} />
          <input name="estadoCivil" placeholder="Estado Civil" value={cliente.estadoCivil} onChange={handleChange} />
        </div>

        <div className="checkbox-container">
          <label htmlFor="possuiEmpresa">Possui Empresa?</label>
          <input
            type="checkbox"
            id="possuiEmpresa"
            name="possuiEmpresa"
            checked={cliente.possuiEmpresa}
            onChange={handleChange}
          />
        </div>



        {cliente.possuiEmpresa && (
          <div className="grid-2">
            <input name="razaoSocial" placeholder="Razão Social" value={cliente.razaoSocial} onChange={handleChange} />
            <input name="cnpj" placeholder="CNPJ" value={cliente.cnpj} onChange={handleChange} />
            <input name="enderecoEmpresa" placeholder="Endereço da Empresa" value={cliente.enderecoEmpresa} onChange={handleChange} />
          </div>
        )}

        <button type="submit" className="submit-btn">Salvar Cliente</button>
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
