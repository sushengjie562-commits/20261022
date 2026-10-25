// ==========================================
// 全局變數與「雨過天晴」題庫與拼圖宣告區
// ==========================================

let puzzleData = [
  { id: 0, question: "出大太陽時，要記得塗什麼保護皮膚？", options: ["防曬乳", "果醬", "醬油"], correct: 0, text: "防曬" },
  { id: 1, question: "下雨天出門上學，手上要拿什麼才不會淋濕？", options: ["雨傘", "冰棒", "積木"], correct: 0, text: "雨傘" },
  { id: 2, question: "冬天氣溫好冷，出門要穿什麼才保暖？", options: ["厚外套", "短袖泳衣", "吊帶褲"], correct: 0, text: "外套" },
  { id: 3, question: "看到天空出現七彩的顏色，那是什麼？", options: ["彩虹", "飛機", "氣球"], correct: 0, text: "彩虹" },
  { id: 4, question: "天空打雷閃電時，我們應該去哪裡比較安全？", options: ["室內", "大樹下", "屋頂上"], correct: 0, text: "安全" },
  { id: 5, question: "颱風天風雨很大，小朋友應該怎麼做？", options: ["待在家裡", "去公園玩", "去海邊觀浪"], correct: 0, text: "在家" },
  { id: 6, question: "早上起床看到太陽公公出來了，心情怎麼樣？", options: ["開心", "生氣", "哭泣"], correct: 0, text: "開心" },
  { id: 7, question: "玩完玩具後，應該要把玩具收去哪裡？", options: ["玩具箱", "馬桶裡", "丟進水溝"], correct: 0, text: "收好" },
  { id: 8, question: "過馬路的時候，要牽著誰的手一起走？", options: ["爸爸媽媽", "路邊陌生人", "不用牽"], correct: 0, text: "牽手" }
];

let gameState = 'HOME'; // 'HOME', 'PLAYING', 'QUIZ', 'RESULT'
let activePuzzleIndex = -1;
let optionButtons = [];

let tiles = [];          // 左側 9 宮格目標板
let rightUnlockPieces = []; // 右側等待解鎖或拖曳的拼圖清單

let draggingPiece = null;
let offsetX = 0;
let offsetY = 0;

let score = 0;
let correctCount = 0;
let startTime = 0;
let elapsedTime = 0;
let soundEnabled = true;

let startButton = { x: 0, y: 0, w: 260, h: 60 };
let restartButton = { x: 0, y: 0, w: 260, h: 60 };
let soundToggleBtn = { x: 0, y: 0, w: 90, h: 36 };

let confettiParticles = [];
let animAngle = 0;

// ==========================================
// p5.js 核心初始化 setup()
// ==========================================
function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  initLayout();
}

// ==========================================
// 響應式佈局初始化
// ==========================================
function initLayout() {
  startButton.x = width / 2 - startButton.w / 2;
  startButton.y = height / 2 + 120;

  restartButton.x = width / 2 - restartButton.w / 2;
  restartButton.y = height - 100;

  initPuzzleBoard();
}

// ==========================================
// 初始化拼圖板與右側解鎖區
// ==========================================
function initPuzzleBoard() {
  tiles = [];
  rightUnlockPieces = [];

  // 左側拼圖板尺寸計算 (適應全螢幕置中)
  let boardSize = min(width * 0.42, 400);
  let startX = width * 0.12;
  let startY = height * 0.28;
  let tileSize = boardSize / 3;

  for (let i = 0; i < 9; i++) {
    let r = floor(i / 3);
    let c = i % 3;
    tiles.push({
      id: i,
      col: c,
      row: r,
      x: startX + c * tileSize,
      y: startY + r * tileSize,
      size: tileSize,
      isCorrectlyPlaced: false
    });
  }

  // 右側待解鎖 9 個拼圖位置佈局
  let rightStartX = width * 0.58;
  let rightStartY = height * 0.28;
  let rWidth = boardSize;
  let rHeight = boardSize;
  let pW = rWidth / 3;
  let pH = rHeight / 3;

  for (let i = 0; i < 9; i++) {
    let r = floor(i / 3);
    let c = i % 3;
    rightUnlockPieces.push({
      id: i,
      x: rightStartX + c * pW,
      y: rightStartY + r * pH,
      w: pW,
      h: pH,
      homeX: rightStartX + c * pW,
      homeY: rightStartY + r * pH,
      isUnlocked: false,       // 是否已透過答題解鎖
      isPlacedOnBoard: false,  // 是否已經拼進左側板子
      isDragging: false
    });
  }
}

