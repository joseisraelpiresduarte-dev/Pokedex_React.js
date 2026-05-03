import { useState, useEffect } from "react";
import "./App.css";

// Importação do asset estático para o frame da Pokedex
import pokedexImg from "./assets/image/pokedex.png";

/**
 * Consome a PokéAPI para retornar dados de um Pokémon específico.
 * @param {string|number} query - Nome ou ID do Pokémon.
 * @returns {Promise<Object>} Dados do Pokémon em formato JSON.
 */
const fetchPokemonData = async (query) => {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
  if (!response.ok) throw new Error("Pokémon não encontrado");
  return response.json();
};

export default function Pokedex() {
  // --- Estados da Aplicação ---
  const [pokemon, setPokemon] = useState(null); // Armazena os dados do Pokémon atual
  const [searchId, setSearchId] = useState(1);   // Controla o ID ou nome para o gatilho do useEffect
  const [inputValue, setInputValue] = useState(""); // Estado do campo de entrada (Input Controlado)
  const [loading, setLoading] = useState(false);  // Feedback visual de carregamento

  /**
   * Hook de Efeito: Monitora mudanças no 'searchId'.
   * Sempre que o ID mudar, uma nova requisição é disparada.
   */
  useEffect(() => {
    let isMounted = true; // Flag para evitar atualizações de estado em componentes desmontados

    const loadPokemon = async () => {
      setLoading(true);
      try {
        const data = await fetchPokemonData(searchId);
        if (isMounted) {
          setPokemon(data);
          // Sincroniza o searchId com o ID real retornado (útil quando buscamos por nome)
          if (data.id !== searchId) setSearchId(data.id);
        }
      } catch (error) {
        if (isMounted) setPokemon(null); // Limpa o estado em caso de erro (ex: 404)
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPokemon();

    // Função de limpeza (Cleanup) para evitar Memory Leaks
    return () => { isMounted = false; };
  }, [searchId]);

  /**
   * Gerencia o envio do formulário de busca.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchId(inputValue.toLowerCase()); // Normaliza para letras minúsculas (padrão da API)
      setInputValue(""); // Limpa o campo após a busca
    }
  };

  /**
   * Navegação: Pokémon Anterior.
   */
  const handlePrev = () => {
    setSearchId((prev) => (typeof prev === "number" && prev > 1 ? prev - 1 : 1));
  };

  /**
   * Navegação: Próximo Pokémon.
   */
  const handleNext = () => {
    setSearchId((prev) => (typeof prev === "number" ? prev + 1 : 1));
  };

  /**
   * Lógica de Extração de Imagem:
   * Tenta obter o GIF animado da Gen V; caso não exista, retorna a imagem estática padrão.
   */
  const imageSrc =
    pokemon?.sprites?.versions?.["generation-v"]?.["black-white"]?.animated?.front_default ||
    pokemon?.sprites?.front_default ||
    "";

  return (
    <main>
      {/* Visualização do Pokémon: Oculta a tag se não houver dados ou durante o loading */}
      <img
        src={imageSrc}
        alt="pokemon"
        className="pokemon__image"
        style={{ display: pokemon && !loading ? "block" : "none" }}
      />

      {/* Exibição de Dados (ID e Nome) */}
      <h1 className="pokemon__data">
        <span className="pokemon__number">
          {loading ? "" : pokemon?.id || ""}
        </span>
        {!loading && pokemon && " - "}
        <span className="pokemon__name">
          {loading ? "Loading..." : pokemon ? pokemon.name : "Not found :c"}
        </span>
      </h1>

      {/* Formulário de Busca */}
      <form className="form" onSubmit={handleSubmit}>
        <input
          type="search"
          className="input__search"
          placeholder="Name or Number"
          required
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button type="submit" className="btn-search">
          Search
        </button>
      </form>

      {/* Controles de Navegação */}
      <div className="buttons">
        <button 
          className="button btn-prev" 
          onClick={handlePrev} 
          disabled={loading || searchId <= 1} // Bloqueia navegação abaixo do ID 1
        >
          Prev &lt;
        </button>

        <button 
          className="button btn-next" 
          onClick={handleNext} 
          disabled={loading}
        >
          Next &gt;
        </button>
      </div>

      {/* Imagem de Fundo (Estrutura da Pokedex) */}
      <img src={pokedexImg} alt="pokedex" className="pokedex" />
    </main>
  );
}