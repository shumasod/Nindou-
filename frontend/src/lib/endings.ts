import type { GameState, Ending } from "./types";

export const ENDINGS: Record<string, Ending> = {
  ending_city: {
    id: "ending_city",
    title: "都会に染まったエンド",
    subtitle: "「ここで生きていく」",
    text: `あなたは東京に溶け込んだ。

仕事は順調で、蒼井さんとも時々飲む。
地元のことは、たまに思い出す。
でも「帰る」という気持ちは、いつの間にか消えていた。

変わった。
確かに変わった。

でも、何かが少しだけ、軽くなった気もした。`,
    epilogue: `美緒からのメッセージに、返事をするのが遅くなっていた。`,
    bgColor: "#0d1117",
    textColor: "#c0caf5",
  },

  ending_hometown: {
    id: "ending_hometown",
    title: "地元に戻るエンド",
    subtitle: "「ただいま」",
    text: `半年後、あなたは地元に戻った。

東京でしか学べないことがある、とよく言う。
でも、東京でしか失えないものも、あることを知った。

美緒は改札で待っていた。
「遅い」と言いながら、笑っていた。`,
    epilogue: `蒼井さんにはメッセージを送ったが、返事は来なかった。\nそれでよかったと思う。`,
    bgColor: "#1a1209",
    textColor: "#e8d5b0",
  },

  ending_growth: {
    id: "ending_growth",
    title: "誰とも結ばれないが成長したエンド",
    subtitle: "「ひとりで立った日」",
    text: `誰とも深くならなかった。
でも、誰かに依存することも、なかった。

東京という街を、少しだけ理解した。
人の多さと、孤独の深さは、比例することを。

それでも、毎朝駅に向かう足は、
初日よりも少しだけ、軽かった。`,
    epilogue: `未送信のメッセージが、いくつかある。\n送らなくてよかった、と思うものも、\n送ればよかった、と思うものも。`,
    bgColor: "#0f1923",
    textColor: "#a8c7fa",
  },

  ending_broken: {
    id: "ending_broken",
    title: "愛したが壊れたエンド",
    subtitle: "「距離がありすぎた」",
    text: `近づこうとするたびに、何かが壊れた。

蒼井さんとの距離は、縮まらなかった。
美緒とは、少しずつ話さなくなった。
田中先輩の言っていた意味が、
今になってようやくわかった気がした。

孤独は、慣れるものじゃなかった。
ただ、深くなるものだった。`,
    epilogue: `それでも、東京にいる。\n理由は、もうわからなくなっていた。`,
    bgColor: "#1a0a0a",
    textColor: "#f28b82",
  },

  ending_stagnant: {
    id: "ending_stagnant",
    title: "何も変われなかったエンド",
    subtitle: "「そのままの自分」",
    text: `一ヶ月が経った。

仕事は普通。
人間関係は普通。
東京も、思ったより普通だった。

変わりたくて来たのに、
変わり方がわからなかった。

——でも。
そういう人間も、世界にはいる。
田中先輩がそう言っていた。`,
    epilogue: `地元からは離れた。\nでも、どこへ向かっているのか、まだわからない。`,
    bgColor: "#111111",
    textColor: "#999999",
  },
};

export function calculateEnding(state: GameState): string {
  const { empathy, ambition, loneliness, honesty } = state.params;
  const { aoi, mio } = state.characterDistances;
  const scenesVisited = state.visitedScenes.length;

  // 愛したが壊れたエンド: high loneliness AND tried to connect but failed
  if (loneliness >= 55 && scenesVisited >= 8) {
    return "ending_broken";
  }

  // 都会に染まったエンド
  if (ambition >= 65 && empathy <= 40) {
    return "ending_city";
  }

  // 地元に戻るエンド
  if (honesty >= 65 && ambition <= 40) {
    return "ending_hometown";
  }

  // 誰とも結ばれないが成長したエンド: visited many scenes, balanced params
  if (
    scenesVisited >= 10 &&
    Math.abs(empathy - ambition) < 25 &&
    loneliness < 55
  ) {
    return "ending_growth";
  }

  // 何も変われなかったエンド: default
  return "ending_stagnant";
}
