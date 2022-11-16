//en este scrpit se aplica la funcionalidad mediante cuatro clases principales : game, utils , point y tetromino
//El static no se asocia a un objeto si no a una clase
class Game { 
    // Square length in pixels
    static SQUARE_LENGTH = screen.width > 420 ? 25 : 10; //la medida del cuadrado depende del tamaño de la pantalla
    //porejemplosi la pantalla es mayor a 420px va a ser de 30px o si no de 20
    static COLUMNS = 12;
    static ROWS = 25;
// por medio de este codigo se detemina el ancho y alto del tablero de tetris , teniendo en cuenta el ancho de la pantalla y el numero de filas y columnas
    static CANVAS_WIDTH = this.SQUARE_LENGTH * this.COLUMNS;
    static CANVAS_HEIGHT = this.SQUARE_LENGTH * this.ROWS;
    //Color del fondo del tablero
    static EMPTY_COLOR = "#ffffff";
    //Color de los bordes del tablero
    static BORDER_COLOR = "#b03396";
    //Color a aplicar cuando se elimina una fila completa del tablero
    static DELETED_ROW_COLOR = "#9A0680";
    // When a piece collapses with something at its bottom, how many time wait for putting another piece? (in ms)
    static TIMEOUT_LOCK_PUT_NEXT_PIECE = 300; // tiempo en que se demora en aparecer la otra ficha
    // Speed of falling piece (in ms)
    static PIECE_SPEED = 300;// velocidad en que baja la ficha entre menor sea el numero , bajara mas rapido
    // Animation time when a row is being deleted
    static DELETE_ROW_ANIMATION = 300; // tiempo en el que se demora una fila en desaparecer cuando  se complete
    // Score to add when a square dissapears (for each square)
    static PER_SQUARE_SCORE = 1; //puntaje asignado por cada cuadro que se elimmine
    static COLORS = [ // colores de las fichas
        "#557153",
        "#7D8F69",
        "#A9AF7E",
        "#E6E5A3",
        "#1A374D",
        "#406882",
        "#6998AB",
        "#B1D0E0",
        "#632626",
        "#9D5353",
        "#BF8B67",
        "#DACC96",
        "#1C0C5B",
        "#3D2C8D",
        "#916BBF",
        "#C996CC",
    ];


    //El método constructor es un metodo especial para crear e inicializar un objeto creado a partir de una clase.
//min 14:46
    constructor(canvasId) {
        //variables
        this.canvasId = canvasId;
        this.timeoutFlag = false;
        this.board = [];
        this.existingPieces = [];
        this.globalX = 0;//averiguar
        this.globalY = 0;
        this.paused = true;
        this.currentFigure = null;
        this.sounds = {};
        this.canPlay = false;
        this.intervalId = null;
        this.init();
    }

    init() {
        this.showWelcome();
        this.initDomElements();
        this.initSounds();
        this.resetGame();
        this.draw();
        this.initControls();
    }

    resetGame() {
        this.score = 0;
        this.sounds.success.currentTime = 0;
        this.sounds.success.pause();
        this.sounds.background.currentTime = 0;
        this.sounds.background.pause();
        this.initBoardAndExistingPieces();
        this.chooseRandomFigure();
        this.restartGlobalXAndY();
        this.syncExistingPiecesWithBoard();
        this.refreshScore();
        this.pauseGame();
    }

    showWelcome() {
        Swal.fire({
            title: '¡Bienvenido!',
            text: 'Disfruta de este juego tan entretenido, juega un clásico que nunca pasa de moda. Utiliza estos atájos: "R" Rotar la pieza, "P" Pausar o reanudar y las "Flechas de Dirección"',
            imageUrl: '/img/tetris.png',
            imageWidth: 400,
            imageHeight: 200,
            color: '#000',
            background: 'linear-gradient(125deg, rgba(96,255,255,1) 0%, rgba(118,118,254,1) 35%, rgba(235,119,255,1) 100%) ',
            imageAlt: 'Custom image',
            confirmButtonColor: '#4C0070',
            confirmButtonText: '¡Juega!',
        })
    }

