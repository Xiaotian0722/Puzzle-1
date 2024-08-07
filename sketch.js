let state = 'initial'; // states: 'initial', 'start', 'game', 'success'
let img, puz, startImg;
let pieces = [];
let board = [];
let pieceSize;
let draggingPiece = null;
let offsetX, offsetY;
let nextPageURL = 'https://xiaotian0722.github.io/Puzzle-2/';
let startButton, nextButton, cueButton, continueButton;
let showCue = false;

function preload() {
  img = loadImage('pic/bg.png');
  puz = loadImage('pic/puzzle.jpg');
  startImg = loadImage('pic/start.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pieceSize = min(width / 3, height / 3); // adjust the scale of every piece

  for (let i = 0; i < 4; i++) {
    pieces.push(new Piece(i % 2, Math.floor(i / 2)));
    board.push(null);
  }

  continueButton = createButton('Start');
  continueButton.position(width / 2 - 50, height / 2 + 150);
  continueButton.size(100, 50);
  continueButton.mousePressed(goToStartPage);

  startButton = createButton('Start');
  startButton.position(width / 2 - 50, height / 2 + 200);
  startButton.size(100, 50);
  startButton.mousePressed(startGame);
  startButton.hide(); // Initially hide the start button

  nextButton = createButton('Next🧩');
  nextButton.position(width / 2 - 50, pieceSize * 2 + 50);
  nextButton.size(100, 50);
  nextButton.mousePressed(goToNextPage);
  nextButton.hide(); // Initially hide the next button

  cueButton = createButton('Cue');
  cueButton.position(width - 100, 50);
  cueButton.size(50, 25);
  cueButton.mousePressed(toggleCue);
  cueButton.hide(); // Initially hide the cue button
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  pieceSize = min(width / 3, height / 3); // adjust the scale of every piece

  // Reposition buttons
  continueButton.position(width / 2 - 50, height / 2 + 200);
  startButton.position(width / 2 - 50, height / 2 + 200);
  nextButton.position(width / 2 - 50, height - 75);
  cueButton.position(width - 100, 50);

  // Reset pieces
  for (let piece of pieces) {
    piece.reset();
  }
}

function goToStartPage() {
  state = 'start';
  continueButton.hide();
  startButton.show();
}

function startGame() {
  state = 'game';
  startButton.hide();
  cueButton.show();
}

function goToNextPage() {
  window.location.href = nextPageURL;
}

function toggleCue() {
  showCue = !showCue;
}

function draw() {
  background(255);
  
  if (state === 'initial') {
    let imgRatio = startImg.width / startImg.height;
    let maxImgWidth = width * 0.5;  // 50% of the screen width
    let maxImgHeight = height * 0.5; // 50% of the screen height

    let imgWidth = maxImgWidth;
    let imgHeight = imgWidth / imgRatio;

    if (imgHeight > maxImgHeight) {
      imgHeight = maxImgHeight;
      imgWidth = imgHeight * imgRatio;
    }

    // Calculate the position to center the image
    let imgX = (width - imgWidth) / 2;
    let imgY = (height - imgHeight) / 2;

    image(startImg, imgX, imgY, imgWidth, imgHeight);
  } else if (state === 'start') {
    image(img, 100, height / 2, 300, 300);
    textSize(24);
    fill(0);
    textAlign(CENTER, CENTER);
    text('Looks like Mr.Bee needs some help!', width / 2, height / 2 - 125);
    text('Help him put every puzzle piece into right place!', width / 2, height / 2 - 50);
    text('Drag the pieces and release with mouse.', width / 2, height / 2 + 25);
    text('Time is unlimited. You can enjoy solving all the mysteries!', width / 2, height / 2 + 100);
  } else if (state === 'game') {
    if (showCue) {
      image(puz, (width - pieceSize * 2) / 2, (height - pieceSize * 2) / 2, pieceSize * 2, pieceSize * 2);
    }
    drawBoard();
    drawPieces();
  } else if (state === 'success') {
    image(puz, (width - pieceSize * 2) / 2, 0, pieceSize * 2, pieceSize * 2);
    textSize(24);
    fill(0);
    textAlign(CENTER, CENTER);
    text('You found one of the lost pieces！', width / 2, pieceSize * 2 + 20);
    nextButton.show(); // Show the next button
    cueButton.hide(); // Hide the cue button
  }
}

function drawBoard() {
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      noFill();
      stroke(0);
      rect(i * pieceSize, j * pieceSize, pieceSize, pieceSize);
    }
  }
}

function drawPieces() {
  for (let piece of pieces) {
    if (piece !== draggingPiece) {
      piece.show();
    }
  }
  if (draggingPiece) {
    draggingPiece.show(mouseX - offsetX, mouseY - offsetY);
  }
}

function mousePressed() {
  if (state === 'game') {
    for (let piece of pieces) {
      if (piece.contains(mouseX, mouseY)) {
        draggingPiece = piece;
        offsetX = mouseX - piece.x;
        offsetY = mouseY - piece.y;

        // clear current location info of the dragged piece
        let x = Math.floor(piece.x / pieceSize);
        let y = Math.floor(piece.y / pieceSize);
        let index = x + y * 2;
        if (x >= 0 && x < 2 && y >= 0 && y < 2 && board[index] === piece) {
          board[index] = null;
        }

        break;
      }
    }
  }
}

function mouseReleased() {
  if (draggingPiece) {
    let x = Math.floor(mouseX / pieceSize);
    let y = Math.floor(mouseY / pieceSize);
    let index = x + y * 2;

    if (x >= 0 && x < 2 && y >= 0 && y < 2 && !board[index]) {
      draggingPiece.snap(x, y);
      board[index] = draggingPiece;
    } else {
      draggingPiece.reset();
    }

    draggingPiece = null;

    if (checkSuccess()) {
      state = 'success';
    }
  }
}

function checkSuccess() {
  for (let i = 0; i < 4; i++) {
    if (!board[i] || board[i].index !== i) {
      return false;
    }
  }
  return true;
}

class Piece {
  constructor(i, j) {
    this.correctX = i * pieceSize;
    this.correctY = j * pieceSize;
    this.index = i + j * 2;
    this.reset();
  }

  contains(px, py) {
    return px > this.x && px < this.x + pieceSize && py > this.y && py < this.y + pieceSize;
  }

  show(nx = this.x, ny = this.y) {
    image(puz, nx, ny, pieceSize, pieceSize, this.correctX, this.correctY, pieceSize, pieceSize);
    this.x = nx;
    this.y = ny;
  }

  snap(i, j) {
    this.x = i * pieceSize;
    this.y = j * pieceSize;
  }

  reset() {
    this.x = random(width / 2, width - pieceSize);
    this.y = random(0, height - pieceSize);
  }
}
