
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

let flashOpacity = 0;
let shakeDuration = 0;
const shakeIntensity = 0.5; // Qué tanto se mueve (en unidades del canvas)
let flashColor = "255, 255, 255";
let isGameOver = false;

let isPhaseTwo = false;
let isPhaseThree = false;
let isPhaseFour = false;
let isPhaseFive = false;

const background = new Image();
background.src = null; // tu ruta


// function createDebugButton() {
//     const btn = document.createElement('button');
//     btn.innerText = "Debug: Siguiente Fase";
    
//     // Estilos para que el botón flote y sea visible
//     btn.style.position = "fixed";
//     btn.style.top = "10px";
//     btn.style.right = "10px";
//     btn.style.zIndex = "9999";
//     btn.style.padding = "10px";
//     btn.style.cursor = "pointer";
//     btn.style.backgroundColor = "#ff00ff";
//     btn.style.color = "white";
//     btn.style.border = "none";
//     btn.style.borderRadius = "5px";

//     document.body.appendChild(btn);

//     btn.onclick = () => {
//         // Lógica para saltar a la siguiente fase
//         if (currentPhase === 1) {
//             currentPhase = 2;
//             activatePhaseTwo();
//         } else if (currentPhase === 2) {
//             currentPhase = 3;
//             activatePhaseThree();
//         } else if (currentPhase === 3) {
//             currentPhase = 4;
//             activatePhaseFour();
//         } else if (currentPhase === 4) {
//             currentPhase = 5;
//             activatePhaseFive();
//         }
        
//         console.log("Debug: Saltaste a la fase " + currentPhase);
//         // Actualizamos el texto en pantalla (si tienes el elemento)
//         const phaseElement = document.getElementById('phase_game');
//         if (phaseElement) phaseElement.textContent = "Phase " + currentPhase;
//     };
// }





let currentPhase = 1;
const phaseElement = document.getElementById('phase_game');
phaseElement.textContent = "Phase " + currentPhase;

let bgMusic = new Audio('audio/end_game.mp3');
bgMusic.loop = true; // Para que no se detenga
bgMusic.volume = 0.4;


let comboText = "";
let comboTimer = 0;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const nextCanvas = document.getElementById('next');
const nextContext = nextCanvas.getContext('2d');

const holdCanvas = document.getElementById('hold');
const holdContext = holdCanvas.getContext('2d');

let highScore = localStorage.getItem('tetris_high_score') || 0;
// Si tienes un elemento en el HTML para mostrarlo:



const arena = createMatrix(12, 20);

const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    next: null, // Guardamos la que viene
    hold: null, // Guardamos el hold
    score: 0,
};




document.getElementById('restart-btn').addEventListener('click', () => {
    // 1. Limpiar tablero y puntos
    arena.forEach(row => row.fill(0));
    player.score = 0;
    displayedScore = 0;

    
    // 2. Ocultar el menú
    document.getElementById('game-over-overlay').classList.add('hidden');

    // 3. Resetear estado y arrancar el bucle de nuevo

    bgMusic.pause();
    bgMusic.currentTime = 0;
    // background.src = "img/javascript_main.webp"
    background.src = null;
    
    currentPhase = 1;
    phaseElement.textContent = "Phase 1";

    isPhaseTwo = false;
    isPhaseThree = false;
    isPhaseFour = false;
    isPhaseFive = false;


    scoreElement.innerText = displayedScore;
    // highScoreElement.style.color = "#650bff"; 
    isGameOver = false;
    updateScore();
    playerReset();
    update();
});


// window.addEventListener("keydown", function(e) {
//     if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
//         e.preventDefault();
//     }
// }, false);




// Escalamos todo 20 veces. 
// Así, si dibujamos algo de 1x1, en pantalla se verá de 20x20px.
context.scale(20, 20);

function triggerShake(duration = 10) {
    shakeDuration = duration;
}
let Active_music = false;

const btn = document.getElementById('btn-stop-music');

