// 忍道（にんどう）ゲーム - JavaScript実装

// プレイヤークラス
class Player {
    constructor(name) {
        this.name = name;
        this.health = 100;
        this.chakra = 100;
        this.techniques = [];
    }

    learnTechnique(technique) {
        this.techniques.push(technique);
    }

    useTechnique(technique, target) {
        if (this.chakra >= technique.chakraCost) {
            this.chakra -= technique.chakraCost;
            technique.effect(target);
        } else {
            console.log("Not enough chakra!");
        }
    }
}

// 忍術クラス
class Technique {
    constructor(name, chakraCost, effect) {
        this.name = name;
        this.chakraCost = chakraCost;
        this.effect = effect;
    }
}

// 敵クラス
class Enemy {
    constructor(name, health) {
        this.name = name;
        this.health = health;
    }
}

// ゲームステートクラス
class GameState {
    constructor() {
        this.player = null;
        this.currentEnemy = null;
        this.location = "村";
        this.story = {
            chapter: 0,
            event: 0
        };
    }

    initializeGame(playerName) {
        this.player = new Player(playerName);
        this.story.chapter = 1;
        this.story.event = 0;
        console.log(`Welcome, ${playerName}! Your journey in Nindou begins.`);
    }

    progressStory() {
        this.story.event++;
        if (this.story.event > 3) {
            this.story.chapter++;
            this.story.event = 0;
        }
        this.triggerStoryEvent();
    }

    triggerStoryEvent() {
        switch(this.story.chapter) {
            case 1:
                if (this.story.event === 0) {
                    console.log("Chapter 1: The village is under attack!");
                }
                break;
            case 2:
                if (this.story.event === 0) {
                    console.log("Chapter 2: Your journey to find the attackers begins.");
                }
                break;
            // Add more story events here
        }
    }

    battle(enemy) {
        this.currentEnemy = enemy;
        console.log(`A battle begins with ${enemy.name}!`);
        // Implement battle logic here
    }
}

// ゲームの初期化と実行
const game = new GameState();
game.initializeGame("Kagemaru");

// 基本的な忍術の定義
const fireballTechnique = new Technique("Fireball", 20, (target) => {
    target.health -= 30;
    console.log(`${target.name} is hit by a fireball!`);
});

// プレイヤーに忍術を習得させる
game.player.learnTechnique(fireballTechnique);

// ゲームループの例（実際のゲームでは、ユーザー入力やイベントに基づいて進行します）
function gameLoop() {
    game.progressStory();
    if (Math.random() < 0.3) {  // 30%の確率で敵と遭遇
        const enemy = new Enemy("Shadow Ninja", 50);
        game.battle(enemy);
    }
}

// ゲームループを開始（この例では5回繰り返します）
for (let i = 0; i < 5; i++) {
    gameLoop();
}
