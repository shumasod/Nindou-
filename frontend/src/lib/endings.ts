import type { Ending, GameState } from "./types";

export const ENDINGS: Record<string, Ending> = {
  // 1. 都会に染まったエンド
  ending_urban: {
    id: "ending_urban",
    title: "都会に染まったエンド",
    subtitle: "東京が、あなたを変えた",
    text: "気づけば、地元に電話しなくなっていた。\n東京のリズムが体に染み込み、昔の自分が遠くなっていく。\nそれは成長なのか、それとも何かを失ったのか——\nあなたはもう、そんなことを考えなくなっていた。",
    epilogue: "1年後、帰省する機会があったが、あなたは断った。\n仕事が忙しかった。本当に、ただそれだけだった。",
    bgColor: "from-slate-900 to-cyan-950",
    textColor: "text-cyan-200",
  },

  // 2. 地元に戻るエンド
  ending_hometown: {
    id: "ending_hometown",
    title: "地元に戻るエンド",
    subtitle: "あなたが本当に欲しかったもの",
    text: "東京での日々を通じて、あなたは気づいた。\n自分が求めていたのは、ここではなかったと。\n正直に生きることの難しさと、その先にある清々しさ。\n帰る場所があることは、弱さではなかった。",
    epilogue: "美緒に連絡すると、すぐに返信が来た。\n「おかえり」——たった3文字が、胸に響いた。",
    bgColor: "from-slate-900 to-rose-950",
    textColor: "text-rose-200",
  },

  // 3. 愛したが壊れたエンド
  ending_broken: {
    id: "ending_broken",
    title: "愛したが壊れたエンド",
    subtitle: "近づきすぎた距離",
    text: "多くのものに触れ、多くのものを感じた。\nでも、抱えすぎた孤独は、やがて亀裂になった。\n誰かを深く愛そうとするほど、うまく伝えられなくなる。\n壊れたものの中にも、確かに美しい時間があった。",
    epilogue: "あの夜送れなかったメッセージを、あなたはまだ覚えている。",
    bgColor: "from-slate-900 to-purple-950",
    textColor: "text-purple-200",
  },

  // 4. 誰とも結ばれないが成長したエンド
  ending_growth: {
    id: "ending_growth",
    title: "成長したエンド",
    subtitle: "変わることを選んだ",
    text: "誰かと結ばれることを選ばなかった。\nでもそれは、逃げではなかった。\nバランスを保ちながら、少しずつ自分を変えていく——\nその静かな選択が、あなたを前に進ませた。",
    epilogue: "東京の夜は相変わらず賑やかだ。\nでも今は、その喧騒がどこか心地よい。",
    bgColor: "from-slate-900 to-emerald-950",
    textColor: "text-emerald-200",
  },

  // 5. 何も変われなかったエンド（デフォルト）
  ending_stagnant: {
    id: "ending_stagnant",
    title: "何も変われなかったエンド",
    subtitle: "東京は、ただ過ぎていった",
    text: "1年が経った。\n東京に来る前と、何が変わっただろう。\n仕事は続いている。生活も変わらない。\n何かを変えようとした夜のことを、もう思い出せない。",
    epilogue: "あなたは今日も、いつもの路線に乗る。\n窓に映る自分の顔を、少しだけ見つめた。",
    bgColor: "from-slate-900 to-gray-900",
    textColor: "text-gray-300",
  },
};

export function calculateEnding(state: GameState): string {
  const { empathy, ambition, loneliness, honesty } = state.params;
  const sceneCount = state.visitedScenes.length;

  // 1. 都会に染まったエンド: ambition高 & empathy低
  if (ambition >= 65 && empathy <= 40) {
    return "ending_urban";
  }

  // 2. 地元に戻るエンド: honesty高 & ambition低
  if (honesty >= 65 && ambition <= 40) {
    return "ending_hometown";
  }

  // 3. 愛したが壊れたエンド: loneliness高 & 多くのシーンを経験
  if (loneliness >= 55 && sceneCount >= 12) {
    return "ending_broken";
  }

  // 4. 成長したエンド: バランス型 & 孤独低め
  const isBalanced =
    empathy >= 45 && empathy <= 70 &&
    honesty >= 45 && honesty <= 70 &&
    ambition >= 35 && ambition <= 65;
  if (isBalanced && loneliness <= 45) {
    return "ending_growth";
  }

  // 5. デフォルト
  return "ending_stagnant";
}
