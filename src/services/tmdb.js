const API_URL = 'http://localhost:3001'

export async function sortearFilme({generoId, notaMinima, plataformaId}){
    let url = `${API_URL}/api/sortear?`
    if (generoId) {
    url += `generoId=${generoId}&`
  }
  if (notaMinima) {
    url += `notaMinima=${notaMinima}&`
  }
  if (plataformaId) {
    url += `plataformaId=${plataformaId}&`
  }

  const resposta = await fetch(url)
  const dados = await resposta.json()
  return dados 
}

export async function getGeneros () {
    const resposta = await fetch(`${API_URL}/api/generos`)
    const dados = await resposta.json()
    return dados
}

export async function descobrirFilmes({generoId, notaMinima, plataformaId}) {
    let url = `${API_URL}/api/filmes?`

      if (generoId) {
    url += `generoId=${generoId}&`
  }
  if (notaMinima) {
    url += `notaMinima=${notaMinima}&`
  }
  if (plataformaId) {
    url += `plataformaId=${plataformaId}&`
  }
    const resposta = await fetch(url)
    const dados = await resposta.json()
    return dados
}
export async function getCreditos(filmeId){
  const resposta = await fetch (`${API_URL}/api/filmes/${filmeId}/creditos`)
  const dados = await resposta.json()
  return dados
}