// ==========================================
// 視窗大小改變
// ==========================================
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initLayout();
}

// ==========================================
// 主繪製循環 draw()
// ==========================================
function draw() {
  background('#F2F2F7'); // iOS 淺灰質感背景
  animAngle += 0.05;

  if (gameState === 'HOME') {
    drawHomeScreen();
  } else if (gameState === 'PLAYING' || gameState === 'QUIZ') {
    drawGameScreen();
    if (gameState === 'QUIZ') {
      drawQuizOverlay();
    }
  } else if (gameState === 'RESULT') {
    drawResultScreen();
  }
}

// ==========================================
// 1. 首頁畫面
// ==========================================
function drawHomeScreen() {
  push();
  fill(255);
  noStroke();
  let cardW = min(width * 0.85, 580);
  let cardH = min(height * 0.75, 480);
  let cardX = width / 2 - cardW / 2;
  let cardY = height / 2 - cardH / 2;
  rect(cardX, cardY, cardW, cardH, 30);

  textSize(55);
  text("🌈", width / 2, cardY + 75);

  fill('#1C1C1E');
  textSize(min(width * 0.05, 36));
  textStyle(BOLD);
  text("答題拼圖：雨過天晴", width / 2, cardY + 145);

  textSize(18);
  fill('#636366');
  text("點擊右側問號答題解鎖，將拼圖拖曳至左側拼圖板！", width / 2, cardY + 205);

  // 開始按鈕
  drawingContext.shadowOffsetX = 0;
  drawingContext.shadowOffsetY = 6;
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = 'rgba(0, 122, 255, 0.3)';

  fill('#007AFF');
  rect(startButton.x, startButton.y, startButton.w, startButton.h, 30);

  fill(255);
  textSize(24);
  textStyle(BOLD);
  text("🚀 開始遊戲", startButton.x + startButton.w / 2, startButton.y + startButton.h / 2);
  pop();
}