btn.addEventListener('click', () => {
    Active_music = !Active_music;
    btn.textContent = !Active_music ? "🔇 Muted" : "🔊 Active Music";
    
    if (!Active_music) {
        // Si hay fases activas, quizá quieras reanudar la música
        if (currentPhase >= 2) bgMusic.play(); 
        audioCtx.play();
    } else {
        // Aquí pausamos la música globalmente
        bgMusic.pause();
        audioCtx.pause();

    }
});


const holyAudio = new Audio('audio/cruz.mp3');
const point_x1 = new Audio('audio/point_1.mp3');
const point_x2 = new Audio('audio/point_2.mp3');
const point_x3 = new Audio('audio/point_3.mp3');
const point_x4 = new Audio('audio/point_4.mp3');

const point_w_ok = new Audio('voice/ok_sound.mp3');
const point_w_excelent = new Audio('voice/excelent_sound.mp3');
const point_w_ohh = new Audio('voice/good_sound.mp3');
// const point_w_divine = new Audio('voice/divine_sound.mp3');


function play_point_select(sound) {
    if (Active_music) return;

    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }    
    
    sound.currentTime = 0;
    sound.volume = 0.5;
    
    // ¡IMPORTANTE! Sin el .play() no suena nada
    sound.play().catch(e => console.log("Error al reproducir:", e));
}

function play_voice_select(sound) {
    if (Active_music) return;

    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }    
    
    sound.currentTime = 0;
    sound.volume = 0.6;
    
    // ¡IMPORTANTE! Sin el .play() no suena nada
    sound.play().catch(e => console.log("Error al reproducir:", e));
}


function playHolySound() {
    if (Active_music) return;

    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    holyAudio.currentTime = 0; 
    holyAudio.volume = 0.7;
    
    holyAudio.play().catch(e => console.log("Error al reproducir holyAudio:", e));
    
    if (typeof playTone === "function") {
        playTone(523.25, 'triangle', 0.4); 
    }
}

function playTone(freq, type, duration) {
    if (Active_music) return;

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = type; // 'sine', 'square', 'sawtooth', 'triangle'
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
}



function createPiece(type) {
    if (type === 'T') {
        return [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0],
        ];
    } else if (type === 'O') {
        return [
            [2, 2],
            [2, 2],
        ];
    } else if (type === 'L') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3],
        ];
    } else if (type === 'J') {
        return [
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0],
        ];
    } else if (type === 'I') {
        return [
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'Z') {
        return [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0],
        ];
    } else if (type === 'K') {
        return [
            [0, 8, 0],
            [8, 8, 8],
            [0, 8, 0],
            [0, 8, 0],
        ];
    }
}



const message_appaer_cruz = [
    '¡OHHH!',
    ':O',
    'HA!',
    ':P',
    'Take :>',
    'Surprise',
    'Ohuuu!',
    'HEHE!'
]



function playerReset() {
    const pieces = 'ILJOTSZ';
    let nextType;
    if (!player.next) {
        let firstType = pieces[Math.random() * pieces.length | 0];
        player.next = {
            matrix: createPiece(firstType),
            type: firstType
        };
    }

    player.matrix = player.next.matrix;
    player.type = player.next.type;


    if (Math.random() < 0.04) {
        nextType = 'K'; // 4% de probabilidad
    } else {
        nextType = pieces[Math.random() * pieces.length | 0];
    }

    
    player.next = {
        matrix: createPiece(nextType),
        type: nextType
    };  

    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);



    if (player.type === 'K') {
        playHolySound(); // Llamamos a la función del coro
        createParticles(player.pos.x, player.pos.y, '#FFD700');
        flashColor = "255, 223, 0"; // Un destello dorado (opcional)
        flashOpacity = 0.5;
        comboText = message_appaer_cruz[Math.floor(Math.random() * message_appaer_cruz.length)];
        comboTimer = 25
    }

    if (collide(arena, player)) {
        isGameOver = true; // Detenemos la lógica
        
        // Mostramos el menú de Game Over
        document.getElementById('game-over-overlay').classList.remove('hidden');
        document.getElementById('final-score').innerText = "Points total: " + player.score;

        arena.forEach(row => row.fill(0));
        player.score = 0;
        flashColor = "148, 13, 13"; // Rojo oscuro
        flashOpacity = 1.0;         // Opacidad total para que sea súbito
        playTone(100, 'sawtooth', 0.7);

        updateScore();
    }
}


