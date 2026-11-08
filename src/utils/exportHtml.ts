/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameData } from '../types/game';

export function exportStandaloneHtml(game: GameData) {
  const gameJson = JSON.stringify(game);
  const safeTitle = (game.title || 'Trò chơi học tập').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>${safeTitle} - Thử Tài Kéo Thả Nối Ý</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Nunito', system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #e0f2fe 0%, #fef3c7 50%, #f3e8ff 100%);
      min-height: 100vh;
      color: #1e293b;
      display: flex;
      flex-direction: column;
      user-select: none;
      -webkit-user-select: none;
    }
    header {
      background: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
      padding: 16px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    .title-box h1 {
      font-size: 22px;
      font-weight: 800;
      color: #0284c7;
    }
    .title-box p {
      font-size: 14px;
      color: #64748b;
    }
    .header-actions {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .btn {
      padding: 10px 18px;
      border-radius: 9999px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
    .btn:active { transform: translateY(0); }
    .btn-primary { background: #0284c7; color: white; }
    .btn-success { background: #16a34a; color: white; }
    .btn-secondary { background: #f1f5f9; color: #334155; }
    .container {
      max-width: 1100px;
      width: 100%;
      margin: 20px auto;
      padding: 0 16px;
      flex: 1;
    }
    .instructions-card {
      background: white;
      border-radius: 16px;
      padding: 16px 20px;
      margin-bottom: 20px;
      border-left: 6px solid #f59e0b;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      font-size: 15px;
      color: #475569;
    }
    /* Matching mode styles */
    .matching-board {
      position: relative;
      background: white;
      border-radius: 24px;
      padding: 24px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.06);
      display: flex;
      justify-content: space-between;
      min-height: 480px;
    }
    .column {
      width: 42%;
      display: flex;
      flex-direction: column;
      gap: 16px;
      z-index: 2;
    }
    .column-title {
      font-size: 17px;
      font-weight: 800;
      color: #334155;
      text-align: center;
      padding: 8px;
      background: #f8fafc;
      border-radius: 12px;
      border: 1px dashed #cbd5e1;
    }
    .match-item {
      padding: 16px 20px;
      border-radius: 18px;
      background: #f8fafc;
      border: 3px solid #e2e8f0;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      position: relative;
      transition: all 0.2s;
      min-height: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }
    .match-item:hover { border-color: #38bdf8; background: #f0f9ff; }
    .match-item.selected {
      border-color: #0284c7;
      background: #e0f2fe;
      transform: scale(1.02);
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.2);
    }
    .match-item.paired {
      border-color: #8b5cf6;
      background: #f5f3ff;
    }
    .match-item.correct {
      border-color: #22c55e !important;
      background: #f0fdf4 !important;
      color: #15803d;
    }
    .match-item.incorrect {
      border-color: #ef4444 !important;
      background: #fef2f2 !important;
      color: #b91c1c;
    }
    .dot {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #cbd5e1;
      border: 3px solid white;
      box-shadow: 0 0 0 2px #94a3b8;
    }
    .match-item.selected .dot, .match-item.paired .dot {
      background: #8b5cf6;
      box-shadow: 0 0 0 2px #7c3aed;
    }
    svg.connection-layer {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    }
    /* Image drop mode */
    .image-board {
      position: relative;
      background: white;
      border-radius: 24px;
      padding: 16px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.06);
      margin-bottom: 24px;
      text-align: center;
      overflow: hidden;
    }
    .image-container {
      position: relative;
      display: inline-block;
      max-width: 100%;
      border-radius: 16px;
      overflow: hidden;
    }
    .image-container img {
      display: block;
      max-width: 100%;
      max-height: 540px;
      object-fit: contain;
    }
    .drop-zone {
      position: absolute;
      border: 3px dashed #0284c7;
      background: rgba(224, 242, 254, 0.7);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 700;
      color: #0369a1;
      transition: all 0.2s;
      padding: 4px;
      cursor: pointer;
    }
    .drop-zone.filled {
      border-style: solid;
      background: #ffffff;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }
    .drop-zone.correct { border-color: #22c55e !important; background: #f0fdf4 !important; color: #15803d; }
    .drop-zone.incorrect { border-color: #ef4444 !important; background: #fef2f2 !important; color: #b91c1c; }
    .card-bank {
      background: white;
      border-radius: 20px;
      padding: 20px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.05);
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      justify-content: center;
    }
    .answer-card {
      padding: 12px 20px;
      background: #f8fafc;
      border: 2px solid #cbd5e1;
      border-radius: 9999px;
      font-weight: 700;
      cursor: grab;
      user-select: none;
      transition: all 0.2s;
      box-shadow: 0 2px 6px rgba(0,0,0,0.04);
    }
    .answer-card:hover { border-color: #0284c7; background: #f0f9ff; transform: scale(1.05); }
    .answer-card.selected { border-color: #7c3aed; background: #f5f3ff; box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.3); }
    /* Categorize mode */
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }
    .category-box {
      background: white;
      border-radius: 20px;
      padding: 16px;
      min-height: 240px;
      border-top: 8px solid #0284c7;
      box-shadow: 0 4px 16px rgba(0,0,0,0.05);
      display: flex;
      flex-direction: column;
    }
    .category-title {
      font-size: 18px;
      font-weight: 800;
      margin-bottom: 12px;
      text-align: center;
    }
    .category-cards {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: #f8fafc;
      border-radius: 14px;
      padding: 12px;
      min-height: 120px;
    }
    /* Results modal */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }
    .modal-content {
      background: white;
      border-radius: 28px;
      max-width: 480px;
      width: 90%;
      padding: 32px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
    }
    .score-badge {
      font-size: 54px;
      font-weight: 900;
      color: #0284c7;
      margin: 16px 0 8px;
    }
  </style>
</head>
<body>
  <header>
    <div class="title-box">
      <h1 id="appTitle">${safeTitle}</h1>
      <p id="appSubject">${(game.subject || '').replace(/</g, '&lt;')}</p>
    </div>
    <div class="header-actions">
      <button class="btn btn-secondary" onclick="resetGame()">🔄 Làm lại</button>
      <button class="btn btn-success" onclick="checkAnswers()">✨ Kiểm tra kết quả</button>
    </div>
  </header>

  <div class="container">
    <div class="instructions-card" id="instrCard" style="${game.instructions ? '' : 'display:none;'}">
      💡 <strong>Hướng dẫn:</strong> <span id="instrText">${(game.instructions || '').replace(/</g, '&lt;')}</span>
    </div>

    <div id="gamePlayArea"></div>
  </div>

  <div class="modal-overlay" id="resultModal">
    <div class="modal-content">
      <div style="font-size: 48px;" id="modalEmoji">🎉</div>
      <h2 style="font-size: 24px; font-weight: 800; margin-top: 8px;" id="modalTitle">Hoàn Thành Trò Chơi!</h2>
      <div class="score-badge" id="modalScore">100%</div>
      <p style="font-size: 16px; color: #475569; margin-bottom: 24px;" id="modalDesc">Bé đã trả lời đúng 5/5 câu!</p>
      <div style="display: flex; gap: 12px; justify-content: center;">
        <button class="btn btn-secondary" onclick="closeModal()">Xem lại bài</button>
        <button class="btn btn-primary" onclick="resetGame(); closeModal();">Chơi lại lần nữa</button>
      </div>
    </div>
  </div>

  <script>
    const GAME_DATA = ${gameJson};
    let userPairs = {}; // leftId -> rightId
    let selectedLeftId = null;
    let selectedZoneCard = null;
    let imageZoneAnswers = {}; // zoneId -> cardId
    let categorizeAnswers = {}; // cardId -> categoryId
    let checked = false;

    // Web Audio Sound Synth
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function playBeep(freq, type = 'sine', duration = 0.1) {
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    }
    function playSuccess() {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        setTimeout(() => playBeep(f, 'sine', 0.2), i * 80);
      });
    }

    function renderGame() {
      const area = document.getElementById('gamePlayArea');
      area.innerHTML = '';

      if (GAME_DATA.mode === 'matching') {
        renderMatching(area);
      } else if (GAME_DATA.mode === 'image_drop') {
        renderImageDrop(area);
      } else if (GAME_DATA.mode === 'categorize') {
        renderCategorize(area);
      }
    }

    // MODE 1: Matching
    function renderMatching(container) {
      const pairs = GAME_DATA.matchingPairs || [];
      if (pairs.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding: 40px; color:#64748b;">Trò chơi chưa có nội dung nối ý.</div>';
        return;
      }

      const board = document.createElement('div');
      board.className = 'matching-board';
      board.id = 'matchingBoard';

      const leftCol = document.createElement('div');
      leftCol.className = 'column';
      leftCol.innerHTML = '<div class="column-title">Cột 1</div>';

      const rightCol = document.createElement('div');
      rightCol.className = 'column';
      rightCol.innerHTML = '<div class="column-title">Cột 2</div>';

      // Shuffled right items if enabled
      let rightItems = [...pairs];
      if (GAME_DATA.randomizeOrder) {
        rightItems.sort(() => Math.random() - 0.5);
      }

      pairs.forEach(p => {
        const item = document.createElement('div');
        item.className = 'match-item' + (userPairs[p.id] ? ' paired' : '');
        item.id = 'left_' + p.id;
        item.innerHTML = '<span>' + p.leftText + '</span><div class="dot"></div>';
        item.onclick = () => selectLeft(p.id);
        leftCol.appendChild(item);
      });

      rightItems.forEach(p => {
        const item = document.createElement('div');
        item.className = 'match-item';
        item.id = 'right_' + p.id;
        item.innerHTML = '<div class="dot"></div><span>' + p.rightText + '</span>';
        item.onclick = () => selectRight(p.id);
        rightCol.appendChild(item);
      });

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'connection-layer');
      svg.id = 'lineLayer';

      board.appendChild(leftCol);
      board.appendChild(svg);
      board.appendChild(rightCol);
      container.appendChild(board);

      setTimeout(drawLines, 50);
      window.addEventListener('resize', drawLines);
    }

    function selectLeft(id) {
      if (checked) return;
      playBeep(450);
      if (selectedLeftId === id) {
        selectedLeftId = null;
      } else {
        selectedLeftId = id;
      }
      updateMatchingStyles();
    }

    function selectRight(rightId) {
      if (checked) return;
      if (!selectedLeftId) {
        // Find if this right is already connected to some left, allow disconnecting
        for (let lId in userPairs) {
          if (userPairs[lId] === rightId) {
            delete userPairs[lId];
            drawLines();
            updateMatchingStyles();
            playBeep(300, 'triangle');
            return;
          }
        }
        return;
      }
      playBeep(600);
      // Remove any previous pairing pointing to this rightId
      for (let lId in userPairs) {
        if (userPairs[lId] === rightId) delete userPairs[lId];
      }
      userPairs[selectedLeftId] = rightId;
      selectedLeftId = null;
      drawLines();
      updateMatchingStyles();
    }

    function updateMatchingStyles() {
      document.querySelectorAll('.column .match-item').forEach(el => {
        el.classList.remove('selected', 'paired');
      });
      if (selectedLeftId) {
        const leftEl = document.getElementById('left_' + selectedLeftId);
        if (leftEl) leftEl.classList.add('selected');
      }
      for (let lId in userPairs) {
        const leftEl = document.getElementById('left_' + lId);
        const rId = userPairs[lId];
        const rightEl = document.getElementById('right_' + rId);
        if (leftEl) leftEl.classList.add('paired');
        if (rightEl) rightEl.classList.add('paired');
      }
    }

    function drawLines() {
      const svg = document.getElementById('lineLayer');
      if (!svg) return;
      svg.innerHTML = '';
      const board = document.getElementById('matchingBoard');
      if (!board) return;
      const bRect = board.getBoundingClientRect();

      for (let lId in userPairs) {
        const rId = userPairs[lId];
        const leftEl = document.getElementById('left_' + lId);
        const rightEl = document.getElementById('right_' + rId);
        if (!leftEl || !rightEl) continue;

        const lDot = leftEl.querySelector('.dot');
        const rDot = rightEl.querySelector('.dot');
        const lRect = (lDot || leftEl).getBoundingClientRect();
        const rRect = (rDot || rightEl).getBoundingClientRect();

        const x1 = lRect.left + lRect.width/2 - bRect.left;
        const y1 = lRect.top + lRect.height/2 - bRect.top;
        const x2 = rRect.left + rRect.width/2 - bRect.left;
        const y2 = rRect.top + rRect.height/2 - bRect.top;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const cx1 = x1 + (x2 - x1) * 0.5;
        const cx2 = x2 - (x2 - x1) * 0.5;
        const d = \`M \${x1} \${y1} C \${cx1} \${y1}, \${cx2} \${y2}, \${x2} \${y2}\`;

        let strokeColor = '#8b5cf6';
        if (checked) {
          strokeColor = (lId === rId) ? '#22c55e' : '#ef4444';
        }

        path.setAttribute('d', d);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', strokeColor);
        path.setAttribute('stroke-width', '4');
        path.setAttribute('stroke-linecap', 'round');
        svg.appendChild(path);
      }
    }

    // MODE 2: Image Drop
    function renderImageDrop(container) {
      const imgUrl = GAME_DATA.backgroundImage;
      const zones = GAME_DATA.imageDropZones || [];
      const cards = GAME_DATA.imageAnswerCards || [];

      if (!imgUrl) {
        container.innerHTML = '<div style="text-align:center; padding: 40px; color:#64748b;">Trò chơi chưa có hình ảnh.</div>';
        return;
      }

      const board = document.createElement('div');
      board.className = 'image-board';

      const imgBox = document.createElement('div');
      imgBox.className = 'image-container';

      const img = document.createElement('img');
      img.src = imgUrl;
      imgBox.appendChild(img);

      zones.forEach(z => {
        const zoneEl = document.createElement('div');
        zoneEl.className = 'drop-zone' + (imageZoneAnswers[z.id] ? ' filled' : '');
        zoneEl.id = 'zone_' + z.id;
        zoneEl.style.left = z.x + '%';
        zoneEl.style.top = z.y + '%';
        zoneEl.style.width = z.width + '%';
        zoneEl.style.height = z.height + '%';

        const filledCardId = imageZoneAnswers[z.id];
        const cardObj = cards.find(c => c.id === filledCardId);
        zoneEl.innerText = cardObj ? cardObj.text : (z.label || 'Vùng thả');

        zoneEl.onclick = () => {
          if (checked) return;
          if (selectedZoneCard) {
            imageZoneAnswers[z.id] = selectedZoneCard;
            selectedZoneCard = null;
            playBeep(520);
            renderGame();
          } else if (imageZoneAnswers[z.id]) {
            delete imageZoneAnswers[z.id];
            playBeep(320);
            renderGame();
          }
        };

        imgBox.appendChild(zoneEl);
      });

      board.appendChild(imgBox);
      container.appendChild(board);

      // Card bank
      const bank = document.createElement('div');
      bank.className = 'card-bank';

      const usedCardIds = Object.values(imageZoneAnswers);
      const availableCards = cards.filter(c => !usedCardIds.includes(c.id));

      if (availableCards.length === 0 && cards.length > 0) {
        bank.innerHTML = '<span style="color:#64748b; font-size:14px;">Bé đã kéo thả hết tất cả các thẻ! Nhấn "Kiểm tra kết quả" để xem điểm nhé.</span>';
      } else {
        availableCards.forEach(c => {
          const cardEl = document.createElement('div');
          cardEl.className = 'answer-card' + (selectedZoneCard === c.id ? ' selected' : '');
          cardEl.innerText = c.text;
          cardEl.onclick = () => {
            if (checked) return;
            selectedZoneCard = (selectedZoneCard === c.id ? null : c.id);
            playBeep(440);
            renderGame();
          };
          bank.appendChild(cardEl);
        });
      }
      container.appendChild(bank);
    }

    // MODE 3: Categorize
    function renderCategorize(container) {
      const categories = GAME_DATA.categories || [];
      const cards = GAME_DATA.categorizeCards || [];

      const grid = document.createElement('div');
      grid.className = 'categories-grid';

      categories.forEach(cat => {
        const box = document.createElement('div');
        box.className = 'category-box';
        box.style.borderTopColor = cat.color || '#0284c7';

        const title = document.createElement('div');
        title.className = 'category-title';
        title.innerText = cat.title;
        box.appendChild(title);

        const list = document.createElement('div');
        list.className = 'category-cards';

        const assignedCards = cards.filter(c => categorizeAnswers[c.id] === cat.id);
        assignedCards.forEach(c => {
          const cardEl = document.createElement('div');
          cardEl.className = 'answer-card';
          cardEl.innerText = c.text;
          cardEl.onclick = () => {
            if (checked) return;
            delete categorizeAnswers[c.id];
            playBeep(350);
            renderGame();
          };
          list.appendChild(cardEl);
        });

        box.onclick = (e) => {
          if (checked) return;
          if (selectedZoneCard) {
            categorizeAnswers[selectedZoneCard] = cat.id;
            selectedZoneCard = null;
            playBeep(520);
            renderGame();
          }
        };

        box.appendChild(list);
        grid.appendChild(box);
      });
      container.appendChild(grid);

      // Bank
      const bank = document.createElement('div');
      bank.className = 'card-bank';

      const unassigned = cards.filter(c => !categorizeAnswers[c.id]);
      if (unassigned.length === 0 && cards.length > 0) {
        bank.innerHTML = '<span style="color:#64748b; font-size:14px;">Bé đã phân loại hết các thẻ!</span>';
      } else {
        unassigned.forEach(c => {
          const cardEl = document.createElement('div');
          cardEl.className = 'answer-card' + (selectedZoneCard === c.id ? ' selected' : '');
          cardEl.innerText = c.text;
          cardEl.onclick = () => {
            if (checked) return;
            selectedZoneCard = (selectedZoneCard === c.id ? null : c.id);
            playBeep(440);
            renderGame();
          };
          bank.appendChild(cardEl);
        });
      }
      container.appendChild(bank);
    }

    function checkAnswers() {
      checked = true;
      let total = 0;
      let correct = 0;

      if (GAME_DATA.mode === 'matching') {
        const pairs = GAME_DATA.matchingPairs || [];
        total = pairs.length;
        pairs.forEach(p => {
          const userR = userPairs[p.id];
          const leftEl = document.getElementById('left_' + p.id);
          const rightEl = document.getElementById('right_' + userR);
          if (userR === p.id) {
            correct++;
            if (leftEl) leftEl.classList.add('correct');
            if (rightEl) rightEl.classList.add('correct');
          } else {
            if (leftEl) leftEl.classList.add('incorrect');
            if (rightEl) rightEl.classList.add('incorrect');
          }
        });
        drawLines();
      } else if (GAME_DATA.mode === 'image_drop') {
        const zones = GAME_DATA.imageDropZones || [];
        total = zones.length;
        zones.forEach(z => {
          const zoneEl = document.getElementById('zone_' + z.id);
          if (imageZoneAnswers[z.id] === z.correctCardId) {
            correct++;
            if (zoneEl) zoneEl.classList.add('correct');
          } else {
            if (zoneEl) zoneEl.classList.add('incorrect');
          }
        });
      } else if (GAME_DATA.mode === 'categorize') {
        const cards = GAME_DATA.categorizeCards || [];
        total = cards.length;
        cards.forEach(c => {
          if (categorizeAnswers[c.id] === c.targetCategoryId) {
            correct++;
          }
        });
      }

      if (total === 0) {
        alert('Trò chơi chưa có câu hỏi nào!');
        return;
      }

      const percent = Math.round((correct / total) * 100);
      document.getElementById('modalScore').innerText = percent + '%';
      document.getElementById('modalDesc').innerText = 'Bé đã trả lời đúng ' + correct + '/' + total + ' câu!';

      if (percent === 100) {
        document.getElementById('modalEmoji').innerText = '🌟';
        document.getElementById('modalTitle').innerText = 'Tuyệt Vời! Xuất Sắc!';
        playSuccess();
      } else if (percent >= 60) {
        document.getElementById('modalEmoji').innerText = '👏';
        document.getElementById('modalTitle').innerText = 'Rất Tốt! Cố Thêm Chút Nữa Nhé!';
        playBeep(520);
      } else {
        document.getElementById('modalEmoji').innerText = '💪';
        document.getElementById('modalTitle').innerText = 'Cố Gắng Lên Nào!';
        playBeep(320);
      }

      document.getElementById('resultModal').style.display = 'flex';
    }

    function resetGame() {
      checked = false;
      userPairs = {};
      selectedLeftId = null;
      selectedZoneCard = null;
      imageZoneAnswers = {};
      categorizeAnswers = {};
      renderGame();
    }

    function closeModal() {
      document.getElementById('resultModal').style.display = 'none';
    }

    // Initialize
    window.onload = renderGame;
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileName = (game.title.trim() ? game.title.trim().replace(/[^a-zA-Z0-9\s_À-ỹ-]/g, '') : 'tro-choi') + '.html';
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
