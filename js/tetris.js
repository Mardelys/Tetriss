//en este scrpit se aplica la funcionalidad mediante cuatro clases principales : game, utils , point y tetromino
//El static no se asocia a un objeto si no a una clase
class Game { 
    // Square length in pixels
    static SQUARE_LENGTH = screen.width > 420 ? 25 : 10; //la medida del cuadrado depende del tamaño de la pantalla
    //porejemplosi la pantalla es mayor a 420px va a ser de 25px o si no de 10
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
    // Tiempo en que se demora en aparecer la otra ficha establecido en microsegundos
    static TIMEOUT_LOCK_PUT_NEXT_PIECE = 300; 
    // Velocidad en que baja la ficha entre menor sea el numero , bajara mas rapido.
    static PIECE_SPEED = 300;// 
    // Tiempo en el que se demora una fila en desaparecer cuando  se complete.
    static DELETE_ROW_ANIMATION = 300; 
    // Puntaje asignado por cada cuadro que se elimmine
    static PER_SQUARE_SCORE = 1; 
    // Colores de las fichas
    static COLORS = [ 
        "#D35400",
        "#F1C40F",
        "#27AE60",
        "#16A085",
        "#2980B9",
        "#7D3C98",
        "#E74C3C",
        "#F4D03F",
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
    //1 método 
    /*Este método posee en su interior 6 métodos a ejecutar facilitando en primer medida un saludo de bienvenida, inicializar los elementos del DOM(Muestra los botones del juego), reproducir el sonido del juego, resetearlo si se quiere, permitir dibujar los tetriminos y el tablero del juego, permite el uso de los controles del juego como lo son las flechas y otros botones como pausa o rotar.*/
    init() {
        this.showWelcome();
        this.initDomElements();
        this.initSounds();
        this.resetGame();
        this.draw();
        this.initControls();
    }
    //2 método
    /*Posee 7 métodos en su interior junto con 3 variables con dato de tipo numérico.
    En este método se asigna un valor de 0 al puntaje.
    Se llama al valor de sound decretado en el constructor para que el sonido se ejecute al completar una línea o pausarlo si se desea y también para ejecutar el sonido de fondo del juego en general y pausarlo si así se desea.
    Así mismo empiezan a aparecer las fichas en el tablero, elegir una figura aleatoria, restablece la posición inicial de las piezas en X y Y, limpia el tablero de las piezas que estaban con anterioridad, refresca el puntaje y se deja el juego en pausa para volver a iniciar.
    */
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
    //3 método
    /*En este método se muestra una alerta de bienvenida con las instrucciones del juego */
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

    //4 Método
    /*Permite añadirle un addEventListener de tipo keydown a los botones que se van a utilizar en el juego mediante el teclado, utilizando un arrow function en donde se utiliza una condicional de if junto con 5 switch cases.

    Esta condición dice que la variable decretada en el constructor con el nombre de canPlay cambia su valor a true y que se llame al parámetro code que hace referencia a las direcciones que puede seguir la tecla.

    De tal manera, indica que: Si estoy jugando y presiono la tecla a la derecha no es igual a pausar, en cambio solicita retornar lo señalado dentro del switch case respectivo por ejemplo attemptMoveRight. Este método tiene los mismos efectos utilizando las demás teclas al presionarlas. Al final se solicita ejecutar el método de syncExistingPiecesWithBoard explicado más abajo (Método 22)

    Por otra parte, también se añade un addEventListener de tipo “click” el cual va a ejecutarse al clickear sobre los botones creados en pantalla mediante el HTML. De tal manera, aplica dicho evento sobre el botón identificado en el HTML con el Id respectivo, siendo llamado mediante una variable decretada en el JS dentro del método initDomElements, en donde se llama dicho botón mediante el document.querySelector. Ahora bien al darle click solicita ejecutar el método attemptMoveDown, attemptMoveRight entre otros según corresponda. Si se trata del botón de pausa o resume, solicita que se ejecute el mismo método alusivo a pauseOrResumeGame.*/

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
    //5 método
    /*Inicialmente se decreta un método en el cual se aplica una condicional de if. En dicha condicional se llama otro método llamado figureCanMoveRight y se señala que si se cumple con lo decretado dentro de dicho método, se genere un incremento en 1 a la variable decretada en el constructor llamada globalX que inicialmente tenía valor de 0. Es entonces que la figura se moverá una casilla a la derecha.*/

    attemptMoveRight() {
        if (this.figureCanMoveRight()) {
            this.globalX++;
        }
    }
    //6 método
    /*nicialmente se decreta un método en el cual se aplica una condicional de if. En dicha condicional se llama otro método llamado figureCanMoveLeft y se señala que si se cumple con lo decretado dentro de dicho método, se genere un decremento en 1 a la variable decretada en el constructor llamada globalX que inicialmente tenía valor de 0. Es entonces que la figura se moverá una casilla a la izquierda.*/

    attemptMoveLeft() {
        if (this.figureCanMoveLeft()) {
            this.globalX--;
        }
    }
    //7 método
    /*Inicialmente se decreta un método en el cual se aplica una condicional de if. En dicha condicional se llama otro método llamado figureCanMoveDown y se señala que si se cumple con lo decretado dentro de dicho método, se genere un incremento en 1 a la variable declarada en el constructor llamada globalY que inicialmente tenía valor de 0. Es entonces que la figura se moverá una casilla hacia abajo.*/

    attemptMoveDown() {
        if (this.figureCanMoveDown()) {
            this.globalY++;
        }
    }
    //8 método
    /*Se decreta un método el cual solicita ejecutar el método de rotateFigure el cual será explicado más abajo (Método 39)*/
    attemptRotate() {
        this.rotateFigure();
    }
    //9 método
    /*Se declara un método con un condicional de if junto con un else. Se dice que si el juego está corriendo, el botón de iniciar se esconde y el de pausar se muestra. De lo contrario, si el juego está pausado el botón de iniciar se muestra y el de pausa se oculta. 
    Nota: hidden = false indica que no se esconda el elemento y el hidden = true indica que si se esconda el elemento.
    */
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
    //10 método
    /*Declara un método donde se llaman 3 variables del constructor siendo que: el sonido del juego en sí se pausa, el juego también se pausa es decir se mantiene el valor de true y también se mantiene el valor de false en la variable del canPlay, para finalizar crea una función llamada clearInterval la cual llama a intervalId decretada en el constructor como parámetro. Este intervalId permite que la pieza vaya bajando pero en este caso como el juego se pausa el clearInterval limpia el intervalo para no permitir seguir bajando la pieza*/

    pauseGame() {
        this.sounds.background.pause();
        this.paused = true;
        this.canPlay = false;
        clearInterval(this.intervalId);
    }
    //11 método
    /*Este método declara volver a retomar el sonido, se llama el método refreshScore el cual permite seguir mostrando el puntaje que se ha acumulado durante el juego y permitir que se sigan sumando más puntos durante el progreso del juego; A las variables declaradas en el constructor se les indica que a la pausa se le cambia el valor de true a false es decir el juego deja de estar pausado y el canPlay cambia su valor de false a true para que el juego tenga continuidad. Para finalizar la variable declarada en el constructor llamada intervalidId permite que el intervalo de tiempo en términos de velocidad (uno de los static declarados al principio con el nombre de PIECE_SPEED)en la que baja la ficha se mantenga constante*/

    resumeGame() {
        this.sounds.background.play();
        this.refreshScore();
        this.paused = false;
        this.canPlay = true;
        this.intervalId = setInterval(this.mainLoop.bind(this), Game.PIECE_SPEED);
    }

    //12 método
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
    //13 método
    playerLoses() {
        // Check if there's something at Y 1. Maybe it is not fair for the player, but it works
        for (const point of this.existingPieces[1]) {
            if (point.taken) {
                return true;
            }
        }
        return false;
    }

    //14 método
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
    //15 método
    changeDeletedRowColor(yCoordinates) {
        for (let y of yCoordinates) {
            for (const point of this.existingPieces[y]) {
                point.color = Game.DELETED_ROW_COLOR;
            }
        }
    };

    //16 método
    addScore(rows) {
        this.score += Game.PER_SQUARE_SCORE * Game.COLUMNS * rows.length;
        this.refreshScore();
    }

    //17 método
    removeRowsFromExistingPieces(yCoordinates) {
        for (let y of yCoordinates) {
            for (const point of this.existingPieces[y]) {
                point.color = Game.EMPTY_COLOR;
                point.taken = false;
            }
        }
    }

    //18 método
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
    //19 método
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
                    Swal.fire({
                        title: '¡Fin del Juego!',
                        text:'¿Lo intentas nuevamente?',
                        imageUrl: '/img/game-over.gif',
                        imageWidth: 450,
                        imageHeight: 200,
                        color: '#000',
                        imageAlt: 'Custom image',
                        confirmButtonColor: '#4C0070',
                        confirmButtonText: '¡Si!',
                    })
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

    //20 método
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
    //21 método
    overlapCurrentFigureOnGameBoard() {
        if (!this.currentFigure) return;
        for (const point of this.currentFigure.getPoints()) {
            this.board[point.y + this.globalY][point.x + this.globalX].color = point.color;
        }
    }

    //22 método
    syncExistingPiecesWithBoard() {
        this.cleanGameBoardAndOverlapExistingPieces();
        this.overlapCurrentFigureOnGameBoard();
    }
    //23 método
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
    //24 método
    refreshScore() {
        this.$score.textContent = `Score: ${this.score}`;
    }
    //25 método
    initSounds() {
        this.sounds.background = Utils.loadSound("assets/New Donk City_ Daytime 8 Bit.mp3", true);
        this.sounds.success = Utils.loadSound("assets/success.wav");
        this.sounds.denied = Utils.loadSound("assets/denied.wav");
        this.sounds.tap = Utils.loadSound("assets/tap.wav");
    }
    //26 método
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
    //27 método
    chooseRandomFigure() {
        this.currentFigure = this.getRandomFigure();
    }
    //28 método
    restartGlobalXAndY() {
        this.globalX = Math.floor(Game.COLUMNS / 2) - 1;
        this.globalY = 0;
    }

    //29 método
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
    //30 método
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

    //31 método
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

    //32 método
    absolutePointOutOfLimits(absoluteX, absoluteY) {
        return absoluteX < 0 || absoluteX > Game.COLUMNS - 1 || absoluteY < 0 || absoluteY > Game.ROWS - 1;
    }

    // It returns true even if the point is not valid (for example if it is out of limit, because it is not the function's responsibility)
    //33 método
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
    //34 método
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
    //35 método
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
    //36 método
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
    //37 método
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
    //38 método
    figureCanRotate() {
        const newPointsAfterRotate = this.currentFigure.getNextRotation();
        for (const rotatedPoint of newPointsAfterRotate) {
            if (!this.isValidPoint(rotatedPoint, this.currentFigure.getPoints())) {
                return false;
            }
        }
        return true;
    }

    //39 método
    rotateFigure() {
        if (!this.figureCanRotate()) {
            this.sounds.denied.currentTime = 0;
            this.sounds.denied.play();
            return;
        }
        this.currentFigure.points = this.currentFigure.getNextRotation();
        this.currentFigure.incrementRotationIndex();
    }
    //40 método
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