function playerHardDrop() {
    const startY = player.pos.y; // Guardamos dónde empezó

    while (!collide(arena, player)) {
        player.pos.y++;
    }
    player.pos.y--; // Retrocede uno

    // Si retrocedió más arriba de donde empezó, lo corregimos
    if (player.pos.y < startY) {
        player.pos.y = startY;
    }

    // if (player.type !== "K") {
    //     playTone(350, 'sawtooth', 0.1);
    // } else {
    //     canHold = true;
    // }
    canHold = true;

    // triggerShake(3);
    // flashOpacity = 0.4;
    playTone(150, 'sawtooth', 0.2);

    // Al llegar al fondo, ejecutamos la misma lógica que el drop normal
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();

    dropCounter = 0;
}


function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);

        canHold = true; // Ahora el jugador puede volver a usar el Hold

        playerReset(); // Esta función la crearemos ahora para dar una pieza nueva
        arenaSweep();  // ¡Revisamos si hubo líneas completas!
        updateScore(); // Actualizamos el marcador en pantalla
    }
    dropCounter = 0;
}


function playerMove(dir) {
    player.pos.x += dir;

    playTone(200, 'sine', 0.05);

    if (collide(arena, player)) {
        player.pos.x -= dir; // Si choca, anulamos el movimiento
    }
}


function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            // Intercambio de valores (Transposición)
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}


const message_negative_option = [
    'NO!',
    'WHAT!',
    'ROTATE NO',
    'BRUH',
    'NINE?',
    'NO X999',
    '>:c'
]

function playerRotate(dir) {
    if (player.type === 'K') {
        playTone(250, 'sawtooth', 0.2);
        comboText = message_negative_option[Math.floor(Math.random() * message_negative_option.length)];
        comboTimer = 20
        // triggerShake(1); 
        return; 
    }

    const pos = player.pos.x;
    let offset = 1;


    rotate(player.matrix, dir);
    
    playTone(300, 'triangle', 0.1);
    
    // El "Wall Kick": Si al rotar chocas con una pared, 
    // el juego intenta empujarte a los lados para que la pieza quepa.
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir); // Si no cabe de ninguna forma, deshacemos rotación
            player.pos.x = pos;
            return;
        }
    }
}











const particles_showblosson = [];

function spawnParticlesBlosson(amount = 4) {
    for (let i = 0; i < amount; i++) {
        particles_showblosson.push({
            x: Math.random() * arena[0].length,
            y: 0, // Empiezan arriba
            vx: (Math.random() - 0.5) * 0.06, // ligera variación horizontal
            vy: (Math.random() * 0.1 + 0.001), // velocidad hacia ARRIBA
            size: Math.random() * 0.1 + 0.08,
            life: 1 // opacidad
        });
    }
}


function updateParticulesBlosson() {
    for (let i = particles_showblosson.length - 1; i >= 0; i--) {
        const p = particles_showblosson[i];

        // Movimiento
        p.x += p.vx;
        p.y += p.vy;

        // Desvanecer
        p.life -= 0.01;

        // Dibujar
        context.globalAlpha = p.life;
        context.fillStyle = "white";
        context.fillRect(p.x, p.y, p.size, p.size);

        // Eliminar si ya no vive o salió de pantalla
        if (p.life <= 0 || p.y < 0) {
            particles_showblosson.splice(i, 1);
        }
    }

    context.globalAlpha = 1;
}






let particles = [];

function createParticles(x, y, color, count=7) {
    const count_part = count; // Cantidad de trocitos por bloque
    for (let i = 0; i < count_part; i++) {
        particles.push({
            x: x + 0.5, // Empezar en el centro del bloque
            y: y + 0.5,
            vx: (Math.random() - 0.5) * 0.4, // Velocidad aleatoria X
            vy: (Math.random() - 0.5) * 0.4, // Velocidad aleatoria Y
            life: 1.0,   // Opacidad inicial
            color: color
        });
    }
}


