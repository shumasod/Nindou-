import React from 'react';
import { Moon, Scroll, Users, Target } from 'lucide-react';

const NinjaSite = () => {
  return (
    <div className="bg-slate-900 min-h-screen text-blue-100 font-sans">
      <header className="bg-slate-800 p-4 flex justify-between items-center">
        <h1 className="text-2xl font-ninja">忍道 - Nindo</h1>
        <nav>
          <ul className="flex space-x-4">
            <li><a href="#" className="hover:text-blue-400">ホーム</a></li>
            <li><a href="#" className="hover:text-blue-400">忍術</a></li>
            <li><a href="#" className="hover:text-blue-400">ミッション</a></li>
            <li><a href="#" className="hover:text-blue-400">ランキング</a></li>
          </ul>
        </nav>
      </header>
      
      <main className="container mx-auto mt-8 px-4">
        <div className="bg-slate-800 rounded-lg p-8 mb-8 shadow-lg border border-blue-500">
          <h2 className="text-3xl font-ninja mb-4">忍の道へようこそ</h2>
          <p className="mb-4">あなたの忍道を極めよう。技を磨き、ミッションをこなし、最高の忍になれ。</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            修行を始める
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-800 p-6 rounded-lg shadow-md border border-blue-400">
            <Moon className="text-blue-400 mb-4" size={48} />
            <h3 className="text-xl font-ninja mb-2">秘術の習得</h3>
            <p>古来より伝わる忍術を学び、マスターせよ。</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg shadow-md border border-blue-400">
            <Scroll className="text-blue-400 mb-4" size={48} />
            <h3 className="text-xl font-ninja mb-2">巻物の解読</h3>
            <p>古の知恵が詰まった巻物の謎を解き明かせ。</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg shadow-md border border-blue-400">
            <Users className="text-blue-400 mb-4" size={48} />
            <h3 className="text-xl font-ninja mb-2">同志との絆</h3>
            <p>仲間と協力し、困難なミッションに挑め。</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg shadow-md border border-blue-400">
            <Target className="text-blue-400 mb-4" size={48} />
            <h3 className="text-xl font-ninja mb-2">目標の追求</h3>
            <p>自身の忍道を極め、頂点を目指せ。</p>
          </div>
        </div>
      </main>
      
      <footer className="bg-slate-800 mt-12 py-6 text-center">
        <p>&copy; 2024 忍道 - Nindo. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default NinjaSite;