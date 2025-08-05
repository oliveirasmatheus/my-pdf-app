import { useState } from 'react';

export default function CadastroTerreno() {
  const [terreno, setTerreno] = useState({
    numeroMatricula: '',
    setor: '',
    quadra: '',
    lote: '',
    endereco: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTerreno((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Terreno data:', terreno);
    // You can later associate this with a cliente ID in Firestore
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Cadastro de Terreno</h2>
      <input name="numeroMatricula" placeholder="Número da Matrícula" onChange={handleChange} />
      <input name="setor" placeholder="Setor" onChange={handleChange} />
      <input name="quadra" placeholder="Quadra" onChange={handleChange} />
      <input name="lote" placeholder="Lote" onChange={handleChange} />
      <input name="endereco" placeholder="Endereço do Terreno" onChange={handleChange} />
      <button type="submit">Salvar Terreno</button>
    </form>
  );
}