function updateAndDrawParticles() {
    particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02; // Se desvanecen poco a poco

        if (p.life <= 0) {
            particles.splice(index, 1);
        } else {
            context.globalAlpha = p.life;
            context.fillStyle = p.color;
            // Dibujamos cuadritos pequeños (0.1 unidades de escala)
            context.fillRect(p.x, p.y, 0.1, 0.1);
        }
    });
    context.globalAlpha = 1.0; // Resetear transparencia
}


const colors = [
    null,
    '#8f0000', // T
    '#002fb1', // O
    '#008f05', // L
    '#730079', // J
    '#a85a00', // I
    '#cfb93d', // S
    '#a70764', // Z
    '#9494946a', // Cruz
];



document.addEventListener('keydown', event => {
    if (isGameOver || clearingLines.length > 0) return;

    if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => {
            console.log("Audio desbloqueado con éxito");
        });
    }

    // Bloqueamos el scroll de las flechas y espacio
    if ([37, 38, 39, 40, 32].includes(event.keyCode)) {
        event.preventDefault();
    }

    if (event.keyCode === 37) { // Izquierda
        playerMove(-1);
    } else if (event.keyCode === 39) { // Derecha
        playerMove(1);
    } else if (event.keyCode === 40) { // Abajo (Soft Drop)
        playerDrop();
    } else if (event.keyCode === 81) { // Q (Rotar izquierda)
        playerRotate(-1);
    } else if (event.keyCode === 69) { // E (Rotar derecha)
        playerRotate(1);
    } else if (event.keyCode === 38) { // W (Hard Drop - Instantáneo)
        playerHardDrop();
    } else if (event.keyCode === 67 && player.type !== "K") { // C (Guardar bloque)
        playerHold();
    }
});


function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}



// ############################################### //

// Función para dibujar la matriz en el canvas
function draw() {
    context.save();

    if (shakeDuration > 0) {
        const dx = (Math.random() - 0.5) * shakeIntensity;
        const dy = (Math.random() - 0.5) * shakeIntensity;
        
        context.translate(dx, dy);
        shakeDuration--;
    }

    context.strokeStyle = '#222';
    context.lineWidth = 0.02;
    for (let i = 0; i < arena[0].length; i++) {
        for (let j = 0; j < arena.length; j++) {
            context.strokeRect(i, j, 1, 1);
        }
    }


    context.fillStyle =
        isPhaseTwo ? 'rgba(34, 13, 29, 1)' :
        isPhaseThree ? 'rgb(57, 14, 14)' :
        isPhaseFour ? 'rgb(32, 8, 44)' :
        isPhaseFive ? 'rgb(13, 13, 74)' :
        '#000';

    context.fillRect(0, 0, canvas.width, canvas.height);

    context.save();
    // drawImageBackground();
    context.restore();
    spawnParticlesBlosson(1)



    // 2. LÍNEA ROJA DE LÍMITE
    context.strokeStyle = 'rgba(255, 0, 0, 0.574)'; // Rojo semi-transparente
    context.lineWidth = 0.1; // Muy delgada para que no estorbe
    context.beginPath();
    // Dibujamos la línea en la fila 2 (puedes cambiar el 2 por 1 o 3)
    context.moveTo(0, 2); 
    context.lineTo(arena[0].length, 2);
    context.stroke();

    drawMatrix(arena, {x: 0, y: 0}, context);
    
    // --- Lógica de la Sombra ---
    const ghost = {
        pos: {x: player.pos.x, y: player.pos.y},
        matrix: player.matrix
    };

    // Empujamos la sombra hacia abajo hasta que choque
    const ghostStartY = ghost.pos.y;
    while (!collide(arena, ghost)) {
        ghost.pos.y++;
    }
    ghost.pos.y--;
    if (ghost.pos.y < ghostStartY) ghost.pos.y = ghostStartY;

    context.globalAlpha = 0.3; // Opacidad baja
    drawMatrix(ghost.matrix, ghost.pos, context);
    context.globalAlpha = 1.0; // Resetear opacidad
    
    drawMatrix(player.matrix, player.pos, context);

    if (flashOpacity > 0) {
        context.fillStyle = `rgba(${flashColor}, ${flashOpacity})`;
        context.fillRect(0, 0, canvas.width, canvas.height);
        flashOpacity -= 0.02;
    }

    updateAndDrawParticles();
    updateParticulesBlosson();
    updateWhiteblock();

    ShowTextScreen();

    context.restore();

    drawNext();
}





