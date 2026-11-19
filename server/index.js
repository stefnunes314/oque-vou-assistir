import express from 'express'
import cors from 'cors'
import 'dotenv/config'

const app = express()


app.use(cors())
app.use(express.json())

async function buscarFilmesFiltrados(filtros) {
  const { generoId, notaMinima, plataformaId, atorId, diretorId, excluir } = filtros
  const token = process.env.TMDB_TOKEN

  let url = 'https://api.themoviedb.org/3/discover/movie?language=pt-BR'

  if (generoId) {
    url += `&with_genres=${generoId}`
  }
  if (notaMinima) {
    url += `&vote_average.gte=${notaMinima}`
  }
  if (plataformaId) {
    url += `&with_watch_providers=${plataformaId}&watch_region=BR`
  }
  if (atorId) {
    url += `&with_cast=${atorId}`
  }
  if (diretorId) {
    url += `&with_crew=${diretorId}`
  }

  const resposta = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const dados = await resposta.json()

  const idsExcluidos = excluir ? excluir.split(',').map(Number) : []

  return dados.results.filter((filme) => !idsExcluidos.includes(filme.id))
}

app.get('/', (req, res) => {
  res.json({ mensagem: 'Back-end funcionando!' })
})

app.get('/api/pessoas', async (req,res)=> {
  const token = process.env.TMDB_TOKEN
  const {busca} = req.query
  if (!busca){
    return res.json([])
  }
  const resposta = await fetch(
    `https://api.themoviedb.org/3/search/person?language=pt-BR&query=${encodeURIComponent(busca)}`,{
      headers : {
        Authorization: `Bearer ${token}`,
      },
    }

  )
  const dados = await resposta.json()
  const pessoas = dados.results
    .filter((pessoa) => pessoa.known_for_department === 'Acting'||
     pessoa.known_for_department=== 'Directing')
    .slice(0, 5)
    .map((pessoa) => ({
      id: pessoa.id,
      nome: pessoa.name,
      foto: pessoa.profile_path,
      funcao: pessoa.known_for_department === 'Directing' ? 'diretor' : 'ator',
    }))
  res.json(pessoas)
})

app.get('/api/generos', async ( req,res) => {
    const token = process.env.TMDB_TOKEN
    const resposta = await fetch(
        'https://api.themoviedb.org/3/genre/movie/list?language=pt-BR',{
            headers:{
                Authorization: `Bearer ${token}`,
            },
        }
    )
    const dados = await resposta.json()
    res.json(dados.genres)
})
app.get('/api/filmes/:id/creditos', async(req, res) =>{
  const token = process.env.TMDB_TOKEN
  const {id} = req.params

  const resposta = await fetch(
    `https://api.themoviedb.org/3/movie/${id}/credits?language=pt-BR`,
    {
      headers:{
        Authorization:`Bearer ${token}`,
      },
    }
  )
  const dados= await resposta.json()

  const diretores = dados.crew
  .filter((pessoa)=> pessoa.job==='Director')
  .map((pessoa)=>pessoa.name)

  const elenco = dados.cast.slice(0,5).map((pessoa)=>pessoa.name)
  res.json({diretores, elenco})
})
app.get('/api/filmes', async (req, res) => {
const filmes = await buscarFilmesFiltrados(req.query)
res.json(filmes)
})

app.get('/api/sortear', async (req, res) => {
const filmes = await buscarFilmesFiltrados (req.query)
if (filmes.length === 0) {
    return res.json(null)
}
const posicao = Math.floor(Math.random() * filmes.length)
res.json(filmes[posicao])
})

const PORTA = process.env.PORT || 3001
app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`)
})