    /* Swal.fire("¡Bienvenido!", `Tetris un juego que nunca pása de moda...¡DIVIERTETE!.

<br>
<img src="/img/tetris.png">
<style>
img{
    width: 430px;
    height:170px;
    border-radius:20px;
    box-shadow: 5px 5px 5px 1px #82748f;
}
</style>
<strong>Controles:</strong>
<ul class="list-group"><br>
<li class="list-group-item"> <kbd>P</kbd><br><br>Pausar o reanudar </li><br>
<li class="list-group-item"> <kbd>R</kbd><br><br>Rotar</li><br>
<li class="list-group-item"> <kbd>Flechas de dirección</kbd><br><br>Mover figura hacia esa dirección</li>
<li class="list-group-item"><strong>También puedes usar los botones si estás en móvil</strong></li>
</ul>

`);*/
 

    initControls() {
        document.addEventListener("keydown", (e) => {
            const { code } = e;
            if (!this.canPlay && code !== "KeyP") {
                return;
            }
            switch (code) {
                case "ArrowRight":
                    this.attemptMoveRight();
                    break;
                case "ArrowLeft":
                    this.attemptMoveLeft();
                    break;
                case "ArrowDown":
                    this.attemptMoveDown();
                    break;
                case "KeyR":
                    this.attemptRotate();
                    break;
                case "KeyP":
                    this.pauseOrResumeGame();
                    break;
            }
            this.syncExistingPiecesWithBoard();
        });

        this.$btnDown.addEventListener("click", () => {
            if (!this.canPlay) return;
            this.attemptMoveDown();
        });
        this.$btnRight.addEventListener("click", () => {
            if (!this.canPlay) return;
            this.attemptMoveRight();
        });
        this.$btnLeft.addEventListener("click", () => {
            if (!this.canPlay) return;
            this.attemptMoveLeft();
        });
        this.$btnRotate.addEventListener("click", () => {
            if (!this.canPlay) return;
            this.attemptRotate();
        });
        [this.$btnPause, this.$btnResume].forEach($btn => $btn.addEventListener("click", () => {
            this.pauseOrResumeGame();
        }));
    }

    attemptMoveRight() {
        if (this.figureCanMoveRight()) {
            this.globalX++;
        }
    }

    attemptMoveLeft() {
        if (this.figureCanMoveLeft()) {
            this.globalX--;
        }
    }

    attemptMoveDown() {
        if (this.figureCanMoveDown()) {
            this.globalY++;
        }
    }

    attemptRotate() {
        this.rotateFigure();
    }

    pauseOrResumeGame() {
        if (this.paused) {
            this.resumeGame();
            this.$btnResume.hidden = true;
            this.$btnPause.hidden = false;
        } else {
            this.pauseGame();
            this.$btnResume.hidden = false;
            this.$btnPause.hidden = true;
        }
    }

    pauseGame() {
        this.sounds.background.pause();
        this.paused = true;
        this.canPlay = false;
        clearInterval(this.intervalId);
    }

    resumeGame() {
        this.sounds.background.play();
        this.refreshScore();
        this.paused = false;
        this.canPlay = true;
        this.intervalId = setInterval(this.mainLoop.bind(this), Game.PIECE_SPEED);
    }


    moveFigurePointsToExistingPieces() {
        this.canPlay = false;
        for (const point of this.currentFigure.getPoints()) {
            point.x += this.globalX;
            point.y += this.globalY;
            this.existingPieces[point.y][point.x] = {
                taken: true,
                color: point.color,
            }
        }
        this.restartGlobalXAndY();
        this.canPlay = true;
    }

    playerLoses() {
        // Check if there's something at Y 1. Maybe it is not fair for the player, but it works
        for (const point of this.existingPieces[1]) {
            if (point.taken) {
                return true;
            }
        }
        return false;
    }


    getPointsToDelete = () => {
        const points = [];
        let y = 0;
        for (const row of this.existingPieces) {
            const isRowFull = row.every(point => point.taken);
            if (isRowFull) {
                // We only need the Y coordinate
                points.push(y);
            }
            y++;
        }
        return points;
    }

    changeDeletedRowColor(yCoordinates) {
        for (let y of yCoordinates) {
            for (const point of this.existingPieces[y]) {
                point.color = Game.DELETED_ROW_COLOR;
            }
        }
    };


