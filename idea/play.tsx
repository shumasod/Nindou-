<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>忍者の火避けゲーム</title>
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
        #score {
            position: absolute;
            top: 10px;
            left: 10px;
            font-size: 16px;
            color: #2980B9;
        }
    </style>
</head>
<body>
    <div id="game-container">
        <div id="player">🥷</div>
        <div id="score">水: 0</div>
    </div>
    <button id="jump-button" class="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        ジャンプ
    </button>

    <script>
        const player = document.getElementById('player');
        const scoreElement = document.getElementById('score');
        const jumpButton = document.getElementById('jump-button');
        const gameContainer = document.getElementById('game-container');
        let isJumping = false;
        let score = 0;

        jumpButton.addEventListener('touchstart', jump);
        jumpButton.addEventListener('mousedown', jump);
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !isJumping) {
                jump();
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

        function createItem(type) {
            const item = document.createElement('div');
            item.className = 'item';
            item.textContent = type === 'obstacle' ? '🔥' : '💧';
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
                }
            }
        }

        function updateScore() {
            scoreElement.textContent = `水: ${score}`;
        }

        function gameOver() {
            alert(`ゲームオーバー！ 集めた水: ${score}`);
            location.reload();
        }

        function gameLoop() {
            let items = [];

            function createAndMoveItems() {
                if (Math.random() < 0.03) {
                    items.push(createItem(Math.random() < 0.7 ? 'obstacle' : 'water'));
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