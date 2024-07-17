const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
const grid = 32;
const tetrominoes = [
    // I
    [[1, 1, 1, 1]],
    // J
    [[1, 0, 0], [1, 1, 1]],
    // L
    [[0, 0, 1], [1, 1, 1]],
    // O
    [[1, 1], [1, 1]],
    // S
    [[0, 1, 1], [1, 1, 0]],
    // T
    [[0, 1, 0], [1, 1, 1]],
    // Z
    [[1, 1, 0], [0, 1, 1]]
];

const colors = [
    null,
    'red',
    'green',
    'blue',
    'yellow',
    'purple',
    'cyan',
    'orange'
];

let tetromino = null;
let color = null;
let board = [];

function createBoard() {
    for (let row = 0; row < 20; row++) {
        board[row] = [];
        for (let col = 0; col < 10; col++) {
            board[row][col] = 0;
        }
    }
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = color;
                context.fillRect((offset.x + x) * grid, (offset.y + y) * grid, grid - 1, grid - 1);
            }
        });
    });
}

function collide(board, tetromino) {
    const [m, o] = [tetromino.matrix, tetromino.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (board[y + o.y] && board[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function merge(board, tetromino) {
    tetromino.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                board[y + tetromino.pos.y][x + tetromino.pos.x] = value;
            }
        });
    });
}

function rotate(matrix) {
    const N = matrix.length;
    const result = [];
    for (let y = 0; y < N; ++y) {
        result.push([]);
        for (let x = 0; x < N; ++x) {
            result[y][x] = matrix[N - 1 - x][y];
        }
    }
    return result;
}

function playerDrop() {
    tetromino.pos.y++;
    if (collide(board, tetromino)) {
        tetromino.pos.y--;
        merge(board, tetromino);
        tetrominoReset();
        boardSweep();
    }
    dropCounter = 0;
}

function playerMove(offset) {
    tetromino.pos.x += offset;
    if (collide(board, tetromino)) {
        tetromino.pos.x -= offset;
    }
}

function playerRotate() {
    const pos = tetromino.pos.x;
    let offset = 1;
    tetromino.matrix = rotate(tetromino.matrix);
    while (collide(board, tetromino)) {
        tetromino.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > tetromino.matrix[0].length) {
            tetromino.matrix = rotate(tetromino.matrix);
            tetromino.pos.x = pos;
            return;
        }
    }
}

function tetrominoReset() {
    const pieces = 'TJLOSZI';
    tetromino = {
        matrix: tetrominoes[pieces.indexOf(pieces[pieces.length * Math.random() | 0])],
        pos: {x: (board[0].length / 2 | 0) - 1, y: 0}
    };
    color = colors[tetrominoes.indexOf(tetromino.matrix)];
    if (collide(board, tetromino)) {
        board.forEach(row => row.fill(0));
    }
}

function boardSweep() {
    outer: for (let y = board.length - 1; y >= 0; --y) {
        for (let x = 0; x < board[y].length; ++x) {
            if (board[y][x] === 0) {
                continue outer;
            }
        }
        const row = board.splice(y, 1)[0].fill(0);
        board.unshift(row);
    }
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    drawMatrix(board, {x: 0, y: 0});
    drawMatrix(tetromino.matrix, tetromino.pos);

    requestAnimationFrame(update);
}

document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        playerMove(-1);
    } else if (event.keyCode === 39) {
        playerMove(1);
    } else if (event.keyCode === 40) {
        playerDrop();
    } else if (event.keyCode === 38) {
        playerRotate();
    }
});

createBoard();
tetrominoReset();
update();
