
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

let flashOpacity = 0;
let shakeDuration = 0;
const shakeIntensity = 0.5; // Qué tanto se mueve (en unidades del canvas)
let flashColor = "255, 255, 255";
let isGameOver = false;

let isPhaseTwo = false;
let bgMusic = new Audio('audio/end_game.mp3');
bgMusic.loop = true; // Para que no se detenga
bgMusic.volume = 0.4;


let comboText = "";
let comboTimer = 0;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const nextCanvas = document.getElementById('next');
const nextContext = nextCanvas.getContext('2d');

let highScore = localStorage.getItem('tetris_high_score') || 0;
// Si tienes un elemento en el HTML para mostrarlo:



const arena = createMatrix(12, 20);

const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    next: null, // Guardamos la que viene
    score: 0,
};




document.getElementById('restart-btn').addEventListener('click', () => {
    // 1. Limpiar tablero y puntos
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
    
    // 2. Ocultar el menú
    document.getElementById('game-over-overlay').classList.add('hidden');
    
    // 3. Resetear estado y arrancar el bucle de nuevo

    isPhaseTwo = false;
    bgMusic.pause();
    bgMusic.currentTime = 0;
    

    isGameOver = false;
    playerReset();
    update(); // Volvemos a llamar al bucle principal
});


window.addEventListener("keydown", function(e) {
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);




// Escalamos todo 20 veces. 
// Así, si dibujamos algo de 1x1, en pantalla se verá de 20x20px.
context.scale(20, 20);

function triggerShake(duration = 10) {
    shakeDuration = duration;
}



const holyAudio = new Audio('audio/cruz.mp3');
const point_x1 = new Audio('audio/point_1.mp3');
const point_x2 = new Audio('audio/point_2.mp3');
const point_x3 = new Audio('audio/point_3.mp3');
const point_x4 = new Audio('audio/point_4.mp3');

function play_point_select(sound) {
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }    
    
    sound.currentTime = 0;
    sound.volume = 0.6;
    
    // ¡IMPORTANTE! Sin el .play() no suena nada
    sound.play().catch(e => console.log("Error al reproducir:", e));
}

function playHolySound() {
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


    if (Math.random() < 0.06) {
        nextType = 'K'; // 6% de probabilidad
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
        comboText = '¡OHHH!'
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
    while (!collide(arena, player)) {
        player.pos.y++;
    }
    player.pos.y--; // Subimos uno porque el while se detiene cuando YA chocó
    

    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                // Creamos partículas en la posición real de cada bloque
                createParticles(player.pos.x + x, player.pos.y + y, colors[value]);
            }
        });
    });

    triggerShake(3);
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


function playerRotate(dir) {
    if (player.type === 'K') {
        playTone(250, 'sawtooth', 0.2);
        comboText = '¡NO!'
        comboTimer = 20
        triggerShake(1); 
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



let particles = [];

function createParticles(x, y, color) {
    const count = 7; // Cantidad de trocitos por bloque
    for (let i = 0; i < count; i++) {
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
    '#e20000', // T
    '#0d4eff', // O
    '#0dff15', // L
    '#bb00c5', // J
    '#ff8800', // I
    '#ffd900', // S
    '#ff1b54', // Z
    '#9494946a', // Cruz
];



document.addEventListener('keydown', event => {
    if (isGameOver) return;
    // Bloqueamos el scroll de las flechas y espacio
    if ([37, 38, 39, 40, 32].includes(event.keyCode)) {
        event.preventDefault();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
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


    context.fillStyle = isPhaseTwo ? 'rgba(20, 0, 40, 1)' : '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);


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
    while (!collide(arena, ghost)) {
        ghost.pos.y++;
    }
    ghost.pos.y--; // Subimos un espacio porque el choque fue en el anterior

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

    if (comboTimer > 0) {
        context.font = "2px Arial"; // Recuerda que estamos escalados a 20
        context.fillStyle = "yellow";
        context.textAlign = "center";
        context.fillText(comboText, arena[0].length / 2, 5);
        comboTimer--;
    }

    context.restore();

    drawNext();

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







// ############################################### //



let dropCounter = 0;
let dropInterval = 1000; // 1 segundo en milisegundos

let lastTime = 0;
function update(time = 0) {
    if (isGameOver) return;
    // Calculamos el tiempo transcurrido (Delta Time)
    const deltaTime = time - lastTime;
    lastTime = time;

    // Acumulamos el tiempo para la gravedad
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

// ############################################### //


function arenaSweep() {
    let linesCleared = 0;

    // Recorremos desde la última fila hacia arriba
    outer: for (let y = arena.length - 1; y >= 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer; // Si falta un bloque, salta a la siguiente fila
            }
        }

        // --- FILA COMPLETA DETECTADA ---
        // 1. Quitamos la fila llena
        const row = arena.splice(y, 1)[0]; 
        
        // 2. La limpiamos (llenamos de ceros)
        row.fill(0); 
        
        // 3. La ponemos de vuelta al inicio de la matriz (arriba)
        arena.unshift(row); 

        // 4. Incrementamos y para compensar el desplazamiento y no saltar filas
        ++y; 
        linesCleared++;
    }

    if (linesCleared > 0) {
        player.score += (linesCleared * 10) * linesCleared;
        

        if (player.type === 'K') {
            points *= 20;
            comboText = "PERFECT DIVINE!";
            triggerShake(25);
        } else {
            if (linesCleared === 1) {
                comboText = "Ok!" ;
                play_point_select(point_x1)
            } else if (linesCleared === 2) {
                comboText = "GOOD!";
                play_point_select(point_x1)
            } else if (linesCleared === 3) {
                comboText = "WOW!";
                play_point_select(point_x2)
            } else if (linesCleared === 4) {
                comboText = "EXCELENT!";
                play_point_select(point_x3)
            } else if (linesCleared >= 5) {
                comboText = "GOD!";
                play_point_select(point_x4)
            } 
        }

        comboTimer = 60;
        triggerShake(8 * linesCleared);

        // playTone(523.25, 'sine', 0.1); // Nota Do
        // setTimeout(() => playTone(659.25, 'sine', 0.1), 100); // Nota Mi

        updateScore();
    }
    console.table(arena);
}


function updateScore() {
    document.getElementById('score').innerText = player.score;
    document.getElementById('high-score').innerText = highScore;

    if (player.score > highScore) {
        highScore = player.score;
        localStorage.setItem('tetris_high_score', highScore);
        // Opcional: un efecto visual cuando superas el récord
        document.getElementById('score').style.color = "#650bff"; 
    }

    if (player.score >= 500 && !isPhaseTwo) {
        activatePhaseTwo();
    }
}



function activatePhaseTwo() {
    isPhaseTwo = true;
    
    // 1. Efecto visual de transición
    flashColor = "255, 255, 255";
    flashOpacity = 0.6;
    triggerShake(25); // Un sacudón épico
    
    // 3. Iniciar la música de fondo
    bgMusic.play().catch(e => console.log("Esperando interacción para música"));

}





// ############################################### //


// Llamamos a la función para ver el resultado
playerReset();
updateScore();
update();