function ShowTextScreen() {
    if (comboTimer > 0) {
        context.font = "1px 'Press Start 2P'"; // Recuerda que estamos escalados a 20
        context.fillStyle = "yellow";
        context.textAlign = "center";
        context.fillText(comboText, arena[0].length / 2, 5);
        comboTimer--;
    }
}




function drawMatrix(matrix, offset, contexto) {
    // Si por algún error matrix no es un array, salimos de la función sin romper el juego
    if (!Array.isArray(matrix)) return;


    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                const color = colors[value];
                
                // Efecto de brillo (Glow)
                contexto.shadowBlur = 2;
                contexto.shadowColor = color;
                
                contexto.fillStyle = color;
                contexto.fillRect(x + offset.x, y + offset.y, 1, 1);

                // Dibujar un pequeño borde interno para que se vea más detallado
                contexto.shadowBlur = 0; // Quitamos el brillo para el borde
                contexto.strokeStyle = '#ffffff7f';
                contexto.lineWidth = 0.05;
                contexto.strokeRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}







// ############################################### //


function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}


function removeLine(y) {
    const row = arena.splice(y, 1)[0];
    row.fill(0);
    arena.unshift(row);
}



// ############################################### //

function LinearWhiteBlock() {
    for (let i = clearingLines.length - 1; i >= 0; i--) {
        clearingLines[i].timer--;
        if (clearingLines[i].timer <= 0) {
            removeLine(clearingLines[i].y);
            clearingLines.splice(i, 1);
        }
    }
}

function updateWhiteblock() {
    clearingLines.forEach(line => {
        context.fillStyle = "white";
        context.globalAlpha = Math.sin(line.timer * 0.5);
        context.fillRect(0, line.y, arena[0].length, 1);
        context.globalAlpha = 1;
        createParticles(6.5, line.y, '#f700ff', 5)
    });
}


// ############################################### //


let dropCounter = 0;
let dropInterval = 1000; // 1 segundo en milisegundos
let lastTime = 0;

function update(time = 0) {
    if (isGameOver) return;
    // Calculamos el tiempo transcurrido (Delta Time)
    const deltaTime = time - lastTime;
    lastTime = time;

    LinearWhiteBlock();
    
    // Acumulamos el tiempo para la gravedad
    dropCounter += deltaTime;
    if (clearingLines.length === 0) {
        // Acumulamos el tiempo para la gravedad solo si no hay animaciones
        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            playerDrop();
        }
    };
    draw();
    requestAnimationFrame(update);
}

// ############################################### //



function drawImageBackground() {
    context.globalAlpha = 0.1;
    context.drawImage(background, 0, 0, 15, 20);
}




// ############################################### //



let clearingLines = [];


function arenaSweep() {
    let linesCleared = 0;
    let points = 0

    // Recorremos desde la última fila hacia arriba
    outer: for (let y = arena.length - 1; y >= 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        // Guardamos la línea para animar
        clearingLines.push({
            y: y,
            timer: 20 // frames de animación
        });
        linesCleared++;
    }
    createParticles(player.pos.x, player.pos.y, '#ff3300', 12);


    if (linesCleared > 0) {
        player.score += (linesCleared * 10) * linesCleared;
        
        if (player.type === 'K') {
            points = 10;
            player.score += linesCleared * points;
            comboText = "DIVINE!";
        } else {
            if (linesCleared === 1) {
                comboText = "Ok!" ;
                points = 4;
                player.score += linesCleared * points;
                play_point_select(point_x1)
                play_voice_select(point_w_ok)
            } else if (linesCleared === 2) {
                comboText = "GOOD!";
                points = 6;
                player.score += linesCleared * points;
                play_point_select(point_x2)
                play_voice_select(point_w_ohh)
            } else if (linesCleared === 3) {
                comboText = "EXCELENT!";
                points = 8;
                player.score += linesCleared * points;
                play_point_select(point_x3)
                play_voice_select(point_w_excelent)
            } else if (linesCleared >= 4) {
                comboText = "PERFECT DIVINE!";
                points = 10;
                player.score += linesCleared * points;
                play_point_select(point_x4)
                play_voice_select(point_w_excelent)
            } 
        }


    comboTimer = 60;
    triggerShake(4 * linesCleared);
    points = 0;
    // playTone(523.25, 'sine', 0.1); // Nota Do
    // setTimeout(() => playTone(659.25, 'sine', 0.1), 100); // Nota Mi

    updateScore();
    }
    // console.table(arena);
}


