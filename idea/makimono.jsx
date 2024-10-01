import React, { useState, useEffect, useMemo, useCallback } from 'react';

// Types
type Jutsu = {
  id: number;
  name: string;
  type: string;
  description: string;
  chakraCost: number;
};

type NinjaTool = {
  id: number;
  name: string;
  description: string;
  quantity: number;
};

// Mock data
const mockJutsuList: Jutsu[] = [
  { id: 1, name: '火遁・豪火球の術', type: '火遁', description: '大きな火の玉を放つ', chakraCost: 3 },
  { id: 2, name: '水遁・水龍弾の術', type: '水遁', description: '水龍を操って攻撃する', chakraCost: 4 },
  { id: 3, name: '雷遁・千鳥', type: '雷遁', description: '手から雷を放出して敵を貫く', chakraCost: 4 },
  { id: 4, name: '土遁・土流壁', type: '土遁', description: '巨大な土の壁を作り出す', chakraCost: 3 },
  { id: 5, name: '風遁・螺旋手裏剣', type: '風遁', description: '風の力で手裏剣を操る', chakraCost: 3 },
];

const mockNinjaToolList: NinjaTool[] = [
  { id: 1, name: '手裏剣', description: '投擲武器', quantity: 20 },
  { id: 2, name: 'クナイ', description: '近接・投擲両用の刃物', quantity: 10 },
  { id: 3, name: '煙玉', description: '視界を遮る道具', quantity: 5 },
  { id: 4, name: '起爆札', description: '爆発を起こす札', quantity: 3 },
];

// Mock data fetching functions
const fetchJutsuList = () => new Promise<Jutsu[]>((resolve) => {
  setTimeout(() => resolve(mockJutsuList), 1000);
});

const fetchNinjaToolList = () => new Promise<NinjaTool[]>((resolve) => {
  setTimeout(() => resolve(mockNinjaToolList), 1000);
});

const JutsuCard: React.FC<{ jutsu: Jutsu }> = React.memo(({ jutsu }) => (
  <div className="bg-amber-100 rounded-lg p-4 shadow-md mb-4">
    <h3 className="text-lg font-semibold mb-2">{jutsu.name}</h3>
    <p className="text-sm mb-1">種類: {jutsu.type}</p>
    <p className="text-sm mb-2">{jutsu.description}</p>
    <div className="text-sm">
      チャクラ消費: {'★'.repeat(jutsu.chakraCost)}{'☆'.repeat(5 - jutsu.chakraCost)}
    </div>
  </div>
));

const NinjaToolCard: React.FC<{ tool: NinjaTool }> = React.memo(({ tool }) => (
  <div className="bg-amber-100 rounded-lg p-4 shadow-md mb-4">
    <h3 className="text-lg font-semibold mb-2">{tool.name}</h3>
    <p className="text-sm mb-2">{tool.description}</p>
    <p className="text-sm">所持数: {tool.quantity}</p>
  </div>
));

const ScrollContent: React.FC<{ jutsuList: Jutsu[], toolList: NinjaTool[] }> = React.memo(({ jutsuList, toolList }) => (
  <div className="scroll-content p-8">
    <h2 className="text-2xl font-bold mb-4">忍術リスト</h2>
    {jutsuList.map((jutsu) => (
      <JutsuCard key={jutsu.id} jutsu={jutsu} />
    ))}
    <h2 className="text-2xl font-bold mb-4 mt-8">忍具リスト</h2>
    {toolList.map((tool) => (
      <NinjaToolCard key={tool.id} tool={tool} />
    ))}
  </div>
));

const JutsuCatalog: React.FC = () => {
  const [jutsuList, setJutsuList] = useState<Jutsu[]>([]);
  const [toolList, setToolList] = useState<NinjaTool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [jutsuData, toolData] = await Promise.all([
        fetchJutsuList(),
        fetchNinjaToolList()
      ]);
      setJutsuList(jutsuData);
      setToolList(toolData);
    } catch (err) {
      setError('データの取得に失敗しました。');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const memoizedJutsuList = useMemo(() => jutsuList, [jutsuList]);
  const memoizedToolList = useMemo(() => toolList, [toolList]);

  if (isLoading) return <div className="loading text-center py-8">巻物を展開中...</div>;
  if (error) return <div className="error text-center py-8 text-red-600">{error}</div>;

  return (
    <div className="jutsu-catalog flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="scroll-container relative w-full max-w-3xl">
        <div className="scroll-top h-16 bg-amber-700 rounded-t-full"></div>
        <div className="scroll-middle bg-amber-200 p-4 overflow-y-auto max-h-[70vh]">
          <h1 className="text-3xl font-bold text-center mb-6">忍術・忍具カタログ</h1>
          <ScrollContent jutsuList={memoizedJutsuList} toolList={memoizedToolList} />
        </div>
        <div className="scroll-bottom h-16 bg-amber-700 rounded-b-full"></div>
      </div>
    </div>
  );
};

export default JutsuCatalog;