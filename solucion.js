const express = require('express')
const app = express()
const axios = require('axios')
const cheerio = require('cheerio')

const url = 'https://es.wikipedia.org/wiki/Categor%C3%ADa:M%C3%BAsicos_de_rap'


app.get('/', async (req, res) => {
  try {
    const response = await axios.get(url)
    const html = response.data
    const $ = cheerio.load(html)

    const links = []
    $('#mw-pages a').each((index, element) => {
      const link = $(element).attr('href')
      const url = `https://es.wikipedia.org${link}`
      links.push(url)
      console.log('links--->',url)
    })

    const datosCompletos = []

    for(const link of links) {
      const respuestaPagina = await axios.get(link)
      const html = respuestaPagina.data
      const $ = cheerio.load(html)

      let data = {
        imagenes: [],
        parrafos: []
      }

      data.titulo = $('title').text()
      $('img').each((index, element) => {
        const src = $(element).attr('src')
        data.imagenes.push(src)
        console.log('images--->',src)
      })
      $('p').each((index, element) => {
        const parrafo = $(element).text()
        data.parrafos.push(parrafo)
        console.log('parrafos--->',parrafo)
      })

      datosCompletos.push(data)
      console.log(data)

    } 

     res.send(`
      <ul>
        ${datosCompletos.map(dato => `<li><h2>${dato.titulo}</h2>
        imagenes: ${dato.imagenes.map(img => `<p>${img}</p>`).join('')} 
        párrafos: ${dato.parrafos.map(parrafo => `<p>${parrafo}</p>`).join('')} 
        </li>`).join('')}
      </ul>
     `
     )
    //   `
    //  <ul>
    //  ${datosCompletos.map(dato => `
    //   <li>
    //     Título:${dato.titulo}
    //     Imagenes: ${dato.imagenes.map(img => `<p>${img}</p>`)}
    //     Párrafos: ${dato.parrafos.map(parrafo => `<p>${parrafo}</p>`)}
    //   </li>
    // `)}
    //  </ul>
    //  `

  } catch(error){
    console.log('error en /:rapero');
    res.status(500).send('Error interno');
  }
})



app.listen(3000, () => {
  console.log('Express está escuchando en el puerto http://localhost:3000')
})