// ==========================================
// 2. 遊戲主畫面（包含頂部狀態列與左右拼圖區）
// ==========================================
function drawGameScreen() {
  // 更新計時器
  if (gameState === 'PLAYING') {
    let currentSecs = floor((millis() - startTime) / 1000);
    elapsedTime = currentSecs;
  }

  // --- A. 頂部狀態列 (仿照截圖設計) ---
  push();
  fill(255);
  noStroke();
  rect(0, 0, width, 70);
  stroke('rgba(0,0,0,0.06)');
  line(0, 70, width, 70);

  // 左上標題
  noStroke();
  fill('#FF9500');
  textSize(12);
  textStyle(BOLD);
  text("PUZZLE QUIZ", 45, 22);

  fill('#1C1C1E');
  textSize(20);
  text("答題拼圖：雨過天晴", 85, 48);

  // 右上角資訊儀表板 (音效開關、拼好數、答對題數、時間)
  let rightX = width - 40;
  let boxY = 17;

  // 1. 時間盒
  drawInfoBox(rightX - 75, boxY, 70, 36, "時間", nf(floor(elapsedTime / 60), 2) + ":" + nf(elapsedTime % 60, 2));
  // 2. 答對題數
  drawInfoBox(rightX - 160, boxY, 75, 36, "答對", correctCount + " 題");
  // 3. 拼好數
  let placedCount = tiles.filter(t => t.isCorrectlyPlaced).length;
  drawInfoBox(rightX - 245, boxY, 75, 36, "拼好", placedCount + "/9");
  // 4. 音效開關按鈕
  soundToggleBtn.x = rightX - 340;
  soundToggleBtn.y = boxY;
  soundToggleBtn.w = 85;
  soundToggleBtn.h = 36;
  fill('#F2F2F7');
  stroke('#C7C7CC');
  strokeWeight(1);
  rect(soundToggleBtn.x, soundToggleBtn.y, soundToggleBtn.w, soundToggleBtn.h, 8);
  fill('#3A3A3C');
  noStroke();
  textSize(13);
  textStyle(BOLD);
  text("音效：" + (soundEnabled ? "開" : "關"), soundToggleBtn.x + soundToggleBtn.w / 2, soundToggleBtn.y + soundToggleBtn.h / 2);

  pop();

  // --- B. 左側拼圖板 (虛線外框與已完成拼圖) ---
  push();
  let firstTile = tiles[0];
  let boardTotalSize = firstTile.size * 3;
  
  // 外框底板
  fill(255);
  stroke('#D1D1D6');
  strokeWeight(2);
  drawingContext.setLineDash([6, 6]);
  rect(firstTile.x - 10, firstTile.y - 10, boardTotalSize + 20, boardTotalSize + 20, 16);
  drawingContext.setLineDash([]); // 恢復實線

  for (let tile of tiles) {
    if (tile.isCorrectlyPlaced) {
      // 繪製正確拼上的彩色拼圖
      fill(getTileColor(tile.id));
      stroke('#FFFFFF');
      strokeWeight(2);
      rect(tile.x, tile.y, tile.size, tile.size, 8);

      fill(255);
      textSize(16);
      textStyle(BOLD);
      text(puzzleData[tile.id].text, tile.x + tile.size / 2, tile.y + tile.size / 2);
    }
  }
  pop();

  // --- C. 中間提示文字 ---
  push();
  fill('#8E8E93');
  textSize(14);
  text("把解鎖的拼圖拖到拼圖板上", width * 0.5, height * 0.22);
  pop();

  // --- D. 右側等待解鎖或拖曳的拼圖區 ---
  for (let piece of rightUnlockPieces) {
    if (!piece.isPlacedOnBoard && !piece.isDragging) {
      push();
      drawingContext.shadowOffsetX = 0;
      drawingContext.shadowOffsetY = 4;
      drawingContext.shadowBlur = 10;
      drawingContext.shadowColor = 'rgba(0,0,0,0.08)';

      if (piece.isUnlocked) {
        // 已解鎖：顯示正常顏色與文字
        fill(getTileColor(piece.id));
        stroke('#FFFFFF');
        strokeWeight(2);
        rect(piece.x, piece.y, piece.w, piece.h, 12);

        fill(255);
        textSize(16);
        textStyle(BOLD);
        text(puzzleData[piece.id].text, piece.x + piece.w / 2, piece.y + piece.h / 2);
      } else {
        // 未解鎖：深色擬真拼圖外觀 + 問號與「點我答題」
        fill('#2C3E50');
        stroke('#34495E');
        strokeWeight(2);
        rect(piece.x, piece.y, piece.w, piece.h, 12);

        fill(255);
        textSize(26);
        textStyle(BOLD);
        text("?", piece.x + piece.w / 2, piece.y + piece.h / 2 - 8);

        textSize(12);
        fill('#BDC3C7');
        text("點我答題", piece.x + piece.w / 2, piece.y + piece.h / 2 + 15);
      }
      pop();
    }
  }

  // 如果正在拖曳拼圖，渲染在最上層
  if (draggingPiece) {
    push();
    translate(draggingPiece.x + draggingPiece.w / 2, draggingPiece.y + draggingPiece.h / 2);
    scale(1.08);
    drawingContext.shadowOffsetX = 0;
    drawingContext.shadowOffsetY = 10;
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = 'rgba(0,0,0,0.2)';

    fill(getTileColor(draggingPiece.id));
    stroke('#FFFFFF');
    strokeWeight(3);
    rect(-draggingPiece.w / 2, -draggingPiece.h / 2, draggingPiece.w, draggingPiece.h, 12);

    fill(255);
    textSize(16);
    textStyle(BOLD);
    text(puzzleData[draggingPiece.id].text, 0, 0);
    pop();
  }

  // 檢查是否全部拼完
  if (tiles.every(t => t.isCorrectlyPlaced) && gameState !== 'RESULT') {
    setTimeout(() => {
      gameState = 'RESULT';
      let percentage = round((score / 9) * 100);
      if (percentage > 80) {
        createConfetti();
      }
      if (soundEnabled) speakText("太棒了！拼圖全部完成，恭喜通關！");
    }, 500);
  }
}