let displayedScore = 0;
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
let scoreAnimationId;

function updateScore() {
    // document.getElementById('score').innerText = player.score;
    // document.getElementById('high-score').innerText = highScore;
    if (scoreAnimationId) {
        cancelAnimationFrame(scoreAnimationId);
    }


    function animate() {
        if (displayedScore < player.score) {
            displayedScore += Math.ceil((player.score - displayedScore) / 8); // ajusta la velocidad
            if (displayedScore > player.score) displayedScore = player.score;
            scoreElement.innerText = displayedScore;
            requestAnimationFrame(animate);
        }
    }
    animate();

    if (player.score > highScore) {
        highScore = player.score;
        localStorage.setItem('tetris_high_score', highScore);
        // highScoreElement.style.color = "#650bff"; 
        highScoreElement.classList.add('high-score-animado');
        updateHighScore();
    }
    highScoreElement.innerText = highScore;


    if (player.score >= 3000 && currentPhase < 5) {
        currentPhase = 5;
        // background.src = "img/js_teto.jpg"
        phaseElement.textContent = "Phase " + currentPhase; // ¡Aquí actualizas el texto en el HTML!
        activatePhaseFive();
    } else if (player.score >= 2000 && currentPhase < 4) {
        currentPhase = 4;
        // background.src = "img/javascript_main.webp"
        phaseElement.textContent = "Phase " + currentPhase; // ¡Aquí actualizas el texto en el HTML!
        activatePhaseFour();
    } else if (player.score >= 1500 && currentPhase < 3) {
        currentPhase = 3;
        // background.src = "img/javascript_main.webp"
        phaseElement.textContent = "Phase " + currentPhase; // ¡Aquí actualizas el texto en el HTML!
        activatePhaseThree();
    } else if (player.score >= 500 && currentPhase < 2) {
        currentPhase = 2;
        phaseElement.textContent = "Phase " + currentPhase; // ¡Aquí actualizas el texto en el HTML!
        // background.src = "img/js_teto.jpg"
        activatePhaseTwo();
    }
};


function updateHighScore(newScore) {
    if (newScore > highScore) {
        highScore = newScore;
        highScoreElement.innerText = highScore;
        
        // Aplicamos el efecto visual
        highScoreElement.classList.add('high-score-animado');
        
        // Opcional: Un pequeño salto de alegría del elemento
        highScoreElement.style.transform = "scale(1.3)";
        setTimeout(() => {
            highScoreElement.style.transform = "scale(1)";
        }, 200);
    }
}



let holdPiece = null;      // Aquí guardaremos la matriz de la pieza
let canHold = true;        // Para evitar que el jugador cambie piezas infinitamente

holdContext.scale(38, 38);

function drawHold() {
    // Limpiamos el canvas de Hold
    holdContext.fillStyle = '#000';
    holdContext.fillRect(0, 0, holdCanvas.width, holdCanvas.height);

    if (holdPiece) {
        // Reutilizamos tu lógica de dibujo pero en el contexto del Hold
        // Ajusta la escala (20 o lo que necesites) para que quepa bien
        drawMatrix(holdPiece, {x: 1, y: 1}, holdContext); 
    }
}



