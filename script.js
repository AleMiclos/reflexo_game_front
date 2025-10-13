// --- Elementos do DOM ---
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const gameOverScreen = document.getElementById('gameOverScreen');

const usernameInput = document.getElementById('username');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');

const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const square = document.getElementById('square');
const progress = document.getElementById('progress');
const gameContainer = document.querySelector('.container');

const finalUsernameEl = document.getElementById('finalUsername');
const finalScoreEl = document.getElementById('finalScore');
const ratingStarsContainer = document.getElementById('ratingStars');

// --- Variáveis do Jogo ---
let score = 0;
let timeLeft = 15;
let gameInterval;
let username = "ANÔNIMO";
let finalRating = 0; // Armazena a avaliação final

// --- Lógica Principal ---
function startGame() {
    username = usernameInput.value.trim() || "ANÔNIMO";
    
    // Resetar estado
    score = 0;
    timeLeft = 15;
    scoreEl.textContent = score;
    timerEl.textContent = timeLeft;
    finalRating = 0; // Reseta a avaliação para a nova partida

    // Trocar telas
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    gameScreen.style.display = 'flex';

    // Iniciar o jogo
    moveSquare();
    gameInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    timeLeft--;
    timerEl.textContent = timeLeft;
    progress.style.width = (timeLeft / 15) * 100 + '%';

    if (timeLeft <= 0) {
        endGame();
    }
}

function endGame() {
    clearInterval(gameInterval);
    
    // Atualizar tela de fim de jogo
    finalUsernameEl.textContent = username.toUpperCase();
    finalScoreEl.textContent = score;
    
    // Trocar telas
    gameScreen.style.display = 'none';
    gameOverScreen.style.display = 'flex';

    // Configurar as estrelas de avaliação
    setupRatingStars();
}

function moveSquare() {
    const containerWidth = gameContainer.clientWidth;
    const containerHeight = gameContainer.clientHeight;

    // Garante que o quadrado não saia da área visível
    const maxX = containerWidth - square.clientWidth - 20;
    const maxY = containerHeight - square.clientHeight - 80;

    const randomX = Math.floor(Math.random() * maxX) + 10;
    const randomY = Math.floor(Math.random() * maxY) + 60;

    square.style.left = randomX + 'px';
    square.style.top = randomY + 'px';
}

// --- Lógica da Avaliação por Estrelas ---
function setupRatingStars() {
    ratingStarsContainer.innerHTML = ''; // Limpa estrelas antigas

    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.classList.add('star');
        star.textContent = '★';
        star.dataset.value = i; // Armazena o valor da estrela (1 a 5)

        // Evento de passar o mouse por cima
        star.addEventListener('mouseover', () => handleStarHover(i));
        
        // Evento de tirar o mouse de cima
        star.addEventListener('mouseout', resetStarHover);

        // Evento de clique para confirmar a avaliação
        star.addEventListener('click', () => handleStarClick(i));
        
        ratingStarsContainer.appendChild(star);
    }
}

function handleStarHover(hoverValue) {
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        if (star.dataset.value <= hoverValue) {
            star.classList.add('hover');
        } else {
            star.classList.remove('hover');
        }
    });
}

function resetStarHover() {
    document.querySelectorAll('.star').forEach(star => star.classList.remove('hover'));
}

function handleStarClick(clickValue) {
    finalRating = clickValue;
    const stars = document.querySelectorAll('.star');
    
    stars.forEach(star => {
        star.classList.remove('selected', 'hover'); // Limpa estilos
        if (star.dataset.value <= finalRating) {
            star.classList.add('selected'); // Aplica o estilo de selecionado
        }
    });
    console.log(`Avaliação registrada: ${finalRating} estrelas.`);
}

// --- Event Listeners ---
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', () => {
    // Ao voltar, esconde a tela de game over e mostra a inicial
    gameOverScreen.style.display = 'none';
    startScreen.style.display = 'flex';
});

square.addEventListener('click', () => {
    score++;
    scoreEl.textContent = score;
    moveSquare();
});