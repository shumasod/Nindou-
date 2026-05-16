import type { Scene } from "./types";

export const FIRST_SCENE_ID = "scene_tokyo_001";

export const SCENES: Record<string, Scene> = {
  scene_tokyo_001: {
    id: "scene_tokyo_001",
    type: "monologue",
    timeOfDay: "night",
    day: 1,
    text: "東京の夜は、思ったよりも静かだった。\n\n段ボール箱に囲まれた六畳間。窓の外、ビルの灯りが星の代わりに並んでいる。地元とは違う匂い。違う空気。\n\nスマートフォンが鳴った。地元の友達からだ。「着いた？」",
    choices: [
      { id: "c1", text: "すぐに返信する", subtext: "「着いたよ。部屋、思ったより広かった」", effect: { loneliness: -2, honesty: 1 }, characterEffect: { characterId: "mio", distance: -5 }, next: "scene_message_choice" },
      { id: "c2", text: "後で返そうと思って、そのまま寝る", subtext: "明日でいい。疲れた。", effect: { loneliness: 3 }, unsentMessage: "着いたよ。部屋、思ったより広かった", unsentTo: "mio", next: "scene_sleep_001" },
    ],
  },
  scene_message_choice: {
    id: "scene_message_choice", type: "message", characterId: "mio", timeOfDay: "night", day: 1,
    text: "「着いた？寂しくない？急に東京なんて、びっくりしたよ」",
    choices: [
      { id: "c1", text: "「大丈夫。やっていける気がする」", effect: { ambition: 2, loneliness: -1 }, characterEffect: { characterId: "mio", distance: 3 }, next: "scene_sleep_001" },
      { id: "c2", text: "「正直、ちょっと不安かも」", effect: { honesty: 3, loneliness: -3 }, characterEffect: { characterId: "mio", distance: -5 }, next: "scene_sleep_001" },
      { id: "c3", text: "「美緒はどうしてる？」と話題を変える", effect: { empathy: 2 }, characterEffect: { characterId: "mio", distance: -2 }, next: "scene_sleep_001" },
    ],
  },
  scene_sleep_001: {
    id: "scene_sleep_001", type: "monologue", timeOfDay: "night", day: 1,
    text: "電気を消すと、東京の光が薄いカーテンを通して部屋を染めた。\n\n眠れない夜の始まりだった。",
    choices: [{ id: "c1", text: "目を閉じる", effect: {}, next: "scene_work_001" }],
  },
  scene_work_001: {
    id: "scene_work_001", type: "novel", timeOfDay: "morning", day: 2,
    text: "初出社の朝。スーツが少しだけきつくなった気がした。\n\n会社のロビーで待っていると、先輩社員が声をかけてきた。",
    choices: [
      { id: "c1", text: "「よろしくお願いします」と礼儀正しく挨拶する", effect: { ambition: 1 }, characterEffect: { characterId: "kenji", distance: -3 }, next: "scene_kenji_lunch" },
      { id: "c2", text: "緊張で言葉がうまく出ない", effect: { loneliness: 2 }, next: "scene_kenji_lunch" },
    ],
  },
  scene_kenji_lunch: {
    id: "scene_kenji_lunch", type: "novel", characterId: "kenji", timeOfDay: "noon", day: 2,
    text: "「田中健二。まあ、わからないことがあれば聞けよ。でも自分で考えるのが基本な」\n\nランチに誘われた。ドライな人だと思ったが、悪い印象はなかった。",
    choices: [
      { id: "c1", text: "「東京って、慣れますか」と聞く", effect: { empathy: 1, ambition: 1 }, characterEffect: { characterId: "kenji", distance: -5 }, next: "scene_kenji_advice" },
      { id: "c2", text: "仕事の話だけする", effect: { ambition: 2 }, next: "scene_kenji_advice" },
    ],
  },
  scene_kenji_advice: {
    id: "scene_kenji_advice", type: "novel", characterId: "kenji", timeOfDay: "noon", day: 2,
    text: "「慣れるっていうより、慣れたふりが上手くなる感じだな」\n\nケンジは箸を止めずに言った。\n\n「東京で生き残るには、感傷的になりすぎないことだ」",
    choices: [
      { id: "c1", text: "「そういうものですかね」と流す", effect: { ambition: 1 }, next: "scene_evening_aoi" },
      { id: "c2", text: "「でも感じることをやめたくはないです」と正直に言う", effect: { honesty: 3, empathy: 2 }, characterEffect: { characterId: "kenji", distance: -3 }, next: "scene_evening_aoi" },
    ],
  },
  scene_evening_aoi: {
    id: "scene_evening_aoi", type: "novel", timeOfDay: "evening", day: 2,
    text: "退社時間。エレベーターで、同じフロアの女性と鉢合わせた。\n\n広告部の蒼井葵。仕事ができて、クールで、誰とも深く関わらない人。\n\n彼女がこちらを見た。",
    choices: [
      { id: "c1", text: "軽く会釈する", effect: {}, characterEffect: { characterId: "aoi", distance: -2 }, next: "scene_aoi_first" },
      { id: "c2", text: "目をそらす", effect: { loneliness: 1 }, next: "scene_night_alone" },
    ],
  },
  scene_aoi_first: {
    id: "scene_aoi_first", type: "novel", characterId: "aoi", timeOfDay: "evening", day: 2,
    text: "「新しい人？」\n\n低い声で、それだけ言った。返事を待つでもなく、すでに歩き始めている。\n\n「この辺、食べるところ少ないから気をつけて」",
    choices: [
      { id: "c1", text: "「ありがとうございます」と追いかける", effect: { ambition: 1 }, characterEffect: { characterId: "aoi", distance: -5 }, next: "scene_night_reflection" },
      { id: "c2", text: "そのまま見送る", effect: { loneliness: 2 }, next: "scene_night_alone" },
    ],
  },
  scene_night_alone: {
    id: "scene_night_alone", type: "monologue", timeOfDay: "night", day: 2,
    text: "アパートに戻ると、誰もいない部屋がひっそりとしていた。\n\nコンビニの弁当を食べながら、地元の友達のSNSを眺める。みんな、変わらない日常を送っている。",
    choices: [
      { id: "c1", text: "美緒に連絡してみる", effect: { loneliness: -3, honesty: 1 }, characterEffect: { characterId: "mio", distance: -3 }, next: "scene_mio_night_chat" },
      { id: "c2", text: "そのまま眠る", effect: { loneliness: 4 }, next: "scene_day3_morning" },
    ],
  },
  scene_mio_night_chat: {
    id: "scene_mio_night_chat", type: "message", characterId: "mio", timeOfDay: "night", day: 2,
    text: "「今日どうだった？仕事、大変じゃなかった？」\n\n返信が早い。向こうも起きていたらしい。",
    choices: [
      { id: "c1", text: "「思ったよりずっと大変だった」と正直に言う", effect: { honesty: 3, loneliness: -4 }, characterEffect: { characterId: "mio", distance: -8 }, next: "scene_night_reflection" },
      { id: "c2", text: "「まあまあかな。なんとかなりそう」と答える", effect: { ambition: 1, loneliness: -2 }, next: "scene_night_reflection" },
    ],
  },
  scene_night_reflection: {
    id: "scene_night_reflection", type: "monologue", timeOfDay: "night", day: 2,
    text: "布団に入って、今日のことを思い返す。\n\n東京に来てよかったのか、まだわからない。でも、何かが少しずつ動き始めている気がした。",
    choices: [{ id: "c1", text: "眠る", effect: {}, next: "scene_day3_morning" }],
  },
  scene_day3_morning: {
    id: "scene_day3_morning", type: "novel", timeOfDay: "morning", day: 3,
    text: "3日目の朝。少しだけ、電車の乗り方に慣れた気がした。\n\n会社のカフェテリアで、蒼井がひとりでコーヒーを飲んでいた。隣の席が空いている。",
    choices: [
      { id: "c1", text: "「隣、いいですか」と声をかける", timed: true, timerSeconds: 8, onTimerExpire: "scene_aoi_missed", effect: { ambition: 2, empathy: 1 }, characterEffect: { characterId: "aoi", distance: -8 }, next: "scene_aoi_morning_talk" },
      { id: "c2", text: "別の席を選ぶ", effect: { loneliness: 2 }, next: "scene_day3_work" },
    ],
  },
  scene_aoi_missed: {
    id: "scene_aoi_missed", type: "monologue", timeOfDay: "morning", day: 3,
    text: "声をかけようと思った瞬間、葵は立ち上がってしまった。\n\nタイミングというのは、あっという間に過ぎていく。",
    choices: [{ id: "c1", text: "次の機会を待つ", effect: { loneliness: 3 }, next: "scene_day3_work" }],
  },
  scene_aoi_morning_talk: {
    id: "scene_aoi_morning_talk", type: "novel", characterId: "aoi", timeOfDay: "morning", day: 3,
    text: "「どうぞ」\n\n葵は手で席を示した。視線はスマートフォンに向いたまま。\n\n少しの沈黙の後、「仕事、慣れた？」と聞いてきた。",
    choices: [
      { id: "c1", text: "「まだ全然です。でも面白いと思っています」", effect: { ambition: 2, honesty: 1 }, characterEffect: { characterId: "aoi", distance: -5 }, next: "scene_day3_work" },
      { id: "c2", text: "「正直、慣れないことばかりで」と本音を言う", effect: { honesty: 3 }, characterEffect: { characterId: "aoi", distance: -3 }, next: "scene_day3_work" },
    ],
  },
  scene_day3_work: {
    id: "scene_day3_work", type: "novel", timeOfDay: "noon", day: 3,
    text: "午後の会議。プロジェクトの方針について議論になった。\n\n健二が「効率を優先すべきだ」と言う。別の社員は「ユーザー体験を大事にしたい」と反論する。\n\n意見を求められた。",
    choices: [
      { id: "c1", text: "「効率も大事ですが、人の気持ちも無視できないと思います」", effect: { empathy: 3, honesty: 2 }, characterEffect: { characterId: "kenji", distance: 3 }, next: "scene_day3_evening" },
      { id: "c2", text: "「健二さんのおっしゃる通りだと思います」と同調する", effect: { ambition: 2 }, characterEffect: { characterId: "kenji", distance: -3 }, next: "scene_day3_evening" },
      { id: "c3", text: "「まだ全体像が見えていないので、もう少し聞いてもいいですか」", effect: { honesty: 2 }, next: "scene_day3_evening" },
    ],
  },
  scene_day3_evening: {
    id: "scene_day3_evening", type: "monologue", timeOfDay: "evening", day: 3,
    text: "帰り道、渋谷を抜けた。\n\nこんなに人がいるのに、誰も自分のことを知らない。それが解放感なのか、孤独感なのか、まだ判断できなかった。",
    choices: [
      { id: "c1", text: "カフェに寄って、ひとりで考える", effect: { loneliness: 2, honesty: 2 }, next: "scene_night_message" },
      { id: "c2", text: "まっすぐ帰る", effect: {}, next: "scene_night_message" },
    ],
  },
  scene_night_message: {
    id: "scene_night_message", type: "message", characterId: "mio", timeOfDay: "night", day: 3,
    text: "美緒からメッセージが来ていた。\n「最近どう？なんか変わった？」",
    choices: [
      { id: "c1", text: "「少しずつ変わってる気がする」と正直に返す", effect: { honesty: 3, loneliness: -3 }, characterEffect: { characterId: "mio", distance: -5 }, next: "scene_turning_point" },
      { id: "c2", text: "「変わんないよ」と返す", effect: { loneliness: 2 }, next: "scene_turning_point" },
      { id: "c3", text: "「変わりたくて来たんだから」と送りかけて、消す", effect: { loneliness: 4, honesty: -1 }, unsentMessage: "変わりたくて東京に来たんだから。そのくらいわかってほしい", unsentTo: "mio", next: "scene_turning_point" },
    ],
  },
  scene_turning_point: {
    id: "scene_turning_point", type: "monologue", timeOfDay: "night", day: 5,
    text: "5日目。東京のリズムが、少しずつ体に入ってきた。\n\n自分は何のためにここに来たのか。それとも、「何かから逃げた」のか。",
    choices: [
      { id: "c1", text: "「変わりたかったんだ」と自分に言い聞かせる", effect: { ambition: 3, honesty: 2 }, next: "scene_aoi_encounter" },
      { id: "c2", text: "「逃げた部分もあった」と認める", effect: { honesty: 5, loneliness: 2 }, next: "scene_aoi_encounter" },
      { id: "c3", text: "答えを出さずに、今日の仕事に向かう", effect: {}, next: "scene_aoi_encounter" },
    ],
  },
  scene_aoi_encounter: {
    id: "scene_aoi_encounter", type: "novel", characterId: "aoi", timeOfDay: "evening", day: 7,
    text: "金曜の夜、残業をしていると葵だけが残っていた。\n\n「珍しいね、遅くまで」と彼女が言った。\n\n窓の外、東京の夜景が広がっている。",
    choices: [
      { id: "c1", text: "「蒼井さんこそ、よくいるんですか？」", effect: { empathy: 2 }, characterEffect: { characterId: "aoi", distance: -8 }, next: "scene_aoi_night_talk" },
      { id: "c2", text: "「終わらなかったので」と短く答える", effect: { loneliness: 1 }, next: "scene_aoi_night_talk" },
    ],
  },
  scene_aoi_night_talk: {
    id: "scene_aoi_night_talk", type: "novel", characterId: "aoi", timeOfDay: "night", day: 7,
    text: "「地方から来たの？」\n\n答えると、葵は少し間を置いて言った。\n\n「私も、最初の1年は東京が嫌いだった。今は好きかって聞かれたら、わからない。でも、戻れない気がする」",
    choices: [
      { id: "c1", text: "「なんで戻れないんですか」と聞く", effect: { empathy: 3 }, characterEffect: { characterId: "aoi", distance: -10 }, next: "scene_aoi_revelation" },
      { id: "c2", text: "「私も、そうなるかもしれないですね」と言う", effect: { ambition: 2, loneliness: 1 }, characterEffect: { characterId: "aoi", distance: -5 }, next: "scene_aoi_revelation" },
    ],
  },
  scene_aoi_revelation: {
    id: "scene_aoi_revelation", type: "novel", characterId: "aoi", timeOfDay: "night", day: 7,
    text: "「戻ったら、変わった自分を否定することになる気がして」\n\n葵はそこで口を閉じた。\n\nエレベーターが来た。彼女は乗る前に振り返って、「また」とだけ言った。",
    choices: [
      { id: "c1", text: "「また」と返す", effect: { loneliness: -2 }, next: "scene_aoi_confession" },
      { id: "c2", text: "もっと話したかった、と思いながら見送る", effect: { loneliness: 3, empathy: 2 }, unsentMessage: "まだ話したいことがあった", unsentTo: "aoi", next: "scene_aoi_confession" },
    ],
  },
  scene_aoi_confession: {
    id: "scene_aoi_confession", type: "message", characterId: "aoi", timeOfDay: "night", day: 10,
    text: "葵からメッセージが来た。\n「今日、少し気になることがあって」\n\nしばらく沈黙が続いた後、「あなたって、正直な人だね」と送られてきた。",
    choices: [
      { id: "c1", text: "「蒼井さんのことも、正直に言いますか」と送る", effect: { honesty: 4, ambition: 1 }, characterEffect: { characterId: "aoi", distance: -12 }, next: "scene_week2_start" },
      { id: "c2", text: "「そうですか？」と素っ気なく返す", effect: {}, characterEffect: { characterId: "aoi", distance: 3 }, next: "scene_week2_start" },
      { id: "c3", text: "「あなたのことが気になっています」と打って、送信せずに消す", effect: { loneliness: 5, honesty: -2 }, unsentMessage: "蒼井さんのことが気になっています。気になって仕方ない", unsentTo: "aoi", next: "scene_week2_start" },
    ],
  },
  scene_week2_start: {
    id: "scene_week2_start", type: "monologue", timeOfDay: "morning", day: 14,
    text: "2週間が経った。\n\n地元にいた頃の自分と、今の自分。どっちが本当の自分なのか、最近ふと考える。",
    choices: [
      { id: "c1", text: "今の自分でいい、と思う", effect: { ambition: 3 }, next: "scene_mio_call" },
      { id: "c2", text: "地元の自分を忘れていくのが、少し怖い", effect: { honesty: 3, loneliness: 2 }, next: "scene_mio_call" },
      { id: "c3", text: "どちらでもなく、ただ前を向く", effect: { empathy: 2 }, next: "scene_mio_call" },
    ],
  },
  scene_mio_call: {
    id: "scene_mio_call", type: "message", characterId: "mio", timeOfDay: "evening", day: 14,
    text: "美緒から電話が来た。珍しい。\n\n「声聞きたくなって。元気にしてる？」\n\n彼女の声が、妙に懐かしく聞こえた。",
    choices: [
      { id: "c1", text: "「元気だよ。美緒は？」と穏やかに話す", effect: { loneliness: -5, empathy: 2 }, characterEffect: { characterId: "mio", distance: -8 }, next: "scene_final_choice" },
      { id: "c2", text: "「ちょっと今、忙しくて」と短く切る", effect: { ambition: 2, loneliness: 3 }, characterEffect: { characterId: "mio", distance: 8 }, next: "scene_final_choice" },
      { id: "c3", text: "「会いたいな、って少し思ってる」と正直に言う", effect: { honesty: 5, loneliness: -8 }, characterEffect: { characterId: "mio", distance: -15 }, next: "scene_final_choice" },
    ],
  },
  scene_final_choice: {
    id: "scene_final_choice", type: "monologue", timeOfDay: "night", day: 20,
    text: "20日目の夜。\n\n東京に来てから、いろんなことがあった。蒼井葵の言葉。田中健二のドライな現実論。地元に残った美緒の声。\n\n窓の外の東京は、今夜も眠らない。\n\nあなたは、どんな自分になりたいのか。",
    choices: [
      { id: "c1", text: "この街で、もっと高みを目指す", effect: { ambition: 8, loneliness: 3 }, characterEffect: { characterId: "aoi", distance: -5 }, next: "__ending__" },
      { id: "c2", text: "自分らしさを大切に、ここで生きていく", effect: { honesty: 8, empathy: 3 }, next: "__ending__" },
      { id: "c3", text: "地元に帰ることを、真剣に考え始める", effect: { honesty: 6, ambition: -5, loneliness: -5 }, characterEffect: { characterId: "mio", distance: -10 }, next: "__ending__" },
      { id: "c4", text: "まだわからない。もう少し時間が必要だ", effect: { loneliness: 5 }, next: "__ending__" },
    ],
  },
};

export function getScene(id: string): Scene | undefined {
  return SCENES[id];
}
