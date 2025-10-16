const API_URL = 'https://winnersapi-1.onrender.com/api';
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const usernameInput = document.getElementById('username');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const scoreDisplay = document.getElementById('score');
const square = document.getElementById('square');
const resultsContainer = document.getElementById('leaderboardContainer');
const initialResultsContainer = document.getElementById('leaderboardContainer');
const timerDisplay = document.getElementById('timer');
const progress = document.getElementById('progress');
const gameContainer = document.querySelector('.container');
const finalUsername = document.getElementById('finalUsername');
const finalScore = document.getElementById('finalScore');
const ratingStarsContainer = document.getElementById('ratingStars');


// --- Variáveis de Jogo ---
let score = 0;
let username;
let timerId;
let finalRating = 0;
const GAME_DURATION = 15;

// --- Lógica do Jogo ---
function handleSquareClick() {
    score++;
    scoreDisplay.textContent = score;
    square.classList.add('pulsing');
    
    setTimeout(() => {
        square.classList.remove('pulsing');
        generateRandomPosition();
    }, 150);
}

function startGame() {
    username = usernameInput.value.trim();
    if (username.length > 0) {
        startScreen.style.display = 'none';
        gameOverScreen.style.display = 'none';
        gameScreen.style.display = 'flex';
        
        score = 0;
        finalRating = 0;
        scoreDisplay.textContent = score;
        
        generateRandomPosition();
        startTimer();
        fetchResults(); // Atualiza o placar lateral ao iniciar
    } else {
        alert('Acesso negado: Insira um nome de usuário válido!');
    }
}

function generateRandomPosition() {
    const containerWidth = gameContainer.clientWidth;
    const containerHeight = gameContainer.clientHeight;
    const padding = 80;
    const squareSize = 50;
    const maxX = containerWidth - squareSize - 5;
    const maxY = containerHeight - squareSize - 35;
    const x = Math.floor(Math.random() * (maxX - padding)) + padding / 2;
    const y = Math.floor(Math.random() * (maxY - padding)) + padding / 2;
    square.style.left = `${x}px`;
    square.style.top = `${y}px`;
}

function startTimer() {
    let timeLeft = GAME_DURATION;
    timerDisplay.textContent = timeLeft;
    progress.style.width = '100%';

    timerId = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        progress.style.width = `${(timeLeft / GAME_DURATION) * 100}%`;
        if (timeLeft <= 0) {
            clearInterval(timerId);
            endGame();
        }
    }, 1000);
}

function endGame() {
    finalUsername.textContent = username.toUpperCase();
    finalScore.textContent = score;
    gameScreen.style.display = 'none';
    gameOverScreen.style.display = 'flex';
    setupRatingStars();
}

// --- Lógica de Avaliação por Estrelas ---
function setupRatingStars() {
    ratingStarsContainer.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.classList.add('star');
        star.textContent = '★';
        star.dataset.value = i;
        star.addEventListener('mouseover', () => handleStarHover(i));
        star.addEventListener('mouseout', resetStarHover);
        star.addEventListener('click', () => handleStarClick(i));
        ratingStarsContainer.appendChild(star);
    }
}

function handleStarHover(hoverValue) {
    document.querySelectorAll('.star').forEach(star => {
        star.classList.toggle('hover', star.dataset.value <= hoverValue);
    });
}

function resetStarHover() {
    document.querySelectorAll('.star').forEach(star => star.classList.remove('hover'));
}

function handleStarClick(clickValue) {
    finalRating = clickValue;
    document.querySelectorAll('.star').forEach(star => {
        star.classList.remove('hover');
        star.classList.toggle('selected', star.dataset.value <= finalRating);
    });
}

// --- Funções de API (Backend) ---
async function saveResultAndRestart() {
    if (!username) return;

    // MODIFICAÇÃO CHAVE: Força o usuário a avaliar o jogo
    if (finalRating === 0) {
        alert('Por favor, avalie o jogo com as estrelas para salvar sua pontuação!');
        return; // Impede a função de continuar
    }
    
    const gameResult = {
        gameName: 'Reflexo Neon',
        playerName: username,
        score: score,
        timePlayed: GAME_DURATION,
        rating: finalRating
    };
        
    try {
        const response = await fetch(`${API_URL}/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gameResult)
        });
        if (response.ok) {
            console.log("Resultado salvo com sucesso!");
        } else {
            console.error("Falha ao salvar o resultado.");
        }
    } catch (error) {
        console.error('Erro de conexão ao salvar resultado:', error);
    }

    // Após salvar, volta para a tela inicial
   gameOverScreen.style.display = 'none';
    startScreen.style.display = 'flex';
    // MODIFICAÇÃO AQUI: Passe os dados do jogador para destacar no placar
    fetchResults(username, score);
}


async function fetchResults(currentPlayerName = null, currentPlayerScore = null) {
    const container = document.getElementById('leaderboardContainer');
    container.innerHTML = "<p>Carregando placar...</p>";

    try {
        const response = await fetch(`${API_URL}/leaderboard/Reflexo Neon`);
        if (!response.ok) throw new Error('Falha na resposta do servidor');
        
        const results = await response.json();
        
        // Construindo a tabela refinada
        let htmlContent = `
            <table class="results-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Player</th>
                        <th>Score</th>
                    </tr>
                </thead>
                <tbody>
        `;

        if (results.length > 0) {
            results.forEach((result, index) => {
                // Verifica se esta é a linha do jogador atual para aplicar o destaque
                const isPlayerHighlight = result.playerName === currentPlayerName && result.score === currentPlayerScore;
                const highlightClass = isPlayerHighlight ? 'class="player-highlight"' : '';

                htmlContent += `
                    <tr ${highlightClass}>
                        <td class="rank">${index + 1}</td>
                        <td>${result.playerName.toUpperCase()}</td>
                        <td>${result.score}</td>
                    </tr>
                `;
            });
        } else {
            htmlContent += '<tr><td colspan="3">Seja o primeiro a jogar!</td></tr>';
        }

        htmlContent += '</tbody></table>';
        container.innerHTML = htmlContent;

    } catch (error) {
        console.error('Erro ao carregar os resultados:', error);
        container.innerHTML = "<p>Não foi possível carregar o placar.</p>";
    }
}

// --- Event Listeners Iniciais ---
square.addEventListener('click', handleSquareClick);
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', saveResultAndRestart);

window.onload = fetchResults;