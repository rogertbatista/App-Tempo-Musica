const input = document.getElementById('input-busca');
const button = document.getElementById('btn');

const apiKey = 'c41b96e2d676c8aac7e937c5c58ed6b3';

const clientID = '7c3343511a1a41ed9d6482bc7f35b7ea';
const clientSecret = '0c88628cbac34e2f951b51edd24b8b26';

const ulElement = document.querySelector('.playlist-caixa');
const liElement = ulElement.querySelectorAll('li');

const videoURLs = [
    `./videos/video-1.mp4`,
    `./videos/video-2.mp4`,
    `./videos/video-3.mp4`,
    `./videos/video-4.mp4`,
    `./videos/video-5.mp4`,
    `./videos/video-6.mp4`,
    `./videos/video-7.mp4`,
    `./videos/video-8.mp4`,
    `./videos/video-9.mp4`,
    `./videos/video-10.mp4`,
    `./videos/video-11.mp4`,
    `./videos/video-12.mp4`
];

function pegarVideoAleatorio(){
    const randomIndex = Math.floor(Math.random() * videoURLs.length);
    return videoURLs[randomIndex];
}

function mostrarVideosNaTela(){
    const videoElement = document.querySelector('.video');
    const sourceElement = document.getElementById('video-source');
    const randomVideoURL = pegarVideoAleatorio();

    if(videoElement && sourceElement){
        sourceElement.src = randomVideoURL;

        videoElement.load();
    }
}

// Função que vai fazer a troca entre abrir e fechar input:text
function movimentoInput(inputValue) {
    input.style.visibility === 'hidden' ? abrirInput() : fecharInput();

    inputValue && procurarCidade(inputValue);
}

// Evento onclick o qual é criado no campo input:text no código HTML
button.addEventListener('click', function(){
    const inputValue = input.value;

    movimentoInput(inputValue);
})

// Função para fechar input:text
function fecharInput(){
    input.style.visibility = 'hidden';
    input.style.width = '40px';
    input.style.padding = '0.5rem 0.5rem 0.5rem 2.6rem';
    input.style.transition = 'all 0.5s ease-in-out 0s';
    input.value = '';
}

// Função para abrir input:text
function abrirInput() {
    input.style.visibility = 'visible';
    input.style.width = '300px';
    input.style.padding = '0.5rem 0.5rem 0.5rem 3.1rem';
    input.style.transition = 'all 0.5s ease-in-out 0s';
    input.value = '';
}

// Adiciona o evento de clicar ao pressionar a tecla enter
input.addEventListener('keyup', function(e){
    let key = e.key;

    if(key === 'Enter'){
        const inputValue = input.value;
        movimentoInput(inputValue);
    }
});

// Evento responsável por fazer o carregamento prévio do conteúdo HTML
document.addEventListener('DOMContentLoaded', function(){
    fecharInput();
    mostrarVideosNaTela();
});

// Função responsável por aplicar estilos à classe envelope dinamicamente
function mostrarEnvelope(){
    document.querySelector('.envelope').style.visibility = 'visible';
    document.querySelector('.caixa').style.alignItems = 'end';
    document.querySelector('.procura').style.position = 'initial';
}

//https://api.openweathermap.org/data/2.5/weather?q={city name}&appid={API key}

// Cria uma função assíncrona para a captura e tratamento de dados da API OpenWeather
async function procurarCidade(city){
    try{
        const dados = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=pt_br`);
        
        if(dados.status === 404){
            throw new Error;
        }else{
            const resultado = await dados.json();
            mostrarClimaNaTela(resultado);
            obterTopAlbunsPorPais(resultado.sys.country);
            mostrarEnvelope();
            mostrarVideosNaTela();
            console.log(resultado);
        }
    }catch{
        alert('A pesquisa por cidade deu errado!');
    }
}

// Função responsável por exibir na tela os elementos retornados pela API
function mostrarClimaNaTela(resultado){
    document.querySelector('.icone-tempo').src = `./assets/${resultado.weather[0].icon}.png`;
    document.querySelector('.nome-cidade').innerHTML = `${resultado.name}`;
    document.querySelector('.temperatura').innerHTML = `${Math.floor(resultado.main.temp)}°C`;
    document.querySelector('.maxTemperatura').innerHTML = `Máx: ${Math.floor(resultado.main.temp_max)}°C`;
    document.querySelector('.minTemperatura').innerHTML = `Mín: ${Math.floor(resultado.main.temp_min)}°C`;
}

//*****Comentado a partir daqui*****

// Função responsável por obter autorização para a utilização da API do Spotify
async function obterAcessoToken(){
    const credentials = `${clientID}:${clientSecret}`;
    const encodedCredentials = btoa(credentials);

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization' : `Basic ${encodedCredentials}`,
            'Content-Type': ' application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    })

    const data = await response.json();
    return data.access_token;
}

obterAcessoToken();

// 'https://api.spotify.com/v1/browse/featured-playlists?country=BR&timestamp=2023-12-06T10%3A00%3A00&limit=3'

// Função para obter a data atual
function obterDataAtual(){
    const currentDate = new Date();
    const ano = currentDate.getFullYear();
    const mes = currentDate.getMonth().toString().padStart(2, '0');
    const dia = currentDate.getDate().toString().padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
}

// Função responsável por pegar as top 3 músicas de cada país
async function obterTopAlbunsPorPais(country){
    try{
        const accessToken = await obterAcessoToken();

        const dataAtual = obterDataAtual();
        const url = `https://api.spotify.com/v1/browse/featured-playlists?country=${country}&timestamp=${dataAtual}T10%3A00%3A00&limit=3`;

        const resultado = await fetch(`${url}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })

        if(resultado.status === 404){
            throw new Error;
        }else{
            const data = await resultado.json();
            const result = data.playlists.items.map(item => ({
                name: item.name,
                image: item.images[0].url
            }))
            mostrarAlbumNaTela(result);
            console.log(result);
        }
        
    }catch{
        alert('A pesquisa por música deu errado!');
    }  
}

// Componente responsável por adicionar dinamicamente a imagem e nome das top 3 playlists de cada país
function mostrarAlbumNaTela(dados){
    liElement.forEach(function(liElement, index){
        const imgElement = liElement.querySelector('img');
        const pElement = liElement.querySelector('p');

        imgElement.src = dados[index].image;
        pElement.textContent = dados[index].name;
    });

    document.querySelector('.playlist-caixa').style.visibility = 'visible';
}