<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>忍者の火消しゲーム</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            font-family: Arial, sans-serif;
            touch-action: manipulation;
            background-color: #2C3E50;
        }
        #game-container {
            width: 300px;
            height: 200px;
            border: 2px solid #E74C3C;
            position: relative;
            overflow: hidden;
            background-color: #ECF0F1;
        }
        #player {
            font-size: 40px;
            position: absolute;
            bottom: 0;
            left: 20px;
            line-height: 1;
        }
        .item {
            font-size: 30px;
            position: absolute;
            line-height: 1;
        }
        #score, #weapon {
            position: absolute;
            font-size: 16px;
            color: #2980B9;
        }
        #score { top: 10px; left: 10px; }
        #weapon { top: 30px; left: 10px; }
    </style>
</head>
<body>
    <div id="game-container">
        <div id="player">🥷</div>
        <div id="score">水: 0</div>
        <div id="weapon">武器: なし</div>
    </div>
    <button id="jump-button" class="fixed bottom-5 left-1/4 transform -translate-x-1/2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        ジャンプ
    </button>
    <button id="shoot-button" class="fixed bottom-5 right-1/4 transform translate-x-1/2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
        発射
    </button>

    <script>
        const player = document.getElementById('player');
        const scoreElement = document.getElementById('score');
        const weaponElement = document.getElementById('weapon');
        const jumpButton = document.getElementById('jump-button');
        const shootButton = document.getElementById('shoot-button');
        const gameContainer = document.getElementById('game-container');
        let isJumping = false;
        let score = 0;
        let weapon = null;

        jumpButton.addEventListener('touchstart', jump);
        jumpButton.addEventListener('mousedown', jump);
        shootButton.addEventListener('touchstart', shoot);
        shootButton.addEventListener('mousedown', shoot);
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !isJumping) {
                jump();
            } else if (e.code === 'KeyS') {
                shoot();
            }
        });

        function jump() {
            if (isJumping) return;
            isJumping = true;
            let jumpHeight = 0;
            const jumpInterval = setInterval(() => {
                if (jumpHeight >= 60) {
                    clearInterval(jumpInterval);
                    fall();
                } else {
                    jumpHeight += 3;
                    player.style.bottom = jumpHeight + 'px';
                }
            }, 20);
        }

        function fall() {
            const fallInterval = setInterval(() => {
                const currentBottom = parseInt(player.style.bottom) || 0;
                if (currentBottom <= 0) {
                    clearInterval(fallInterval);
                    player.style.bottom = '0px';
                    isJumping = false;
                } else {
                    player.style.bottom = (currentBottom - 3) + 'px';
                }
            }, 20);
        }

        function shoot() {
            if (!weapon) return;
            
            if (weapon === '🔫') {
                shootWaterGun();
            } else if (weapon === '💣') {
                dropWaterBomb();
            }

            weapon = null;
            updateWeaponDisplay();
        }

        function shootWaterGun() {
            const waterBeam = document.createElement('div');
            waterBeam.textContent = '💦';
            waterBeam.style.position = 'absolute';
            waterBeam.style.fontSize = '20px';
            waterBeam.style.left = `${parseInt(player.style.left) + 40}px`;
            waterBeam.style.bottom = `${parseInt(player.style.bottom) + 20}px`;
            gameContainer.appendChild(waterBeam);

            const moveBeam = setInterval(() => {
                const left = parseInt(waterBeam.style.left);
                if (left >= 300) {
                    clearInterval(moveBeam);
                    gameContainer.removeChild(waterBeam);
                } else {
                    waterBeam.style.left = `${left + 5}px`;
                    checkBeamCollision(waterBeam);
                }
            }, 20);
        }

        function dropWaterBomb() {
            const waterBomb = document.createElement('div');
            waterBomb.textContent = '💦';
            waterBomb.style.position = 'absolute';
            waterBomb.style.fontSize = '40px';
            waterBomb.style.left = `${parseInt(player.style.left) + 20}px`;
            waterBomb.style.bottom = `${parseInt(player.style.bottom) + 40}px`;
            gameContainer.appendChild(waterBomb);

            setTimeout(() => {
                gameContainer.removeChild(waterBomb);
                extinguishAllFires();
            }, 1000);
        }

        function extinguishAllFires() {
            document.querySelectorAll('.item').forEach(item => {
                if (item.textContent === '🔥') {
                    gameContainer.removeChild(item);
                    score += 2;
                }
            });
            updateScore();
        }

        function checkBeamCollision(beam) {
            const beamRect = beam.getBoundingClientRect();
            document.querySelectorAll('.item').forEach(item => {
                if (item.textContent === '🔥') {
                    const itemRect = item.getBoundingClientRect();
                    if (beamRect.left < itemRect.right &&
                        beamRect.right > itemRect.left &&
                        beamRect.top < itemRect.bottom &&
                        beamRect.bottom > itemRect.top) {
                        gameContainer.removeChild(item);
                        gameContainer.removeChild(beam);
                        score += 2;
                        updateScore();
                    }
                }
            });
        }

        function createItem(type) {
            const item = document.createElement('div');
            item.className = 'item';
            item.textContent = type === 'obstacle' ? '🔥' : (type === 'water' ? '💧' : (type === 'watergun' ? '🔫' : '💣'));
            item.style.right = '-30px';
            item.style.bottom = `${Math.random() * 160}px`;
            gameContainer.appendChild(item);

            function moveItem() {
                const right = parseInt(item.style.right);
                if (right >= 330) {
                    if (gameContainer.contains(item)) {
                        gameContainer.removeChild(item);
                    }
                    return false;
                } else {
                    item.style.right = `${right + 2}px`;
                    checkCollision(item);
                    return true;
                }
            }

            return moveItem;
        }

        function checkCollision(item) {
            const playerRect = player.getBoundingClientRect();
            const itemRect = item.getBoundingClientRect();

            if (playerRect.left < itemRect.right &&
                playerRect.right > itemRect.left &&
                playerRect.top < itemRect.bottom &&
                playerRect.bottom > itemRect.top) {
                if (item.textContent === '💧') {
                    score += 1;
                    updateScore();
                    gameContainer.removeChild(item);
                } else if (item.textContent === '🔥') {
                    gameOver();
                } else if (item.textContent === '🔫' || item.textContent === '💣') {
                    weapon = item.textContent;
                    updateWeaponDisplay();
                    gameContainer.removeChild(item);
                }
            }
        }

        function updateScore() {
            scoreElement.textContent = `水: ${score}`;
        }

        function updateWeaponDisplay() {
            weaponElement.textContent = `武器: ${weapon || 'なし'}`;
        }

        function gameOver() {
            alert(`ゲームオーバー！ 集めた水: ${score}`);
            location.reload();
        }

        function gameLoop() {
            let items = [];

            function createAndMoveItems() {
                if (Math.random() < 0.03) {
                    const randomValue = Math.random();
                    if (randomValue < 0.4) {
                        items.push(createItem('obstacle'));
                    } else if (randomValue < 0.7) {
                        items.push(createItem('water'));
                    } else if (randomValue < 0.9) {
                        items.push(createItem('watergun'));
                    } else {
                        items.push(createItem('waterbomb'));
                    }
                }
                items = items.filter(item => item());
                requestAnimationFrame(createAndMoveItems);
            }

            createAndMoveItems();
        }

        gameLoop();

        // iOS用のスクロール防止
        document.body.addEventListener('touchmove', function(e) {
            e.preventDefault();
        }, { passive: false });
    </script>
</body>
</html>