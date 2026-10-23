import { useState, useEffect} from 'react'
import './App.css'
import { getGeneros, descobrirFilmes, sortearFilme } from './services/tmdb'
import cinemaImg from './assets/cinema.png'


function App() {
  const [filmes, setFilmes] = useState([])
  const [generos, setGeneros] = useState([])
  const [generoSelecionado, setGeneroSelecionado]= useState('')
  const [notaMinima, setNotaMinima]= useState('')
  const [plataformaId, setPlataformaId]= useState('')
  const [filmeSorteado, setFilmeSorteado] = useState(null)

  const top10 = filmes
  .slice()
  .sort((a, b) => b.vote_average - a.vote_average)
  .slice(0, 20)

    useEffect(() => {
  getGeneros().then((listaDeGeneros) => {
    setGeneros(listaDeGeneros)
  })
}, [])

    useEffect(() => {
    descobrirFilmes({
      generoId: generoSelecionado,
      notaMinima: notaMinima,
      plataformaId: plataformaId,

    })
    .then((listaDeFilmes) => {
      setFilmes(listaDeFilmes)
    })
  }, [generoSelecionado, notaMinima, plataformaId])

  function handleSortear() {
    sortearFilme({
      generoId: generoSelecionado,
      notaMinima: notaMinima,
      plataformaId: plataformaId,
    }).then((filme) => {
      setFilmeSorteado(filme)
    })
  }

 return (
    <div>
      <h1>
        O que eu vou <span className="destaque-vermelho">assistir?</span>
      </h1>

      <div className="controles">
        <select
          value={generoSelecionado}
          onChange={(evento) => setGeneroSelecionado(evento.target.value)}
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
          onChange={(evento) => setNotaMinima(evento.target.value)}
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
          onChange={(evento) => setPlataformaId(evento.target.value)}
        >
          <option value="">Qualquer plataforma</option>
          <option value="8">Netflix</option>
          <option value="119">Amazon Prime Video</option>
          <option value="337">Disney+</option>
          <option value="1899">Max</option>
        </select>
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

              <button
                type="button"
                className="botao-de-novo"
                onClick={handleSortear}
              >
                Sortear de novo
              </button>
            </div>
          </div>
        </div>
      )}
      <h2 className="titulo-top">Top 20 melhores</h2>
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
    </div>
  )
}

export default App