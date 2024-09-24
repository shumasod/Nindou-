import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';

// Types
/**
 * @typedef {Object} Jutsu
 * @property {number} id - The unique identifier of the jutsu
 * @property {string} name - The name of the jutsu
 * @property {string} type - The type of the jutsu
 * @property {string} description - A description of the jutsu
 * @property {number} chakraCost - The chakra cost of the jutsu (1-5)
 */

// Mock data
const mockJutsuList = [
  { id: 1, name: '火遁・豪火球の術', type: '火遁', description: '大きな火の玉を放つ', chakraCost: 3 },
  { id: 2, name: '水遁・水龍弾の術', type: '水遁', description: '水龍を操って攻撃する', chakraCost: 4 },
  { id: 3, name: '雷遁・千鳥', type: '雷遁', description: '手から雷を放出して敵を貫く', chakraCost: 4 },
  { id: 4, name: '土遁・土流壁', type: '土遁', description: '巨大な土の壁を作り出す', chakraCost: 3 },
  { id: 5, name: '風遁・螺旋手裏剣', type: '風遁', description: '風の力で手裏剣を操る', chakraCost: 3 },
];

// Mock data fetching function
const fetchJutsuList = () => new Promise((resolve) => {
  setTimeout(() => resolve(mockJutsuList), 1000);
});

const ChakraEffect = React.memo(() => (
  <div className="chakra-effect">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="chakra-particle" />
    ))}
  </div>
));

const JutsuCard = React.memo(({ jutsu }) => (
  <div className="jutsu-card">
    <h3>{jutsu.name}</h3>
    <p>種類: {jutsu.type}</p>
    <p>説明: {jutsu.description}</p>
    <div className="chakra-cost">
      チャクラ消費: {'★'.repeat(jutsu.chakraCost)}{'☆'.repeat(5 - jutsu.chakraCost)}
    </div>
  </div>
));

JutsuCard.propTypes = {
  jutsu: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    chakraCost: PropTypes.number.isRequired,
  }).isRequired,
};

const JutsuList = React.memo(({ jutsuList }) => (
  <div className="jutsu-list">
    {jutsuList.map((jutsu) => (
      <JutsuCard key={jutsu.id} jutsu={jutsu} />
    ))}
  </div>
));

JutsuList.propTypes = {
  jutsuList: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    chakraCost: PropTypes.number.isRequired,
  })).isRequired,
};

const JutsuCatalog = () => {
  const [jutsuList, setJutsuList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadJutsuList = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchJutsuList();
      setJutsuList(data);
    } catch (err) {
      setError('忍術リストの取得に失敗しました。');
      console.error('Error fetching jutsu list:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJutsuList();
  }, [loadJutsuList]);

  const memoizedJutsuList = useMemo(() => jutsuList, [jutsuList]);

  if (isLoading) return <div className="loading">巻物を展開中...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="jutsu-catalog">
      <div className="background" />
      <h1 className="ninja-font">忍術カタログ</h1>
      <ChakraEffect />
      <JutsuList jutsuList={memoizedJutsuList} />
    </div>
  );
};

export default JutsuCatalog;
