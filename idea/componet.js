import React, { useState, useEffect } from 'react';
import { useJutsu } from '../hooks/useJutsu';
import JutsuList from '../components/JutsuList';
import ChakraEffect from '../components/ChakraEffect';

export default function JutsuCatalog() {
  const [jutsuList, setJutsuList] = useState([]);
  const { fetchJutsuList } = useJutsu();

  useEffect(() => {
    async function loadJutsuList() {
      const data = await fetchJutsuList();
      setJutsuList(data);
    }
    loadJutsuList();
  }, [fetchJutsuList]);

  return (
    <div className="jutsu-catalog">
      <h1 className="ninja-font">忍術カタログ</h1>
      <ChakraEffect />
      <JutsuList jutsuList={jutsuList} />
    </div>
  );
}
