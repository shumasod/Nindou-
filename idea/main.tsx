import React, { useState } from 'react';
import { Zap, Database, Globe, Shield, User, Briefcase, Cpu, Sword } from 'lucide-react';

const CyberNinjaGame = () => {
  const [activeTab, setActiveTab] = useState('ホーム');

  const renderContent = () => {
    switch(activeTab) {
      case 'キャラクター':
        return <CharacterPanel />;
      case 'ミッション':
        return <MissionPanel />;
      case 'スキル':
        return <SkillPanel />;
      case '装備':
        return <EquipmentPanel />;
      default:
        return <HomePanel />;
    }
  };

  return (
    <div className="bg-gradient-to-b from-slate-900 to-red-900 min-h-screen text-gray-100 font-sans">
      <header className="bg-black bg-opacity-50 p-4 flex justify-between items-center">
        <h1 className="text-3xl font-ninja text-red-500">サイバー忍道</h1>
        <nav>
          <ul className="flex space-x-6">
            {['ホーム', 'キャラクター', 'ミッション', 'スキル', '装備'].map((tab) => (
              <li key={tab}>
                <button
                  onClick={() => setActiveTab(tab)}
                  className={`hover:text-red-400 transition-colors ${activeTab === tab ? 'text-red-400 border-b-2 border-red-400' : ''}`}
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
      
      <footer className="bg-black bg-opacity-50 mt-16 py-6 text-center">
        <p>&copy; 2024 サイバー忍道. All rights reserved.</p>
      </footer>
    </div>
  );
};

const HomePanel = () => (
  <div className="bg-black bg-opacity-60 rounded-lg p-8 shadow-lg border border-red-500 relative overflow-hidden">
    <div className="absolute inset-0 bg-circuit-pattern opacity-10"></div>
    <h2 className="text-4xl font-ninja mb-4 text-red-500 relative z-10">サイバー忍者の世界へようこそ</h2>
    <p className="mb-6 text-lg relative z-10">未来都市を舞台に、最先端技術と忍術を駆使してミッションをこなし、最強の忍者を目指せ！</p>
    <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full transition-colors relative z-10">
      今すぐプレイ
    </button>
  </div>
);

const CharacterPanel = () => (
  <div className="bg-black bg-opacity-60 rounded-lg p-8 shadow-lg border border-blue-500">
    <h2 className="text-3xl font-ninja mb-4 text-blue-400">キャラクター育成</h2>
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-gray-800 p-4 rounded">
        <h3 className="text-xl mb-2">ステータス</h3>
        <ul>
          <li>レベル: 15</li>
          <li>HP: 500/500</li>
          <li>チャクラ: 300/300</li>
          <li>攻撃力: 75</li>
          <li>防御力: 60</li>
        </ul>
      </div>
      <div className="bg-gray-800 p-4 rounded">
        <h3 className="text-xl mb-2">経験値</h3>
        <div className="w-full bg-gray-700 rounded-full h-2.5 dark:bg-gray-700">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{width: '45%'}}></div>
        </div>
        <p className="mt-2">次のレベルまで: 2,500 XP</p>
      </div>
    </div>
  </div>
);

const MissionPanel = () => (
  <div className="bg-black bg-opacity-60 rounded-lg p-8 shadow-lg border border-green-500">
    <h2 className="text-3xl font-ninja mb-4 text-green-400">アクティブミッション</h2>
    <ul className="space-y-4">
      <li className="bg-gray-800 p-4 rounded flex justify-between items-center">
        <span>データ窃取作戦</span>
        <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          開始
        </button>
      </li>
      <li className="bg-gray-800 p-4 rounded flex justify-between items-center">
        <span>ネットワーク防衛</span>
        <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          開始
        </button>
      </li>
    </ul>
  </div>
);

const SkillPanel = () => (
  <div className="bg-black bg-opacity-60 rounded-lg p-8 shadow-lg border border-purple-500">
    <h2 className="text-3xl font-ninja mb-4 text-purple-400">スキルツリー</h2>
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-gray-800 p-4 rounded">
        <h3 className="text-xl mb-2">ハッキング</h3>
        <ul>
          <li>基本ハッキング Lv.3</li>
          <li>高度暗号解読 Lv.2</li>
          <li>システム制御 Lv.1</li>
        </ul>
      </div>
      <div className="bg-gray-800 p-4 rounded">
        <h3 className="text-xl mb-2">忍術</h3>
        <ul>
          <li>サイバー分身の術 Lv.2</li>
          <li>電子隠れの術 Lv.3</li>
          <li>データ奪取の術 Lv.1</li>
        </ul>
      </div>
    </div>
  </div>
);

const EquipmentPanel = () => (
  <div className="bg-black bg-opacity-60 rounded-lg p-8 shadow-lg border border-yellow-500">
    <h2 className="text-3xl font-ninja mb-4 text-yellow-400">装備</h2>
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-gray-800 p-4 rounded">
        <h3 className="text-xl mb-2">武器</h3>
        <p>サイバー苦無 Lv.4</p>
        <p className="text-sm text-gray-400">攻撃力 +30, ハッキング成功率 +15%</p>
      </div>
      <div className="bg-gray-800 p-4 rounded">
        <h3 className="text-xl mb-2">防具</h3>
        <p>ステルス忍装束 Lv.3</p>
        <p className="text-sm text-gray-400">防御力 +25, 潜入成功率 +20%</p>
      </div>
    </div>
  </div>
);

export default CyberNinjaGame;