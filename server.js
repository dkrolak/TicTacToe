const app = require('express')();
const express = require('express');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require("path");

const users = [];
let lastMove = -1, boardStatus, clearBoards, saveMove, matchWinCombinations, drawBoards;

app.get('/', function (req, res) {
    res.sendFile(path.resolve('index.html'));

});
app.use(express.static('./files'));

clearBoards = () => {
    boardStatus = [
        [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ],
        [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ]
    ]

    drawBoards();
}

saveMove = (player, column, row) => {
    boardStatus[player][row - 1][column - 1] = 1;

    drawBoards();


    if (matchWinCombinations(boardStatus[player])) {
        console.log("Player  " + player + " won");
        io.emit('user won', player);
    }
}

drawBoards = () => {
    boardStatus.forEach(function (board, idx) {
        console.log("Player " + idx)
        board.forEach(function (row) {
            console.log(row)
        })
    });
}

matchWinCombinations = (board) => {
    var winCombinations = [
        [
            [1, 1, 1],
            [0, 0, 0],
            [0, 0, 0]
        ],
        [
            [0, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        [
            [0, 0, 0],
            [0, 0, 0],
            [1, 1, 1]
        ],
        [
            [1, 0, 0],
            [1, 0, 0],
            [1, 0, 0]
        ],
        [
            [0, 1, 0],
            [0, 1, 0],
            [0, 1, 0]
        ],
        [
            [0, 0, 1],
            [0, 0, 1],
            [0, 0, 1]
        ],
        [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]
        ],
        [
            [0, 0, 1],
            [0, 1, 0],
            [1, 0, 0]
        ]
    ]

    return winCombinations.some(function (combination) {
        let flag = false;

        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                let mask = combination[row][col];
                if (mask) {
                    flag = board[row][col] != mask || flag;
                }
            }
        }

        return !flag;
    })
}

clearBoards();

io.on('connection', function (socket) {
    users.push(socket.id)
    
    let position = users.indexOf(socket.id);

    console.log("You connected ", socket.id, position);
    io.to(socket.id).emit('join', position);

    socket.on('field check', (row, column, player) => {

        if (player === lastMove) {
            console.log("Player " + player + " - Not your move!")
            return;
        }

        console.log("Player " + player + " | choose R" + row + ", C" + column);
        saveMove(player, column, row);


        io.emit('field mark', row, column, player);
        lastMove = player;
    });

});



http.listen(666, () => {
    console.log('Listening: 666');
});


