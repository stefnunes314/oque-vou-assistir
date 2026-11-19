import { useState, useEffect} from 'react'
import './App.css'
import cinemaImg from './assets/cinema.png'
import { getGeneros, descobrirFilmes, sortearFilme, getCreditos, buscarPessoa } from './services/tmdb'

const CHAVE_ASSISTIDOS = 'assistidos'

function carregarAssistidos() {
  return JSON.parse(localStorage.getItem(CHAVE_ASSISTIDOS) || '[]')
}

function salvarAssistidos(lista) {
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
  const [textoBusca, setTextoBusca] = useState('')
  const [sugestoes, setSugestoes] = useState([])
  const [pessoaSelecionada, setPessoaSelecionada] = useState(null)
  const [erro, setErro] = useState(false)
  const [tentativa, setTentativa] = useState(0)
  const [carregou, setCarregou] = useState(false)
  const [assistidos, setAssistidos] = useState(carregarAssistidos)

  const atorId =
    pessoaSelecionada && pessoaSelecionada.funcao === 'ator'
      ? pessoaSelecionada.id
      : ''
  const diretorId =
    pessoaSelecionada && pessoaSelecionada.funcao === 'diretor'
      ? pessoaSelecionada.id
      : ''

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

  useEffect(() => {
    if (pessoaSelecionada || textoBusca.trim().length < 2) {
      return
    }

    const temporizador = setTimeout(() => {
      buscarPessoa(textoBusca)
        .then((lista) => {
          setSugestoes(lista)
        })
        .catch(() => setSugestoes([]))
    }, 400)

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

  function escolherPessoa(pessoa) {
    setPessoaSelecionada(pessoa)
    setTextoBusca(pessoa.nome)
    setSemResultado(false)
  }

  function limparPessoa() {
    setPessoaSelecionada(null)
    setTextoBusca('')
    setSugestoes([])
    setSemResultado(false)
  }

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
          .catch(() => setCreditos(null))
      }
    })
    .catch(() => setErro(true))
  }

  function handleSortear() {
    sortear(assistidos)
  }

  function handleJaAssisti() {
    const novaLista = [...assistidos, filmeSorteado.id]
    setAssistidos(novaLista)
    salvarAssistidos(novaLista)
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
            setPessoaSelecionada(null)
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