// 輔助繪製右上角資訊方塊
function drawInfoBox(x, y, w, h, label, val) {
  push();
  fill('#F2F2F7');
  stroke('#C7C7CC');
  strokeWeight(1);
  rect(x, y, w, h, 8);
  noStroke();
  fill('#8E8E93');
  textSize(10);
  text(label, x + w / 2, y + 10);
  fill('#1C1C1E');
  textSize(13);
  textStyle(BOLD);
  text(val, x + w / 2, y + 26);
  pop();
}

function getTileColor(id) {
  let colors = ['#FF2D55', '#FF9500', '#FFCC00', '#34C759', '#00C7BE', '#007AFF', '#5856D6', '#AF52DE', '#FF3B30'];
  return colors[id % colors.length];
}

// ==========================================
// 3. 答題彈窗畫面
// ==========================================
function drawQuizOverlay() {
  push();
  fill(0, 0, 0, 150);
  rect(0, 0, width, height);

  let qBoxW = min(width * 0.85, 520);
  let qBoxH = 380;
  let qBoxX = width / 2 - qBoxW / 2;
  let qBoxY = height / 2 - qBoxH / 2;

  fill(255);
  noStroke();
  rect(qBoxX, qBoxY, qBoxW, qBoxH, 25);

  fill('#1C1C1E');
  textSize(22);
  textStyle(BOLD);
  let q = puzzleData[activePuzzleIndex];
  text("🧩 拼圖解鎖挑戰題", width / 2, qBoxY + 45);

  textSize(18);
  fill('#3A3A3C');
  text(q.question, qBoxX + 25, qBoxY + 95, qBoxW - 50, 60);

  // 選項按鈕
  optionButtons = [];
  let btnW = qBoxW - 60;
  let btnH = 50;
  let startY = qBoxY + 160;

  for (let i = 0; i < q.options.length; i++) {
    let bx = qBoxX + 30;
    let by = startY + i * 62;

    fill('#F2F2F7');
    stroke('#C7C7CC');
    strokeWeight(1);
    rect(bx, by, btnW, btnH, 12);

    fill('#1C1C1E');
    noStroke();
    textSize(18);
    textStyle(BOLD);
    text(q.options[i], bx + btnW / 2, by + btnH / 2);

    optionButtons.push({ x: bx, y: by, w: btnW, h: btnH, index: i });
  }
  pop();
}

