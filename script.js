function GameBoard(){
    const rows = 3;
    const columns = 3;
    
    const board = [];
    for(let i=0; i<rows; i++){
        board[i] = [];
        for(let j=0; j<columns; j++){
            board[i].push('');
        }
    }

    const getBoard = () => board;
    const selectCell = (row, column, playerId) => {
        try{
            if(board[row][column] !== ''){
                throw new Error('This cell has already been selected');
            }
            board[row][column] = playerId;
        }catch(err){
            throw err;
        }
    }
    const gameState = () => {
        // Check rows
        let flag = true;
        for(let i=0; i<rows; i++){
            flag = true;
            for(let j=1; j<columns; j++){
                if(board[i][j] !== board[i][j-1]){
                    flag = false;
                    break;
                }
            }
            if(flag && board[i][0] !== ''){
                return "WIN";
            }
        }

        // Check columns
        for(let i=0; i<columns; i++){
            flag = true;
            for(let j=1; j<rows; j++){
                if(board[j][i] !== board[j-1][i]){
                    flag = false;
                    break;
                }
            }
            if(flag && board[0][i] !== ''){
                return "WIN";
            }
        }

        // Check left diagnol
        flag = true;
        for(let i=1; i<rows; i++){
            if(board[i][i] !== board[i-1][i-1]){
                flag = false;
                break;
            }
        }
        if(flag && board[0][0] !== ''){
            return "WIN";
        }

        // Check right diagnol
        flag = true;
        for(let i=1; i<rows; i++){
            if(board[i][columns-i-1] !== board[i-1][columns-i]){
                flag = false;
                break;
            }
        }
        if(flag && board[rows-1][0] !== ''){
            return "WIN";
        }
        // Check if its a tie
        for(let i=0; i<rows; i++){
            for(let j=0; j<columns; j++){
                if(board[i][j] === ''){
                    flag = false;
                }
            }
        }
        if(flag){
            return "TIE";
        }
        return ''; // Game can be continued
    }

    return {
        getBoard,
        selectCell,
        gameState
    }
}

function GameController(
    playerOneName = "first",
    playerTwoName = "second"
){
    const board = GameBoard();
    const players = [
        {
            name: playerOneName,
            id: 'X'
        },
        {
            name: playerTwoName,
            id: 'O'
        }
    ]

    let currentChance = players[0];
    const switchPlayerTurn = () => {
        currentChance = currentChance === players[0] ? players[1] : players[0] 
    }
    const getActivePlayer = () => currentChance;

    let roundCanBePlayed = true;
    const playRound = (row, column) => {
        try {
            board.selectCell(row, column, currentChance.id);
        }catch(err){
            throw new Error(err.message + ' Please select some other cell!!');
        }

        const state = board.gameState();
        if(state === 'WIN'){
            roundCanBePlayed = false;
            return 'WIN';
        }else if(state === 'TIE'){
            roundCanBePlayed = false;
            return 'TIE';
        }

        switchPlayerTurn();
        return ''; // Game can be continued
    }

    const canRoundBePlayed = () => roundCanBePlayed;

    return {
        getActivePlayer,
        playRound,
        canRoundBePlayed,
        getBoard: board.getBoard
    }
}

function ScreenController(){
    let game = GameController('X', 'O');
    const resetBtn = document.querySelector('.reset-btn');
    const resetFunction = () => {
        game = GameController('X', 'O');
        updateScreen();
    }
    resetBtn.addEventListener('click', resetFunction);

    const playerTurnContainer = document.querySelector('.turn');
    const boardContainer = document.querySelector('.board');
    const dialogOverlay = document.getElementById('dialogOverlay');
    const dialogCloseBtn = document.getElementById('dialogCloseBtn');

    function showDialog(message) {
        dialogOverlay.style.display = 'flex';
        document.getElementById('dialogMessage').textContent = message;
    }

    dialogCloseBtn.addEventListener('click', () => {
        dialogOverlay.style.display = 'none';
    });

    const updateScreen = () => {
        boardContainer.textContent = '';

        const board = game.getBoard();
        const activePlayer = game.getActivePlayer();

        playerTurnContainer.textContent = `${activePlayer.name}'s turn`;

        board.forEach((row, i) => 
            row.forEach((cell, j) => {
                const cellButton = document.createElement('button');
                cellButton.classList.add('cell');

                cellButton.dataset.row = i;
                cellButton.dataset.column = j;
                cellButton.textContent = cell;
                
                boardContainer.appendChild(cellButton);
            })
        )
    }

    const clickHandlerBoard = (e) => {
        const cell = e.target;
        if(!game.canRoundBePlayed()){
            resetFunction();
            showDialog('The game has ended !!');
            return;
        }
        if(!cell.dataset.column || !cell.dataset.column){
            return;
        }
        const { row, column } = cell.dataset;
        try{
            const state = game.playRound(row, column);
            if(state === 'TIE'){
                resetFunction();
                showDialog(`The game is tied !!`);
            }else if(state === 'WIN'){
                resetFunction();
                showDialog(`${game.getActivePlayer().name} has won !!`);
            }
        }catch(err){
            showDialog(err.message);
            return;
        }

        updateScreen();
    }

    boardContainer.addEventListener('click', clickHandlerBoard);
    updateScreen();
}

ScreenController();