    addScore(rows) {
        this.score += Game.PER_SQUARE_SCORE * Game.COLUMNS * rows.length;
        this.refreshScore();
    }


    removeRowsFromExistingPieces(yCoordinates) {
        for (let y of yCoordinates) {
            for (const point of this.existingPieces[y]) {
                point.color = Game.EMPTY_COLOR;
                point.taken = false;
            }
        }
    }


    verifyAndDeleteFullRows() {
        // Here be dragons
        const yCoordinates = this.getPointsToDelete();
        if (yCoordinates.length <= 0) return;
        this.addScore(yCoordinates);
        this.sounds.success.currentTime = 0;
        this.sounds.success.play();
        this.changeDeletedRowColor(yCoordinates);
        this.canPlay = false;
        setTimeout(() => {
            this.sounds.success.pause();
            this.removeRowsFromExistingPieces(yCoordinates);
            this.syncExistingPiecesWithBoard();
            const invertedCoordinates = Array.from(yCoordinates);
            // Now the coordinates are in descending order
            invertedCoordinates.reverse();

            for (let yCoordinate of invertedCoordinates) {
                for (let y = Game.ROWS - 1; y >= 0; y--) {
                    for (let x = 0; x < this.existingPieces[y].length; x++) {
                        if (y < yCoordinate) {
                            let counter = 0;
                            let auxiliarY = y;
                            while (this.isEmptyPoint(x, auxiliarY + 1) && !this.absolutePointOutOfLimits(x, auxiliarY + 1) && counter < yCoordinates.length) {
                                this.existingPieces[auxiliarY + 1][x] = this.existingPieces[auxiliarY][x];
                                this.existingPieces[auxiliarY][x] = {
                                    color: Game.EMPTY_COLOR,
                                    taken: false,
                                }

                                this.syncExistingPiecesWithBoard();
                                counter++;
                                auxiliarY++;
                            }
                        }
                    }
                }
            }

            this.syncExistingPiecesWithBoard()
            this.canPlay = true;
        }, Game.DELETE_ROW_ANIMATION);
    }

    mainLoop() {
        if (!this.canPlay) {
            return;
        }
        // If figure can move down, move down
        if (this.figureCanMoveDown()) {
            this.globalY++;
        } else {
            // If figure cannot, then we start a timeout because
            // player can move figure to keep it going down
            // for example when the figure collapses with another points but there's remaining
            // space at the left or right and the player moves there so the figure can keep going down
            if (this.timeoutFlag) return;
            this.timeoutFlag = true;
            setTimeout(() => {
                this.timeoutFlag = false;
                // If the time expires, we re-check if figure cannot keep going down. If it can
                // (because player moved it) then we return and keep the loop
                if (this.figureCanMoveDown()) {
                    return;
                }
                // At this point, we know that the figure collapsed either with the floor
                // or with another point. So we move all the figure to the existing pieces array
                this.sounds.tap.currentTime = 0;
                this.sounds.tap.play();
                this.moveFigurePointsToExistingPieces();
                if (this.playerLoses()) {
                    Swal.fire("Juego terminado", "Inténtalo de nuevo");
                    this.sounds.background.pause();
                    this.canPlay = false;
                    this.resetGame();
                    return;
                }
                this.verifyAndDeleteFullRows();
                this.chooseRandomFigure();
                this.syncExistingPiecesWithBoard();
            }, Game.TIMEOUT_LOCK_PUT_NEXT_PIECE);
        }
        this.syncExistingPiecesWithBoard();
    }


    cleanGameBoardAndOverlapExistingPieces() {
        for (let y = 0; y < Game.ROWS; y++) {
            for (let x = 0; x < Game.COLUMNS; x++) {
                this.board[y][x] = {
                    color: Game.EMPTY_COLOR,
                    taken: false,
                };
                // Overlap existing piece if any
                if (this.existingPieces[y][x].taken) {
                    this.board[y][x].color = this.existingPieces[y][x].color;
                }
            }
        }
    }

    overlapCurrentFigureOnGameBoard() {
        if (!this.currentFigure) return;
        for (const point of this.currentFigure.getPoints()) {
            this.board[point.y + this.globalY][point.x + this.globalX].color = point.color;
        }
    }