nextContext.scale(38, 38); // Escalado igual que el principal
function drawNext() {
    // 1. Limpiamos TODO el canvas pequeño
    // Usamos 100/20 porque el canvas mide 100 pero está escalado a 20
    nextContext.fillStyle = '#000';
    nextContext.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

    // 2. Dibujamos la pieza
    // {x: 1, y: 1} es el offset dentro del cuadrito de 5x5
    if (player.next) {
        // ERROR: drawMatrix(player.next, ...) <- Esto fallaría
        // CORRECCIÓN:
        drawMatrix(player.next.matrix, {x: 1, y: 1}, nextContext);
    }
}



function playerHold() {
    if (!canHold) return; // Si ya cambiaste en este turno, no hace nada

    if (holdPiece === null) {
        // Caso A: El inventario está vacío
        holdPiece = player.matrix; // Guardamos la actual
        playerReset();             // Generamos una nueva
    } else {
        // Caso B: Ya había una pieza guardada (Intercambio)
        const temp = player.matrix;
        player.matrix = holdPiece;
        holdPiece = temp;

        // Reposicionar la pieza al inicio (arriba y al centro)
        player.pos.y = 0;
        player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
        
        // Si al intercambiar choca (porque hay piezas arriba), es Game Over
        if (collide(arena, player)) {
            isGameOver = true;
        }
    }
    playTone(600, 'triangle', 0.2);
    canHold = false; // Bloqueamos el uso del Hold hasta que la pieza caiga
    drawHold();      // Función para dibujar la pieza guardada en su propio canvas
}






function activatePhaseTwo() {
    isPhaseTwo = true;
    
    dropInterval = 900;
    // 1. Efecto visual de transición
    flashColor = "255, 255, 255";
    flashOpacity = 0.5;
    triggerShake(25); // Un sacudón épico
    
    // 3. Iniciar la música de fondo
    bgMusic.play().catch(e => console.log("Face 1"));
}

function activatePhaseThree() {
    isPhaseTwo = false;
    isPhaseThree = true;

    dropInterval = 900;
    
    // 1. Efecto visual de transición
    flashColor = "255, 255, 255";
    flashOpacity = 0.5;
    triggerShake(27); // Un sacudón épico
    
    // 3. Iniciar la música de fondo
    bgMusic.pause();           // 1. Detenemos la canción actual
    bgMusic.currentTime = 0;   // 2. Reiniciamos el tiempo al segundo 0
    bgMusic.src = 'audio/game_face_2.mp3'; // Cambias la ruta
    bgMusic.load(); // Esto le avisa al navegador que debe cargar el nuevo archivo
    bgMusic.play().catch(e => console.log("No se pudo reproducir:", e));
}

function activatePhaseFour() {
    isPhaseThree = false;
    isPhaseFour = true;

    dropInterval = 800;
    
    // 1. Efecto visual de transición
    flashColor = "255, 255, 255";
    flashOpacity = 0.5;
    triggerShake(29); // Un sacudón épico
    
    // 3. Iniciar la música de fondo
    bgMusic.pause();           // 1. Detenemos la canción actual
    bgMusic.currentTime = 0;   // 2. Reiniciamos el tiempo al segundo 0
    bgMusic.src = 'audio/game_face_4.mp3'; // Cambias la ruta
    bgMusic.load(); // Esto le avisa al navegador que debe cargar el nuevo archivo
    bgMusic.play().catch(e => console.log("No se pudo reproducir:", e));
}

function activatePhaseFive() {
    isPhaseFour = false;
    isPhaseFive = true;

    dropInterval = 800;
    
    // 1. Efecto visual de transición
    flashColor = "255, 255, 255";
    flashOpacity = 0.5;
    triggerShake(31); // Un sacudón épico
    
    // 3. Iniciar la música de fondo
    bgMusic.pause();           // 1. Detenemos la canción actual
    bgMusic.currentTime = 0;   // 2. Reiniciamos el tiempo al segundo 0
    bgMusic.src = 'audio/game_face_5.mp3'; // Cambias la ruta
    bgMusic.load(); // Esto le avisa al navegador que debe cargar el nuevo archivo
    bgMusic.play().catch(e => console.log("No se pudo reproducir:", e));
}



// ############################################### //

// createDebugButton();
// Llamamos a la función para ver el resultado
playerReset();
updateScore();
update();