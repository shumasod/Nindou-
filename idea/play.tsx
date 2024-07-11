import React, { useState } from 'react';
import { Zap, Shield, Sword, Droplet, Wind, Mountain, Sun, Cloud } from 'lucide-react';

const CyberNinjaRPG = () => {
  const [activeTab, setActiveTab] = useState('ビレッジ');
  const [playerChakra, setPlayerChakra] = useState(100);
  const [enemyChakra, setEnemyChakra] = useState(100);

  const renderContent = () => {
    switch(activeTab) {
      case 'バトル':
        return <BattleScreen playerChakra={playerChakra} enemyChakra={enemyChakra} />;
      case 'ステータス':
        return <StatusScreen />;
      case 'ミッション':
        return <MissionScreen />;
      default:
        return <VillageScreen />;
    }
  };

  return (
    <div className="bg-gradient-to-b from-slate-900 to-purple-900 min-h-screen text-gray-100 font-sans">
      <header className="bg-black bg-opacity-50 p-4 flex justify-between items-center">
        <h1 className="text-3xl font-ninja text-orange-500">サイバー木ノ葉隠れの里</h1>
        <nav>
          <ul className="flex space-x-6">
            {['ビレッジ', 'バトル', 'ステータス', 'ミッション'].map((tab) => (
              <li key={tab}>
                <button
                  onClick={() => setActiveTab(tab)}
                  className={`hover:text-orange-400 transition-colors ${activeTab === tab ? 'text-orange-400 border-b-2 border-orange-400' : ''}`}
                >
                  {tab}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      
      <main className="container mx-auto mt-8 px-4">
        {renderContent()}
      </main>
    </div>
  );
};

const VillageScreen = () => (
  <div className="bg-black bg-opacity-60 rounded-lg p-4 shadow-lg border border-orange-500">
    <h2 className="text-2xl font-ninja mb-4 text-orange-400">サイバー木ノ葉隠れの里</h2>
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-gray-800 p-4 rounded">
        <h3 className="text-xl mb-2">忍者アカデミー</h3>
        <p>新しい忍術を学ぶ</p>
        <button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          訓練する
        </button>
      </div>
      <div className="bg-gray-800 p-4 rounded">
        <h3 className="text-xl mb-2">火影のオフィス</h3>
        <p>ミッションを受け取る</p>
        <button className="mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          ミッション確認
        </button>
      </div>
      <div className="bg-gray-800 p-4 rounded">
        <h3 className="text-xl mb-2">ラーメンイチラク</h3>
        <p>チャクラを回復する</p>
        <button className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
          食事する
        </button>
      </div>
    </div>
  </div>
);

const BattleScreen = ({ playerChakra, enemyChakra }) => (
  <div className="bg-black bg-opacity-60 rounded-lg p-4 shadow-lg border border-red-500">
    <h2 className="text-2xl font-ninja mb-4 text-red-400">忍術バトル</h2>
    <div className="flex justify-between mb-4">
      <div>
        <h3 className="text-xl mb-2">サイバー忍者</h3>
        <div className="w-48 bg-gray-700 rounded-full h-4">
          <div className="bg-blue-600 h-4 rounded-full" style={{width: `${playerChakra}%`}}></div>
        </div>
        <p>チャクラ: {playerChakra}/100</p>
      </div>
      <div>
        <h3 className="text-xl mb-2">敵忍者</h3>
        <div className="w-48 bg-gray-700 rounded-full h-4">
          <div className="bg-red-600 h-4 rounded-full" style={{width: `${enemyChakra}%`}}></div>
        </div>
        <p>チャクラ: {enemyChakra}/100</p>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center">
        <Sun className="mr-2" /> 火遁
      </button>
      <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center">
        <Droplet className="mr-2" /> 水遁
      </button>
      <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center">
        <Mountain className="mr-2" /> 土遁
      </button>
      <button className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center">
        <Wind className="mr-2" /> 風遁
      </button>
      <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center">
        <Cloud className="mr-2" /> 雷遁
      </button>
      <button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center">
        <Zap className="mr-2" /> 瞬身の術
      </button>
    </div>
  </div>
);

const StatusScreen = () => (
  <div className="bg-black bg-opacity-60 rounded-lg p-4 shadow-lg border border-purple-500">
    <h2 className="text-2xl font-ninja mb-4 text-purple-400">忍者ステータス</h2>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h3 className="text-xl mb-2">基本情報</h3>
        <p>忍者ランク: 中忍</p>
        <p>経験値: 2500 / 5000</p>
        <p>次のランクまで: 2500 XP</p>
      </div>
      <div>
        <h3 className="text-xl mb-2">チャクラ属性</h3>
        <p>主属性: 火遁</p>
        <p>副属性: 風遁</p>
      </div>
    </div>
    <div className="mt-4">
      <h3 className="text-xl mb-2">装備</h3>
      <p>武器: サイバー手裏剣 Lv.4 (攻撃力+30)</p>
      <p>防具: ネオ忍着 Lv.3 (防御力+25)</p>
    </div>
    <div className="mt-4">
      <h3 className="text-xl mb-2">習得忍術</h3>
      <p>火遁・豪火球の術 Lv.3</p>
      <p>風遁・烈風掌 Lv.2</p>
      <p>サイバー影分身の術 Lv.4</p>
    </div>
  </div>
);

const MissionScreen = () => (
  <div className="bg-black bg-opacity-60 rounded-lg p-4 shadow-lg border border-green-500">
    <h2 className="text-2xl font-ninja mb-4 text-green-400">ミッション</h2>
    <div className="space-y-4">
      <div className="bg-gray-800 p-4 rounded">
        <h3 className="text-xl mb-2">Sランク: サイバーテロ阻止</h3>
        <p>報酬: 5000 XP, 100,000 両</p>
        <button className="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
          受諾
        </button>
      </div>
      <div className="bg-gray-800 p-4 rounded">
        <h3 className="text-xl mb-2">Aランク: 機密データ奪還</h3>
        <p>報酬: 3000 XP, 50,000 両</p>
        <button className="mt-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded">
          受諾
        </button>
      </div>
      <div className="bg-gray-800 p-4 rounded">
        <h3 className="text-xl mb-2">Bランク: 暗号解読</h3>
        <p>報酬: 1500 XP, 30,000 両</p>
        <button className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
          受諾
        </button>
      </div>
    </div>
  </div>
);

export default CyberNinjaRPG;