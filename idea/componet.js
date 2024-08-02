import { useState, useEffect } from 'React';
import { useJutsu } from '../hooks/useJutsu';
import JutsuList from '../components/JutsuList.vue';
import Chakra from '../components/ChakraEffect';

export default function JutsuCatalog() {
  const [jutsuList, setJutsuList] = useState([]);
  const { fetchJutsuList } = useJutsu();

  useEffect(() => {
    async function loadJutsuList() {
      const data = await fetchJutsuList();
      setJutsuList(data);
    }
    loadJutsuList();
  }, []);

  return (
    <div className="jutsu-catalog">
      <h1 className="ninja-font">忍術カカタログ</h1>
      <ChakraEffect />
      <JutsuList jutsuList={jutsuList} />
    </div>
  );
}