    syncExistingPiecesWithBoard() {
        this.cleanGameBoardAndOverlapExistingPieces();
        this.overlapCurrentFigureOnGameBoard();
    }

    draw() {
        let x = 0, y = 0;
        for (const row of this.board) {
            x = 0;
            for (const point of row) {
                this.canvasContext.fillStyle = point.color;
                this.canvasContext.fillRect(x, y, Game.SQUARE_LENGTH, Game.SQUARE_LENGTH);
                this.canvasContext.restore();
                this.canvasContext.strokeStyle = Game.BORDER_COLOR;
                this.canvasContext.strokeRect(x, y, Game.SQUARE_LENGTH, Game.SQUARE_LENGTH);
                x += Game.SQUARE_LENGTH;
            }
            y += Game.SQUARE_LENGTH;
        }
        setTimeout(() => {
            requestAnimationFrame(this.draw.bind(this));
        }, 17);
    }

    refreshScore() {
        this.$score.textContent = `Score: ${this.score}`;
    }

    initSounds() {
        this.sounds.background = Utils.loadSound("assets/New Donk City_ Daytime 8 Bit.mp3", true);
        this.sounds.success = Utils.loadSound("assets/success.wav");
        this.sounds.denied = Utils.loadSound("assets/denied.wav");
        this.sounds.tap = Utils.loadSound("assets/tap.wav");
    }

    initDomElements() {
        this.$canvas = document.querySelector("#" + this.canvasId);
        this.$score = document.querySelector("#puntaje");
        this.$btnPause = document.querySelector("#btnPausar");
        this.$btnResume = document.querySelector("#btnIniciar");
        this.$btnRotate = document.querySelector("#btnRotar");
        this.$btnDown = document.querySelector("#btnAbajo");
        this.$btnRight = document.querySelector("#btnDerecha");
        this.$btnLeft = document.querySelector("#btnIzquierda");
        this.$canvas.setAttribute("width", Game.CANVAS_WIDTH + "px");
        this.$canvas.setAttribute("height", Game.CANVAS_HEIGHT + "px");
        this.canvasContext = this.$canvas.getContext("2d");
    }

    chooseRandomFigure() {
        this.currentFigure = this.getRandomFigure();
    }

    restartGlobalXAndY() {
        this.globalX = Math.floor(Game.COLUMNS / 2) - 1;
        this.globalY = 0;
    }


    getRandomFigure() {
        /*
        * Nombres de los tetrominós tomados de: https://www.joe.co.uk/gaming/tetris-block-names-221127
        * Regresamos una nueva instancia en cada ocasión, pues si definiéramos las figuras en constantes o variables, se tomaría la misma
        * referencia en algunas ocasiones
        * */
        switch (Utils.getRandomNumberInRange(1, 7)) {
            case 1:
                /*
                El cuadrado (smashboy)

                **
                **
                */
                return new Tetromino([
                    [new Point(0, 0), new Point(1, 0), new Point(0, 1), new Point(1, 1)]
                ]);
            case 2:

                /*
                La línea (hero)

                ****
                */
                return new Tetromino([
                    [new Point(0, 0), new Point(1, 0), new Point(2, 0), new Point(3, 0)],
                    [new Point(0, 0), new Point(0, 1), new Point(0, 2), new Point(0, 3)],
                ]);
            case 3:

                /*
                La L (orange ricky)
                  *
                ***

                */

                return new Tetromino([
                    [new Point(0, 1), new Point(1, 1), new Point(2, 1), new Point(2, 0)],
                    [new Point(0, 0), new Point(0, 1), new Point(0, 2), new Point(1, 2)],
                    [new Point(0, 0), new Point(0, 1), new Point(1, 0), new Point(2, 0)],
                    [new Point(0, 0), new Point(1, 0), new Point(1, 1), new Point(1, 2)],
                ]);
            case 4:

                /*
                La J (blue ricky)
                *
                ***

                */

                return new Tetromino([
                    [new Point(0, 0), new Point(0, 1), new Point(1, 1), new Point(2, 1)],
                    [new Point(0, 0), new Point(1, 0), new Point(0, 1), new Point(0, 2)],
                    [new Point(0, 0), new Point(1, 0), new Point(2, 0), new Point(2, 1)],
                    [new Point(0, 2), new Point(1, 2), new Point(1, 1), new Point(1, 0)],
                ]);
            case 5:
                /*
               La Z (Cleveland Z)
               **
                **
               */

                return new Tetromino([
                    [new Point(0, 0), new Point(1, 0), new Point(1, 1), new Point(2, 1)],
                    [new Point(0, 1), new Point(1, 1), new Point(1, 0), new Point(0, 2)],
                ]);
            case 6:

                /*
               La otra Z (Rhode island Z)
                **
               **
               */
                return new Tetromino([
                    [new Point(0, 1), new Point(1, 1), new Point(1, 0), new Point(2, 0)],
                    [new Point(0, 0), new Point(0, 1), new Point(1, 1), new Point(1, 2)],
                ]);
            case 7:
            default:

                /*
               La T (Teewee)

                *
               ***
               */
                return new Tetromino([
                    [new Point(0, 1), new Point(1, 1), new Point(1, 0), new Point(2, 1)],
                    [new Point(0, 0), new Point(0, 1), new Point(0, 2), new Point(1, 1)],
                    [new Point(0, 0), new Point(1, 0), new Point(2, 0), new Point(1, 1)],
                    [new Point(0, 1), new Point(1, 0), new Point(1, 1), new Point(1, 2)],
                ]);
        }
    }