// ==========================================
// 4. 成績結算畫面
// ==========================================
function drawResultScreen() {
  fill(0, 0, 0, 160);
  rect(0, 0, width, height);

  push();
  fill(255);
  noStroke();
  let dialogW = min(width * 0.9, 520);
  let dialogH = min(height * 0.85, 560);
  let dialogX = width / 2 - dialogW / 2;
  let dialogY = height / 2 - dialogH / 2;
  rect(dialogX, dialogY, dialogW, dialogH, 30);

  fill('#1C1C1E');
  textSize(28);
  textStyle(BOLD);
  text("🏆 挑戰成功結算 🏆", width / 2, dialogY + 45);

  let percentage = round((score / 9) * 100);

  // 星星評價
  let starsCount = round((score / 9) * 3);
  let starStr = "";
  for (let i = 0; i < 3; i++) {
    starStr += (i < starsCount) ? "⭐ " : "☆ ";
  }
  textSize(26);
  text(starStr, width / 2, dialogY + 90);

  textSize(40);
  fill(percentage >= 80 ? '#34C759' : '#FF9500');
  text(percentage + " 分", width / 2, dialogY + 145);

  // 統計資訊
  textSize(16);
  fill('#8E8E93');
  text(`答對題數：${correctCount} / 9 題   |   總花費時間：${elapsedTime} 秒`, width / 2, dialogY + 195);

  // 9 宮格縮圖預覽
  let miniSize = 28;
  let startMiniX = width / 2 - (miniSize * 3 + 10) / 2;
  let startMiniY = dialogY + 225;
  for (let i = 0; i < 9; i++) {
    let r = floor(i / 3);
    let c = i % 3;
    fill(getTileColor(i));
    rect(startMiniX + c * 32, startMiniY + r * 32, miniSize, miniSize, 4);
  }

  if (percentage > 80) {
    updateAndDrawConfetti();
  }

  // 重新測驗按鈕
  fill('#007AFF');
  rect(restartButton.x, dialogY + dialogH - 75, restartButton.w, 50, 25);

  fill(255);
  textSize(20);
  textStyle(BOLD);
  text("🔄 再玩一次", restartButton.x + restartButton.w / 2, dialogY + dialogH - 50);
  pop();
}

// ==========================================
// 滑鼠/觸控點擊事件 mousePressed()
// ==========================================
function mousePressed() {
  if (gameState === 'HOME') {
    if (
      mouseX >= startButton.x && mouseX <= startButton.x + startButton.w &&
      mouseY >= startButton.y && mouseY <= startButton.y + startButton.h
    ) {
      gameState = 'PLAYING';
      initPuzzleBoard();
      score = 0;
      correctCount = 0;
      startTime = millis();
      confettiParticles = [];
      if (soundEnabled) speakText("請點擊右側問號格子來解鎖題目！");
    }
  } 
  else if (gameState === 'PLAYING') {
    // 1. 檢查是否點擊右上角音效開關
    if (
      mouseX >= soundToggleBtn.x && mouseX <= soundToggleBtn.x + soundToggleBtn.w &&
      mouseY >= soundToggleBtn.y && mouseY <= soundToggleBtn.y + soundToggleBtn.h
    ) {
      soundEnabled = !soundEnabled;
      return;
    }

    // 2. 點擊右側尚未解鎖的拼圖 -> 彈出題目
    for (let piece of rightUnlockPieces) {
      if (!piece.isUnlocked && !piece.isPlacedOnBoard) {
        if (
          mouseX >= piece.x && mouseX <= piece.x + piece.w &&
          mouseY >= piece.y && mouseY <= piece.y + piece.h
        ) {
          activePuzzleIndex = piece.id;
          gameState = 'QUIZ';
          if (soundEnabled) {
            speakText(puzzleData[piece.id].question);
          }
          return;
        }
      }
    }

    // 3. 點擊右側已解鎖但尚未拼入板子的拼圖開始拖曳
    for (let i = rightUnlockPieces.length - 1; i >= 0; i--) {
      let piece = rightUnlockPieces[i];
      if (piece.isUnlocked && !piece.isPlacedOnBoard) {
        if (
          mouseX >= piece.x && mouseX <= piece.x + piece.w &&
          mouseY >= piece.y && mouseY <= piece.y + piece.h
        ) {
          draggingPiece = piece;
          piece.isDragging = true;
          offsetX = mouseX - piece.x;
          offsetY = mouseY - piece.y;

          rightUnlockPieces.splice(i, 1);
          rightUnlockPieces.push(piece);
          break;
        }
      }
    }
  } 
  else if (gameState === 'QUIZ') {
    // 點擊選項答題
    for (let btn of optionButtons) {
      if (
        mouseX >= btn.x && mouseX <= btn.x + btn.w &&
        mouseY >= btn.y && mouseY <= btn.y + btn.h
      ) {
        let q = puzzleData[activePuzzleIndex];
        let isCorrect = (btn.index === q.correct);

        score++;
        if (isCorrect) {
          correctCount++;
          if (soundEnabled) speakText("答對了！拼圖已解鎖！");
        } else {
          if (soundEnabled) speakText("沒關係，一樣幫你解鎖拼圖囉！");
        }

        // 解鎖對應拼圖
        let piece = rightUnlockPieces.find(p => p.id === activePuzzleIndex);
        if (piece) {
          piece.isUnlocked = true;
        }

        gameState = 'PLAYING';
        break;
      }
    }
  } 
  else if (gameState === 'RESULT') {
    let dialogH = min(height * 0.85, 560);
    let dialogY = height / 2 - dialogH / 2;
    let btnY = dialogY + dialogH - 75;

    if (
      mouseX >= restartButton.x && mouseX <= restartButton.x + restartButton.w &&
      mouseY >= btnY && mouseY <= btnY + 50
    ) {
      gameState = 'HOME';
      confettiParticles = [];
    }
  }
}

