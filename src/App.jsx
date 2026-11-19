import { useState, useEffect} from 'react'
import './App.css'
import cinemaImg from './assets/cinema.png'
import { getGeneros, descobrirFilmes, sortearFilme, getCreditos, buscarPessoa } from './services/tmdb'

// Todo o contato com o localStorage fica aqui.
// Quando houver banco de dados, só estas duas funções mudam.
const CHAVE_ASSISTIDOS = 'assistidos'

function carregarAssistidos() {
  // getItem devolve null se nunca salvamos nada, então usamos '[]' como padrão
  return JSON.parse(localStorage.getItem(CHAVE_ASSISTIDOS) || '[]')
}

function salvarAssistidos(lista) {
  // o localStorage só guarda texto, então a lista vira texto antes de salvar
  localStorage.setItem(CHAVE_ASSISTIDOS, JSON.stringify(lista))
}

function App() {
  const [filmes, setFilmes] = useState([])
  const [generos, setGeneros] = useState([])
  const [generoSelecionado, setGeneroSelecionado]= useState('')
  const [notaMinima, setNotaMinima]= useState('')
  const [plataformaId, setPlataformaId]= useState('')
  const [filmeSorteado, setFilmeSorteado] = useState(null)
  const [creditos, setCreditos]= useState(null)
  const [semResultado, setSemResultado] = useState(false)
  const [textoBusca, setTextoBusca] = useState('') // o que a pessoa digita
  const [sugestoes, setSugestoes] = useState([]) // atores e diretores sugeridos
  const [pessoaSelecionada, setPessoaSelecionada] = useState(null) // { id, nome, foto, funcao }
  const [erro, setErro] = useState(false) // deu erro ao buscar?
  const [tentativa, setTentativa] = useState(0) // contador do "Tentar de novo"
  const [carregou, setCarregou] = useState(false) // já chegou a primeira lista de filmes?
  // ids dos filmes já assistidos; começa lendo o que está salvo no navegador
  const [assistidos, setAssistidos] = useState(carregarAssistidos)

  // cada filtro recebe o id só se a pessoa escolhida tem aquela função
  const atorId =
    pessoaSelecionada && pessoaSelecionada.funcao === 'ator'
      ? pessoaSelecionada.id
      : ''
  const diretorId =
    pessoaSelecionada && pessoaSelecionada.funcao === 'diretor'
      ? pessoaSelecionada.id
      : ''

  // só mostra a lista se há texto suficiente, sugestões e ninguém já escolhido
  const mostrarSugestoes =
    !pessoaSelecionada && textoBusca.trim().length >= 2 && sugestoes.length > 0

  const top10 = filmes
  .slice()
  .sort((a, b) => b.vote_average - a.vote_average)
  .slice(0, 20)

  useEffect(() => {
    getGeneros()
      .then((listaDeGeneros) => {
        setGeneros(listaDeGeneros)
      })
      .catch(() => setErro(true))
  }, [tentativa])

  // Busca atores e diretores enquanto a pessoa digita (com debounce)
  useEffect(() => {
    // sem texto suficiente, ou com alguém já escolhido, não busca
    if (pessoaSelecionada || textoBusca.trim().length < 2) {
      return
    }

    // espera 400ms parado antes de buscar
    const temporizador = setTimeout(() => {
      buscarPessoa(textoBusca)
        .then((lista) => {
          setSugestoes(lista)
        })
        .catch(() => setSugestoes([])) // sem sugestões, a barra só fica vazia
    }, 400)

    // se digitar de novo antes dos 400ms, cancela o pedido anterior
    return () => clearTimeout(temporizador)
  }, [textoBusca, pessoaSelecionada])

    useEffect(() => {
    descobrirFilmes({
      generoId: generoSelecionado,
      notaMinima: notaMinima,
      plataformaId: plataformaId,
      atorId: atorId,
      diretorId: diretorId,
      excluir: assistidos,
    })
    .then((listaDeFilmes) => {
      setFilmes(listaDeFilmes)
      setErro(false)
      setCarregou(true)
    })
    .catch(() => setErro(true))
  }, [generoSelecionado, notaMinima, plataformaId, atorId, diretorId, assistidos, tentativa])

  // Clique numa sugestão: guarda a pessoa (id, nome e função) e mostra o nome na barra
  function escolherPessoa(pessoa) {
    setPessoaSelecionada(pessoa)
    setTextoBusca(pessoa.nome)
    setSemResultado(false)
  }

  // Botão "×": remove a pessoa do filtro
  function limparPessoa() {
    setPessoaSelecionada(null)
    setTextoBusca('')
    setSugestoes([])
    setSemResultado(false)
  }

  // Faz o sorteio de fato, excluindo os filmes da lista que receber
  function sortear(listaExcluidos) {
    sortearFilme({
      generoId: generoSelecionado,
      notaMinima: notaMinima,
      plataformaId: plataformaId,
      atorId: atorId,
      diretorId: diretorId,
      excluir: listaExcluidos,
    }).then((filme) => {
      setFilmeSorteado(filme)
      setCreditos(null)
      setSemResultado(!filme)
      if (filme){
        getCreditos(filme.id)
          .then((dados)=>{
            setCreditos(dados)
          })
          .catch(() => setCreditos(null)) // os créditos são opcionais: o card aparece sem eles
      }
    })
    .catch(() => setErro(true))
  }

  // Botões de sortear: usam a lista de assistidos que já está no estado
  function handleSortear() {
    sortear(assistidos)
  }

  // Botão "Já assisti": marca o filme da tela e já sorteia outro
  function handleJaAssisti() {
    // cria uma lista NOVA (nunca altere o estado direto, o React não perceberia)
    const novaLista = [...assistidos, filmeSorteado.id]
    setAssistidos(novaLista)
    salvarAssistidos(novaLista)
    // o setAssistidos só vale na próxima renderização, então passamos a lista nova direto
    sortear(novaLista)
  }

 return (
    <div>
      <h1>
        O que eu vou <span className="destaque-vermelho">assistir?</span>
      </h1>

      <div className="controles">
        <select
          value={generoSelecionado}
          onChange={(evento) => {
            setGeneroSelecionado(evento.target.value)
            setSemResultado(false)
          }}
        >
          <option value="">Todos os gêneros</option>
          {generos.map((genero) => (
            <option key={genero.id} value={genero.id}>
              {genero.name}
            </option>
          ))}
        </select>

        <select
          value={notaMinima}
          onChange={(evento) => {
            setNotaMinima(evento.target.value)
            setSemResultado(false)
          }}
        >
          <option value="">Qualquer nota</option>
          <option value="5">5 ou mais</option>
          <option value="6">6 ou mais</option>
          <option value="7">7 ou mais</option>
          <option value="8">8 ou mais</option>
          <option value="9">9 ou mais</option>
        </select>

        <select
          value={plataformaId}
          onChange={(evento) => {
            setPlataformaId(evento.target.value)
            setSemResultado(false)
          }}
        >
          <option value="">Qualquer plataforma</option>
          <option value="8">Netflix</option>
          <option value="119">Amazon Prime Video</option>
          <option value="337">Disney+</option>
          <option value="1899">Max</option>
        </select>
      </div>

      <div className="busca-ator">
        <input
          type="text"
          className="busca-input"
          placeholder="Buscar ator ou diretor (ex: Tom Hanks)"
          value={textoBusca}
          onChange={(evento) => {
            setTextoBusca(evento.target.value)
            setPessoaSelecionada(null) // digitou de novo: a pessoa escolhida deixa de valer
            setSemResultado(false)
          }}
        />

        {pessoaSelecionada && (
          <button
            type="button"
            className="busca-limpar"
            onClick={limparPessoa}
            aria-label="Remover pessoa do filtro"
          >
            ×
          </button>
        )}

        {mostrarSugestoes && (
          <ul className="sugestoes">
            {sugestoes.map((pessoa) => (
              <li key={pessoa.id}>
                <button
                  type="button"
                  className="sugestao"
                  onClick={() => escolherPessoa(pessoa)}
                >
                  {pessoa.foto && (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${pessoa.foto}`}
                      alt=""
                    />
                  )}
                  <span>{pessoa.nome}</span>
                  <small className="sugestao-funcao">{pessoa.funcao}</small>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!filmeSorteado && (
        <button
          type="button"
          className="botao-sortear-img"
          onClick={handleSortear}
        >
          <img src={cinemaImg} alt="Sortear filme" />
        </button>
      )}
      {semResultado && (
        <p className="aviso-vazio">
          Nenhum filme encontrado com esses filtros. Tente baixar a nota
          mínima ou trocar a plataforma.
        </p>
      )}

      {erro && (
        <div className="tela-erro">
          <h2>Ops, algo deu errado</h2>
          <p>
            Não consegui buscar os filmes. Confira se o servidor está ligado e
            tente de novo.
          </p>
          <button
            type="button"
            className="botao-de-novo"
            onClick={() => {
              setErro(false)
              setTentativa(tentativa + 1)
            }}
          >
            Tentar de novo
          </button>
        </div>
      )}
      {filmeSorteado && (
        <div className="filme-sorteado">
          <h2>Seu filme é:</h2>

          <div className="card-destaque">
            <img
              className="poster"
              src={`https://image.tmdb.org/t/p/w500${filmeSorteado.poster_path}`}
              alt={filmeSorteado.title}
            />

            <div className="card-destaque-info">
              <h3>{filmeSorteado.title}</h3>
              <p className="destaque-nota">
                ⭐ {filmeSorteado.vote_average.toFixed(1)}
              </p>
              <p className="destaque-descricao">{filmeSorteado.overview}</p>
              {creditos && (
            <div className="destaque-creditos">
              <p>
                 <strong>Direção:</strong> {creditos.diretores.join(', ')}
             </p>
             <p>
               <strong>Elenco:</strong> {creditos.elenco.join(', ')}
             </p>
             </div>
              )}

              <div className="card-acoes">
                <button
                  type="button"
                  className="botao-de-novo"
                  onClick={handleSortear}
                >
                  Sortear de novo
                </button>
                <button
                  type="button"
                  className="botao-ja-assisti"
                  onClick={handleJaAssisti}
                >
                  Já assisti
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {!erro && (
        <>
          <h2 className="titulo-top">Top 20 melhores</h2>

          {carregou && filmes.length === 0 && (
            <p className="aviso-vazio">
              Nenhum filme encontrado com esses filtros. Tente baixar a nota
              mínima, trocar a plataforma ou escolher outra pessoa.
            </p>
          )}

          <div className="grade-filmes">
            {top10.map((filme) => (
              <div key={filme.id} className="card-filme">
                <img
                  className="card-poster"
                  src={`https://image.tmdb.org/t/p/w500${filme.poster_path}`}
                  alt={filme.title}
                />
                <div className="card-info">
                  <p className="card-titulo">{filme.title}</p>
                  <p className="card-nota">⭐ {filme.vote_average.toFixed(1)}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default App