    initBoardAndExistingPieces() {
        this.board = [];
        this.existingPieces = [];
        for (let y = 0; y < Game.ROWS; y++) {
            this.board.push([]);
            this.existingPieces.push([]);
            for (let x = 0; x < Game.COLUMNS; x++) {
                this.board[y].push({
                    color: Game.EMPTY_COLOR,
                    taken: false,
                });
                this.existingPieces[y].push({
                    taken: false,
                    color: Game.EMPTY_COLOR,
                });
            }
        }
    }

    /**
     *
     * @param point An object that has x and y properties; the coordinates shouldn't be global, but relative to the point
     * @returns {boolean}
     */
    relativePointOutOfLimits(point) {
        const absoluteX = point.x + this.globalX;
        const absoluteY = point.y + this.globalY;
        return this.absolutePointOutOfLimits(absoluteX, absoluteY);
    }

    /**
     * @param absoluteX
     * @param absoluteY
     * @returns {boolean}
     */
    absolutePointOutOfLimits(absoluteX, absoluteY) {
        return absoluteX < 0 || absoluteX > Game.COLUMNS - 1 || absoluteY < 0 || absoluteY > Game.ROWS - 1;
    }

    // It returns true even if the point is not valid (for example if it is out of limit, because it is not the function's responsibility)
    isEmptyPoint(x, y) {
        if (!this.existingPieces[y]) return true;
        if (!this.existingPieces[y][x]) return true;
        if (this.existingPieces[y][x].taken) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * Check if a point (in the game board) is valid to put another point there.
     * @param point the point to check, with relative coordinates
     * @param points an array of points that conforms a figure
     */
    isValidPoint(point, points) {
        const emptyPoint = this.isEmptyPoint(this.globalX + point.x, this.globalY + point.y);
        const hasSameCoordinateOfFigurePoint = points.findIndex(p => {
            return p.x === point.x && p.y === point.y;
        }) !== -1;
        const outOfLimits = this.relativePointOutOfLimits(point);
        if ((emptyPoint || hasSameCoordinateOfFigurePoint) && !outOfLimits) {
            return true;
        } else {
            return false;
        }
    }

    figureCanMoveRight() {
        if (!this.currentFigure) return false;
        for (const point of this.currentFigure.getPoints()) {
            const newPoint = new Point(point.x + 1, point.y);
            if (!this.isValidPoint(newPoint, this.currentFigure.getPoints())) {
                return false;
            }
        }
        return true;
    }

    figureCanMoveLeft() {
        if (!this.currentFigure) return false;
        for (const point of this.currentFigure.getPoints()) {
            const newPoint = new Point(point.x - 1, point.y);
            if (!this.isValidPoint(newPoint, this.currentFigure.getPoints())) {
                return false;
            }
        }
        return true;
    }

    figureCanMoveDown() {
        if (!this.currentFigure) return false;
        for (const point of this.currentFigure.getPoints()) {
            const newPoint = new Point(point.x, point.y + 1);
            if (!this.isValidPoint(newPoint, this.currentFigure.getPoints())) {
                return false;
            }
        }
        return true;
    }

    figureCanRotate() {
        const newPointsAfterRotate = this.currentFigure.getNextRotation();
        for (const rotatedPoint of newPointsAfterRotate) {
            if (!this.isValidPoint(rotatedPoint, this.currentFigure.getPoints())) {
                return false;
            }
        }
        return true;
    }


    rotateFigure() {
        if (!this.figureCanRotate()) {
            this.sounds.denied.currentTime = 0;
            this.sounds.denied.play();
            return;
        }
        this.currentFigure.points = this.currentFigure.getNextRotation();
        this.currentFigure.incrementRotationIndex();
    }

    async askUserConfirmResetGame() {
        this.pauseGame();
        const result = await Swal.fire({
            title: 'Reiniciar',
            text: "¿Quieres reiniciar el juego?",
            icon: 'question',
            color: '#4C0070',
            background: ' url(/img/fondo-alert.jpg) ',
            showCancelButton: true,
            confirmButtonColor: '#3cbd30',
            cancelButtonColor: '#d82e2e',
            cancelButtonText: 'No',
            confirmButtonText: 'Sí'
        });
        if (result.value) {
            this.resetGame();
        } else {
            this.resumeGame();
        }
    }

}

//Encierra funciones que se van a reutilizar a lo largo del juego 
class Utils {
    //se utiliza el metodo getnumberrange para generar un numero aleatorio en un rango 
    static getRandomNumberInRange = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    //A partir de la funcion getrandomnumberinrange se elige un color  de game.color
    static getRandomColor() {
        return Game.COLORS[Utils.getRandomNumberInRange(0, Game.COLORS.length - 1)];
    }

