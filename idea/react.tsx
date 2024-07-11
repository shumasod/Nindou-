import React from 'react';
import { Moon, Scroll, Users, Target } from 'lucide-react';

const NinjaSite = () => {
  const navItems = [
    { label: 'ホーム', href: '#home' },
    { label: '忍術', href: '#ninjutsu' },
    { label: 'ミッション', href: '#missions' },
    { label: 'ランキング', href: '#ranking' },
  ];

  const features = [
    { icon: Moon, title: '秘術の習得', description: '古来より伝わる忍術を学び、マスターせよ。' },
    { icon: Scroll, title: '巻物の解読', description: '古の知恵が詰まった巻物の謎を解き明かせ。' },
    { icon: Users, title: '同志との絆', description: '仲間と協力し、困難なミッションに挑め。' },
    { icon: Target, title: '目標の追求', description: '自身の忍道を極め、頂点を目指せ。' },
  ];

  return (
    <div className="bg-slate-900 min-h-screen text-blue-100 font-sans">
      <header className="bg-slate-800 p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-ninja">忍道 - Nindo</h1>
          <nav>
            <ul className="flex space-x-4">
              {navItems.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="hover:text-blue-400 transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto mt-8 px-4">
        <section className="bg-slate-800 rounded-lg p-8 mb-8 shadow-lg border border-blue-500">
          <h2 className="text-3xl font-ninja mb-4">忍の道へようこそ</h2>
          <p className="mb-4">あなたの忍道を極めよう。技を磨き、ミッションをこなし、最高の忍になれ。</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
            修行を始める
          </button>
        </section>
        
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="bg-slate-800 p-6 rounded-lg shadow-md border border-blue-400 hover:border-blue-300 transition-colors">
              <feature.icon className="text-blue-400 mb-4" size={48} />
              <h3 className="text-xl font-ninja mb-2">{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </section>
      </main>
      
      <footer className="bg-slate-800 mt-12 py-6 text-center">
        <p>&copy; {new Date().getFullYear()} 忍道 - Nindo. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default NinjaSite;