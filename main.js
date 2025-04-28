document.addEventListener("DOMContentLoaded", () => {
    let currentDifficulty = '';
  
    const pages = {
      start: document.getElementById('startPage'),
      difficulty: document.getElementById('difficultyPage'),
      main: document.getElementById('mainPage')
    };
  
    const startBtn = document.getElementById('startBtn');
    const difficultyButtons = document.querySelectorAll('[data-difficulty]');
    const badge = document.getElementById('difficultyBadge');
  
    const drawingCanvas = document.getElementById('drawingCanvas');
    const ctx = drawingCanvas ? drawingCanvas.getContext('2d') : null;
  
    const resetBtn = document.getElementById('resetBtn');
    const undoBtn = document.getElementById('undoBtn');
    const submitBtn = document.getElementById('submitBtn');
  
    let lastPoint = null;
    const gridSize = 30;
    let lines = []; // ⭐ 선 목록 저장
  
    function showPage(pageId) {
      Object.values(pages).forEach(page => page.classList.remove('active'));
      pages[pageId].classList.add('active');
    }
  
    function setDifficulty(difficulty) {
      currentDifficulty = difficulty;
      badge.textContent =
        difficulty === 'easy' ? '하' :
        difficulty === 'medium' ? '중' :
        difficulty === 'hard' ? '상' : '-';
  
      showPage('main');
  
      if (ctx) {
        resetCanvas();
        init3DViewer();
      }
    }
  
    function clearCanvas() {
      ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    }
  
    function drawGrid(size = gridSize) {
      clearCanvas();
      ctx.strokeStyle = "#ddd";
      ctx.lineWidth = 1;
  
      for (let x = 0; x <= drawingCanvas.width; x += size) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, drawingCanvas.height);
        ctx.stroke();
      }
  
      for (let y = 0; y <= drawingCanvas.height; y += size) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(drawingCanvas.width, y);
        ctx.stroke();
      }
    }
  
    function resetCanvas() {
      drawGrid();
      lines = [];    // ⭐ 선 목록도 리셋
      lastPoint = null;
    }
  
    if (drawingCanvas) {
      drawingCanvas.addEventListener('click', (e) => {
        const rect = drawingCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
  
        const snappedX = Math.round(x / gridSize) * gridSize;
        const snappedY = Math.round(y / gridSize) * gridSize;
  
        // 점 찍는 코드는 삭제했음 (선만 그림)
  
        if (lastPoint) {
          ctx.strokeStyle = "black";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(lastPoint.x, lastPoint.y);
          ctx.lineTo(snappedX, snappedY);
          ctx.stroke();
  
          lines.push({ from: lastPoint, to: { x: snappedX, y: snappedY } });
        }
  
        lastPoint = { x: snappedX, y: snappedY };
      });
    }
  
    startBtn.addEventListener('click', () => {
      showPage('difficulty');
    });
  
    difficultyButtons.forEach(button => {
      button.addEventListener('click', () => {
        const selected = button.dataset.difficulty;
        setDifficulty(selected);
      });
    });
  
    resetBtn.addEventListener('click', () => {
      resetCanvas();
    });
  
    undoBtn.addEventListener('click', () => {
      if (lines.length > 0) {
        lines.pop(); // 마지막 선 제거
        redrawAll();
      }
    });
  
    submitBtn.addEventListener('click', () => {
      console.log('제출된 선 목록:', lines);
      alert('도면이 제출되었습니다!');
    });
  
    function redrawAll() {
      drawGrid();
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      lines.forEach(line => {
        ctx.beginPath();
        ctx.moveTo(line.from.x, line.from.y);
        ctx.lineTo(line.to.x, line.to.y);
        ctx.stroke();
      });
    }
  
    function init3DViewer() {
      const viewer = document.getElementById('viewer');
      viewer.innerHTML = '';
  
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(300, 300);
      viewer.appendChild(renderer.domElement);
  
      let geometry;
  
      // ⭐ 난이도에 따라 다른 도형 생성
      if (currentDifficulty === 'easy') {
        geometry = new THREE.BoxGeometry(); // 큐브
      } else if (currentDifficulty === 'medium') {
        geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32); // 원기둥
      } else if (currentDifficulty === 'hard') {
        geometry = new THREE.ConeGeometry(0.5, 1, 32); // 원뿔
      } else {
        geometry = new THREE.BoxGeometry(); // 기본 fallback
      }
  
      const material = new THREE.MeshNormalMaterial();
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
  
      camera.position.z = 2;
  
      function animate() {
        requestAnimationFrame(animate);
        mesh.rotation.x += 0.01;
        mesh.rotation.y += 0.01;
        renderer.render(scene, camera);
      }
      animate();
    }
  });
  