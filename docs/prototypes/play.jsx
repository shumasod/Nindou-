import React, { useState } from 'react';

const BattleScreen = () => {
  const [playerHealth, setPlayerHealth] = useState(100);
  const [enemyHealth, setEnemyHealth] = useState(100);
  const [battleLog, setBattleLog] = useState([]);

  const attack = (attackType) => {
    // プレイヤーの攻撃
    const playerDamage = Math.floor(Math.random() * 20) + 10;
    setEnemyHealth(prev => Math.max(0, prev - playerDamage));
    addToBattleLog(`あなたの${attackType}が${playerDamage}のダメージを与えた！`);

    // 敵の攻撃
    if (enemyHealth > playerDamage) {
      const enemyDamage = Math.floor(Math.random() * 15) + 5;
      setPlayerHealth(prev => Math.max(0, prev - enemyDamage));
      addToBattleLog(`敵の攻撃が${enemyDamage}のダメージを与えた！`);
    }
  };

  const addToBattleLog = (message) => {
    setBattleLog(prev => [message, ...prev].slice(0, 5));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-red-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">サイバー忍道 - バトル</h1>
        
        <div className="flex justify-between mb-8">
          <HealthBar label="プレイヤー" health={playerHealth} />
          <HealthBar label="敵" health={enemyHealth} />
        </div>
        
        <div className="flex justify-between items-center mb-8">
          <div className="w-1/3 text-center">
            <div className="text-6xl mb-2">🥷</div>
            <div className="text-xl">あなた</div>
          </div>
          <div className="w-1/3 text-center text-4xl font-bold">VS</div>
          <div className="w-1/3 text-center">
            <div className="text-6xl mb-2">👹</div>
            <div className="text-xl">敵忍者</div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-8">
          <button onClick={() => attack('サイバー苦無')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300">
            サイバー苦無
          </button>
          <button onClick={() => attack('電子忍術')} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-300">
            電子忍術
          </button>
          <button onClick={() => attack('ハッキングの術')} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300">
            ハッキングの術
          </button>
        </div>
        
        <div className="bg-black bg-opacity-50 p-4 rounded">
          <h2 className="text-xl font-bold mb-2">バトルログ</h2>
          {battleLog.map((log, index) => (
            <p key={index} className="mb-1">{log}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

const HealthBar = ({ label, health }) => (
  <div className="w-2/5">
    <div className="flex justify-between mb-1">
      <span>{label}</span>
      <span>{health}/100</span>
    </div>
    <div className="w-full bg-gray-700 rounded-full h-4">
      <div
        className="bg-green-600 rounded-full h-4"
        style={{ width: `${health}%` }}
      ></div>
    </div>
  </div>
);

export default BattleScreen;