    //carga un sonido para el juego 
    static loadSound(src, loop) {
        const sound = document.createElement("audio");
        sound.src = src;
        sound.setAttribute("preload", "auto");
        sound.setAttribute("controls", "none");
        sound.loop = loop || false;
        sound.style.display = "none";
        document.body.appendChild(sound);
        return sound;
    }
}


// esta clase se la plican dos coordenadas , x o y
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}


//Se aplican las rotaciones que son las figuras que representan al tetromino(forma geometrica compuesta por 4 cuadrados iguales)
class Tetromino {
    //en el constructo se reciben las rotaciones posibles de las figuras 
    constructor(rotations) {
        this.rotations = rotations;
        this.rotationIndex = 0;
        this.points = this.rotations[this.rotationIndex];
        const randomColor = Utils.getRandomColor();// se aplica un color aleatorio mediante el metodo getrandomcolor 
        this.rotations.forEach(points => { // para cada punto de rotacion se utiliza el foreach aplicando un color aleatorio
            points.forEach(point => {
                point.color = randomColor;
            });
        });
        this.incrementRotationIndex();//como se cambia la rotacion se incrementa el indice de rotacion AVERIGUAR
    }
    
    //Devulve los puntos del tetromino
    getPoints() {
        return this.points;
    }
    

    //Al incrementar el indice de rotacion lo que hace es que si el indice se va a pasar , los regresa a cero y sino lo aumenta en uno
    incrementRotationIndex() {
        if (this.rotations.length <= 0) {
            this.rotationIndex = 0;
        } else {
            if (this.rotationIndex + 1 >= this.rotations.length) {
                this.rotationIndex = 0;
            } else {
                this.rotationIndex++;
            }
        }
    }


    //si obtiene la siguiente rotacion , lo que hace es regresar la rotacion en el siguiente indice 
    getNextRotation() {
        return this.rotations[this.rotationIndex];
    }

}

//Se crea una nueva instacia del juego pasandole el id del elemento en donde se debe dibujar 
const game = new Game("canvas");//el canvas llamado hace referencia al id de la etiqueta canvas en el html
document.querySelector("#reset").addEventListener("click", () => {
    //se llama al reset con el # para preguntarle si quiere reinicar el juego
    game.askUserConfirmResetGame();
});