// ==========================================
// 拖曳 mouseDragged()
// ==========================================
function mouseDragged() {
  if (draggingPiece !== null) {
    draggingPiece.x = mouseX - offsetX;
    draggingPiece.y = mouseY - offsetY;
  }
}

// ==========================================
// 釋放滑鼠 mouseReleased() (磁吸檢查)
// ==========================================
function mouseReleased() {
  if (draggingPiece !== null) {
    let piece = draggingPiece;
    let snapped = false;

    // 檢查是否拖曳到左側對應的拼圖板格子內
    for (let tile of tiles) {
      if (tile.id === piece.id && !tile.isCorrectlyPlaced) {
        let cx = piece.x + piece.w / 2;
        let cy = piece.y + piece.h / 2;

        if (
          cx >= tile.x && cx <= tile.x + tile.size &&
          cy >= tile.y && cy <= tile.y + tile.size
        ) {
          tile.isCorrectlyPlaced = true;
          piece.isPlacedOnBoard = true;
          snapped = true;
          if (soundEnabled) speakText("拼圖放對位置囉！");
          break;
        }
      }
    }

    // 未對準則彈回原位
    if (!snapped) {
      piece.x = piece.homeX;
      piece.y = piece.homeY;
    }

    piece.isDragging = false;
    draggingPiece = null;
  }
}

// ==========================================
// 語音朗讀 API
// ==========================================
function speakText(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    let utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-TW';
    utterance.rate = 0.95;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  }
}

// ==========================================
// 彩蛋煙火
// ==========================================
function createConfetti() {
  confettiParticles = [];
  let colors = ['#FF2D55', '#FF9500', '#FFCC00', '#34C759', '#007AFF', '#5856D6'];
  for (let i = 0; i < 180; i++) {
    confettiParticles.push({
      x: random(width),
      y: random(-height, 0),
      size: random(10, 18),
      color: random(colors),
      vx: random(-2.5, 2.5),
      vy: random(4, 9),
      rotation: random(TWO_PI),
      vRot: random(-0.12, 0.12)
    });
  }
}

function updateAndDrawConfetti() {
  for (let p of confettiParticles) {
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.vRot;
    if (p.y > height) {
      p.y = random(-50, -10);
      p.x = random(width);
    }
    push();
    translate(p.x, p.y);
    rotate(p.rotation);
    fill(p.color);
    noStroke();
    rect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6, 2);
    pop();
  }
}