const API_URL = 'http://localhost:3001'

// Faz a requisição e trata o erro num lugar só.
// O fetch não reclama quando o servidor responde 500, por isso checamos o "ok".
async function buscarJson(url) {
  const resposta = await fetch(url)
  if (!resposta.ok) {
    throw new Error(`Erro ${resposta.status}`)
  }
  return resposta.json()
}

export async function sortearFilme({ generoId, notaMinima, plataformaId, atorId, diretorId, excluir }) {
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
  if (atorId) {
    url += `atorId=${atorId}&`
  }
  if (diretorId) {
    url += `diretorId=${diretorId}&`
  }
  if (excluir && excluir.length > 0) {
    url += `excluir=${excluir.join(',')}&`
  }

  return buscarJson(url)
}

export async function getGeneros() {
  return buscarJson(`${API_URL}/api/generos`)
}

export async function descobrirFilmes({ generoId, notaMinima, plataformaId, atorId, diretorId, excluir }) {
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
  if (atorId) {
    url += `atorId=${atorId}&`
  }
  if (diretorId) {
    url += `diretorId=${diretorId}&`
  }
  if (excluir && excluir.length > 0) {
    url += `excluir=${excluir.join(',')}&`
  }

  return buscarJson(url)
}

export async function getCreditos(filmeId) {
  return buscarJson(`${API_URL}/api/filmes/${filmeId}/creditos`)
}

export async function buscarPessoa(busca) {
  return buscarJson(`${API_URL}/api/pessoas?busca=${encodeURIComponent(busca)}`)
}
