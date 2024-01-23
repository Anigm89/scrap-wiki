const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const app = express();

const url = 'https://es.wikipedia.org/wiki/Categor%C3%ADa:M%C3%BAsicos_de_rap';

app.get('/', (req, res) => {
    axios.get(url).then((response) => {
    
        if(response.status === 200){
            const html = response.data;

            const $ = cheerio.load(html);
            const titulo = $('#firstHeading').text();  


            const links = [];

            $('#mw-pages a').each((index, element) => {
                const link = $(element).attr('href')
                links.push(link);
            });
           

            res.send(`
            <h1>${titulo}</h1>
            <h2>Enlaces</h2>
            <ul>
                ${links.map(link => `<li><a href="${encodeURIComponent(link)}">${link}</a></li>`).join('')}
            </ul>
            `);
        }
    })    
            
    .catch (error => {
        console.log('Error. Algo ha ido mal');
        res.status(500).send('Error 500. Error del servidor')
    });
})

app.get('/:rapero', async (req, res) => {
    const rapero = req.params.rapero;
    if (rapero === 'favicon.ico') {
        return res.status(404).end();
    }
    const decodedRapero = decodeURIComponent(rapero);

    try{
        const { nombre, imgs, textos } = await datosRapero(decodedRapero);
       
        res.send(`
        <h1> ${nombre}</h1>
        ${imgs.map(img => `<img src="${img}" alt="${img}"></img>`).join('')}
        ${textos.map(texto => `<p>${texto}</p>`).join('')}
        `)
    }
   
    catch(error){
        console.log('error en /:rapero');
        res.status(500).send('Error interno');
    }
});


app.listen(3000, () => {
    console.log('Express está escuchando en el puerto http://localhost:3000')
})

async function raperos(links) {
    return Promise.all(links.map(linkrapero => datosRapero(linkrapero)));
}


function datosRapero(linkrapero){
   return axios.get(`https://es.wikipedia.org${linkrapero}`).then(response =>{
   
   if(response.status === 200){ 
        const htmlrapero = response.data;
        const $ = cheerio.load(htmlrapero)

        const nombre = $('.mw-page-title-main').text();
    

        const imgs = [];
        $('img').each((index,element) => {
            const img = $(element).attr('src');
            imgs.push(img)
        })
        const textos = [];
        $('p').each((i,elem) => {
            const texto = $(elem);
            textos.push(texto)
        })


    return { nombre, imgs, textos };

    }
   })
   .catch(error =>{`Error in ${linkrapero}: ${error.message}`})
}

