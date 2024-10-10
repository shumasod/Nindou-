// 「忍道伝説！影丸の冒険」

// 主人公、影丸！
class Player {
    constructor(name) {
        this.name = name;
        this.health = 100; // 体力満タン！
        this.chakra = 100; // チャクラもバッチリ！
        this.techniques = []; // 忍術の書
    }

    learnTechnique(technique) {
        this.techniques.push(technique);
        console.log(`${this.name}「新しい忍術を習得したぞ！${technique.name}！」`);
    }

    useTechnique(technique, target) {
        if (this.chakra >= technique.chakraCost) {
            this.chakra -= technique.chakraCost;
            technique.effect(target);
            console.log(`${this.name}「喰らえ！${technique.name}！」`);
        } else {
            console.log(`${this.name}「チッ...チャクラが足りん...」`);
        }
    }
}

// 伝説の忍術！
class Technique {
    constructor(name, chakraCost, effect) {
        this.name = name;
        this.chakraCost = chakraCost;
        this.effect = effect;
    }
}

// 恐るべき敵忍者！
class Enemy {
    constructor(name, health) {
        this.name = name;
        this.health = health;
    }
}

// 物語の進行役、語り部
class GameState {
    constructor() {
        this.player = null;
        this.currentEnemy = null;
        this.location = "木ノ葉隠れの里";
        this.story = {
            chapter: 0,
            event: 0
        };
    }

    initializeGame(playerName) {
        this.player = new Player(playerName);
        this.story.chapter = 1;
        this.story.event = 0;
        console.log(`語り部「${playerName}よ、君の忍道伝説が今、始まる！」`);
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
                    console.log("語り部「第一章：闇に包まれし里！影丸、立ち上がる！」");
                }
                break;
            case 2:
                if (this.story.event === 0) {
                    console.log("語り部「第二章：宿敵を追いかけて！影丸の旅立ち！」");
                }
                break;
            // 続きのストーリーイベントをここに追加
        }
    }

    battle(enemy) {
        this.currentEnemy = enemy;
        console.log(`${enemy.name}「ふっ...見つけたぞ、${this.player.name}！」`);
        // バトルロジックをここに実装
    }
}

// 物語の幕開け
const game = new GameState();
game.initializeGame("影丸");

// 伝説の火遁の術！
const fireballTechnique = new Technique("火遁・豪火球の術", 20, (target) => {
    target.health -= 30;
    console.log(`${target.name}「ぐわあっ！」炎に包まれる！`);
});

// 影丸、火遁を習得！
game.player.learnTechnique(fireballTechnique);

// 物語の流れ（実際のゲームでは、プレイヤーの選択で進行）
function gameLoop() {
    game.progressStory();
    if (Math.random() < 0.3) {  // 30%の確率で敵と遭遇
        const enemy = new Enemy("闇忍者", 50);
        game.battle(enemy);
    }
}

// 物語の展開（この例では5つの場面を描写）
for (let i = 0; i < 5; i++) {
    gameLoop();
}

console.log("語り部「影丸の冒険は、まだまだ続く...！」");