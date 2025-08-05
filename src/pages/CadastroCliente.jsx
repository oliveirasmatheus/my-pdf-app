import { useState } from 'react';

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCliente((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Cliente data:', cliente);
    // You can later integrate this with Firestore
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Cadastro de Cliente</h2>

      <input name="nome" placeholder="Nome" onChange={handleChange} />
      <input name="cpf" placeholder="CPF" onChange={handleChange} />
      <input name="rg" placeholder="RG" onChange={handleChange} />
      <input name="cnh" placeholder="CNH" onChange={handleChange} />
      <input type="date" name="dataNascimento" onChange={handleChange} />
      <input name="profissao" placeholder="Profissão" onChange={handleChange} />
      <input name="endereco" placeholder="Endereço Residencial" onChange={handleChange} />
      <input name="estadoCivil" placeholder="Estado Civil" onChange={handleChange} />

      <label>
        <input type="checkbox" name="possuiEmpresa" onChange={handleChange} />
        Possui Empresa?
      </label>

      {cliente.possuiEmpresa && (
        <>
          <input name="razaoSocial" placeholder="Razão Social" onChange={handleChange} />
          <input name="cnpj" placeholder="CNPJ" onChange={handleChange} />
          <input name="enderecoEmpresa" placeholder="Endereço da Empresa" onChange={handleChange} />
        </>
      )}

      <button type="submit">Salvar Cliente</button>
    </form>
  );
}