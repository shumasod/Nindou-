import type { Scene } from "./types";

export const SCENES: Record<string, Scene> = {
  // ============================================================
  // DAY 1 — NIGHT
  // ============================================================
  scene_tokyo_001: {
    id: "scene_tokyo_001",
    type: "monologue",
    timeOfDay: "night",
    day: 1,
    text: "東京の夜は、思ったよりも静かだった。\n\nアパートの窓から見える光は、誰かの生活だった。\n路地を歩く人影。タクシーのヘッドライト。\n\n誰も、おれのことを知らない。\nそれが、ちょっとだけ、怖かった。",
    choices: [
      {
        id: "c1",
        text: "誰かに連絡する",
        subtext: "— 画面を開いた",
        effect: { loneliness: -2 },
        next: "scene_message_choice",
      },
      {
        id: "c2",
        text: "何もせず寝る",
        subtext: "— スマホを伏せた",
        effect: { loneliness: 2 },
        next: "scene_sleep_001",
      },
    ],
  },

  // ============================================================
  // DAY 1 — MESSAGE CHOICE
  // ============================================================
  scene_message_choice: {
    id: "scene_message_choice",
    type: "message",
    timeOfDay: "night",
    day: 1,
    text: "トーク画面を開く。\n誰に送る？",
    choices: [
      {
        id: "c1",
        text: "美緒",
        subtext: "幼馴染。地元にいる。",
        effect: { honesty: 2, loneliness: -3 },
        characterEffect: { characterId: "mio", distance: -8 },
        next: "scene_mio_first",
      },
      {
        id: "c2",
        text: "蒼井さん",
        subtext: "同じフロアの先輩。まだよく知らない。",
        effect: { empathy: 1, loneliness: -1, ambition: 1 },
        characterEffect: { characterId: "aoi", distance: -5 },
        next: "scene_aoi_late_night",
      },
    ],
  },

  // ============================================================
  // DAY 1 — MIO FIRST MESSAGE
  // ============================================================
  scene_mio_first: {
    id: "scene_mio_first",
    type: "message",
    characterId: "mio",
    timeOfDay: "night",
    day: 1,
    text: "「こんな時間に！どうしたの。東京、寂しいん？笑」\n\nスタンプが一個届いた。熊が手を振っているやつ。\n美緒らしかった。\n\n返事を打とうとして、なんて書けばいいかわからなかった。",
    choices: [
      {
        id: "c1",
        text: "「そうかもな」と正直に返す",
        effect: { honesty: 3, loneliness: -2 },
        characterEffect: { characterId: "mio", distance: -5 },
        next: "scene_mio_honest_reply",
      },
      {
        id: "c2",
        text: "「なんでもない、ただ送ってみた」",
        subtext: "— 嘘をついた",
        effect: { loneliness: 1 },
        next: "scene_work_001",
      },
    ],
  },

  scene_mio_honest_reply: {
    id: "scene_mio_honest_reply",
    type: "message",
    characterId: "mio",
    timeOfDay: "night",
    day: 1,
    text: "「そっか。まあ最初はそうだよ。\n無理しなくていいよ、連絡くれたら返すから」\n\nシンプルな文章だった。\nそれだけで、なんか少し、息ができた気がした。",
    choices: [
      {
        id: "c1",
        text: "「ありがと」と送る",
        effect: { honesty: 1, loneliness: -2 },
        next: "scene_work_001",
      },
    ],
  },

  // ============================================================
  // DAY 1 — AOI LATE NIGHT
  // ============================================================
  scene_aoi_late_night: {
    id: "scene_aoi_late_night",
    type: "message",
    characterId: "aoi",
    timeOfDay: "night",
    day: 1,
    text: "既読がついた。\n\n3分後。\n\n「こんな時間に何してるの」\n\nそれだけだった。",
    choices: [
      {
        id: "c1",
        text: "「眠れなくて」と正直に書く",
        effect: { honesty: 2, empathy: 1 },
        characterEffect: { characterId: "aoi", distance: -5 },
        next: "scene_aoi_late_reply",
      },
      {
        id: "c2",
        text: "「いや、なんでもないです」と誤魔化す",
        effect: { loneliness: 2 },
        next: "scene_work_001",
      },
    ],
  },

  scene_aoi_late_reply: {
    id: "scene_aoi_late_reply",
    type: "message",
    characterId: "aoi",
    timeOfDay: "night",
    day: 1,
    text: "「東京の夜って、慣れるとどこにいても眠れなくなるよ」\n\nそれで会話は終わった。\nなんとも言えない余韻が残った。",
    choices: [
      {
        id: "c1",
        text: "スマホを置く",
        effect: { loneliness: -1 },
        next: "scene_work_001",
      },
    ],
  },

  // ============================================================
  // DAY 1 — SLEEP
  // ============================================================
  scene_sleep_001: {
    id: "scene_sleep_001",
    type: "monologue",
    timeOfDay: "night",
    day: 1,
    text: "電気を消す。\n\n天井の染みを数えた。\n七つ数えたところで、目が覚めているのか、夢を見ているのかわからなくなった。\n\n誰かに電話したかった。\nでも、かけていい時間じゃなかった。",
    choices: [
      {
        id: "c1",
        text: "朝を待つ",
        effect: { loneliness: 1 },
        next: "scene_work_001",
      },
    ],
  },

  // ============================================================
  // DAY 2 — MORNING: FIRST DAY AT WORK
  // ============================================================
  scene_work_001: {
    id: "scene_work_001",
    type: "novel",
    characterId: "kenji",
    timeOfDay: "morning",
    day: 2,
    text: "初出社の日。\nフロアに入ると、田中がPCを見ながら手を上げた。\n\n「あ、来た来た。今日からよろしく。\n座って。資料は後で送る」\n\n——それだけだった。\n歓迎の言葉も、案内もなかった。",
    choices: [
      {
        id: "c1",
        text: "「よろしくお願いします」と丁寧に挨拶する",
        effect: { honesty: 1, ambition: 1 },
        characterEffect: { characterId: "kenji", distance: -5 },
        next: "scene_kenji_lunch",
      },
      {
        id: "c2",
        text: "「……よろしく」と返して、席につく",
        effect: { empathy: 1, loneliness: 1 },
        next: "scene_kenji_lunch",
      },
      {
        id: "c3",
        text: "周囲を見渡す",
        subtext: "— 蒼井さんの席がある",
        effect: { empathy: 2 },
        characterEffect: { characterId: "aoi", distance: -3 },
        next: "scene_kenji_lunch",
      },
      {
        id: "c4",
        text: "隣の席の同期に声をかける",
        subtext: "— 明るそうな子がいる",
        effect: { loneliness: -2 },
        next: "scene_saki_intro",
      },
    ],
  },

  // ============================================================
  // DAY 2 — NOON: LUNCH WITH KENJI
  // ============================================================
  scene_kenji_lunch: {
    id: "scene_kenji_lunch",
    type: "novel",
    characterId: "kenji",
    timeOfDay: "noon",
    day: 2,
    text: "「飯、行くか」\n\nお昼の11時58分。田中が立ち上がった。\n近くのラーメン屋。うるさいくらい換気扇が回っていた。\n\n「仕事、どう？ていうか、なんで東京来たの」",
    choices: [
      {
        id: "c1",
        text: "「なんか、変わりたくて」",
        effect: { ambition: 3, honesty: 1 },
        characterEffect: { characterId: "kenji", distance: -5 },
        next: "scene_kenji_advice_growth",
      },
      {
        id: "c2",
        text: "「給料がよかったので」と正直に言う",
        effect: { honesty: 2 },
        next: "scene_kenji_advice_honest",
      },
      {
        id: "c3",
        text: "「特に理由はないです」",
        effect: { loneliness: 2 },
        next: "scene_kenji_advice_neutral",
      },
    ],
  },

  scene_kenji_advice_growth: {
    id: "scene_kenji_advice_growth",
    type: "novel",
    characterId: "kenji",
    timeOfDay: "noon",
    day: 2,
    text: "田中はラーメンをすすりながら、少し間を置いた。\n\n「変わりたい、か。\nまあ、東京はそれが叶いやすい街だよ。\nでも変わったかどうか、気づくのが一番遅いのは自分なんだよな」\n\nそれだけ言って、また黙って食べた。",
    choices: [
      {
        id: "c1",
        text: "「どういう意味ですか」",
        effect: { empathy: 2, ambition: 1 },
        characterEffect: { characterId: "kenji", distance: -3 },
        next: "scene_aoi_encounter",
      },
      {
        id: "c2",
        text: "黙って聞いておく",
        effect: { honesty: 1 },
        next: "scene_aoi_encounter",
      },
    ],
  },

  scene_kenji_advice_honest: {
    id: "scene_kenji_advice_honest",
    type: "novel",
    characterId: "kenji",
    timeOfDay: "noon",
    day: 2,
    text: "「正直だな。\nまあそれでいい。変な夢持って来るより、現実的な方がここじゃ長続きするから」\n\n田中は特に表情を変えなかった。\nほめているのか、けなしているのか、わからなかった。",
    choices: [
      {
        id: "c1",
        text: "「そうですかね」と答える",
        effect: { ambition: 1 },
        next: "scene_aoi_encounter",
      },
    ],
  },

  scene_kenji_advice_neutral: {
    id: "scene_kenji_advice_neutral",
    type: "novel",
    characterId: "kenji",
    timeOfDay: "noon",
    day: 2,
    text: "田中は少しだけ目を細めた。\n\n「……そういう人間も、まあいるよ」\n\nそれ以上は何も言わなかった。\n換気扇の音だけが続いた。",
    choices: [
      {
        id: "c1",
        text: "ラーメンを食べる",
        effect: { loneliness: 1 },
        next: "scene_aoi_encounter",
      },
    ],
  },

  // ============================================================
  // DAY 2 — EVENING: AOI ENCOUNTER
  // ============================================================
  scene_aoi_encounter: {
    id: "scene_aoi_encounter",
    type: "novel",
    characterId: "aoi",
    timeOfDay: "evening",
    day: 2,
    text: "退社後、コンビニで見知った顔と目が合った。\n\n蒼井さん。\n白いシャツ。缶コーヒーを手に持っている。\n彼女の方が先に気づいていた。\n\nどうする。",
    choices: [
      {
        id: "c1",
        text: "「蒼井さん、お疲れ様です」と声をかける",
        effect: { empathy: 2 },
        characterEffect: { characterId: "aoi", distance: -10 },
        next: "scene_aoi_talk",
        timed: true,
        timerSeconds: 8,
        onTimerExpire: "scene_aoi_missed",
      },
      {
        id: "c2",
        text: "会釈だけして通り過ぎる",
        effect: { loneliness: 2 },
        next: "scene_night_alone",
      },
    ],
  },

  scene_aoi_missed: {
    id: "scene_aoi_missed",
    type: "monologue",
    timeOfDay: "evening",
    day: 2,
    text: "気づいたら、彼女は先に出ていた。\n\n自動ドアが閉まる。\nレジの音だけが残る。\n\n——声をかければよかった。\nそう思ったのは、もう遅かった。",
    choices: [
      {
        id: "c1",
        text: "帰る",
        effect: { loneliness: 3 },
        next: "scene_night_alone",
      },
    ],
  },

  // ============================================================
  // DAY 2 — EVENING: AOI TALK
  // ============================================================
  scene_aoi_talk: {
    id: "scene_aoi_talk",
    type: "novel",
    characterId: "aoi",
    timeOfDay: "evening",
    day: 2,
    text: "コンビニの外、ベンチ。\n蒼井さんが缶コーヒーを開けながら言った。\n\n「東京、慣れた？」\n\n風が少しあった。\n駅のアナウンスが遠くから聞こえた。",
    choices: [
      {
        id: "c1",
        text: "「全然です」と正直に言う",
        effect: { honesty: 3, empathy: 1 },
        characterEffect: { characterId: "aoi", distance: -8 },
        next: "scene_aoi_past",
      },
      {
        id: "c2",
        text: "「まあ、なんとか」と流す",
        effect: { ambition: 1 },
        next: "scene_aoi_cool",
      },
    ],
  },

  scene_aoi_past: {
    id: "scene_aoi_past",
    type: "novel",
    characterId: "aoi",
    timeOfDay: "evening",
    day: 2,
    text: "「正直なんだ」\n\n蒼井さんは少し笑った。\n笑うと目じりが下がった。普段と全然違った。\n\n「わたしも最初そうだったよ。\n慣れるか、慣れないかじゃなくて、\n慣れた自分が嫌いになるかどうか、だと思う」\n\nどこか遠くを見ていた。",
    choices: [
      {
        id: "c1",
        text: "「蒼井さんは、どっちでしたか」",
        effect: { empathy: 3 },
        characterEffect: { characterId: "aoi", distance: -10 },
        next: "scene_aoi_vulnerable",
      },
      {
        id: "c2",
        text: "「……そうですね」と聞いておく",
        effect: { honesty: 1 },
        characterEffect: { characterId: "aoi", distance: -3 },
        next: "scene_night_message",
      },
    ],
  },

  scene_aoi_vulnerable: {
    id: "scene_aoi_vulnerable",
    type: "novel",
    characterId: "aoi",
    timeOfDay: "evening",
    day: 2,
    text: "蒼井さんは少し間を置いた。\n\n「……まだわかんない」\n\nそれだけ言って、缶コーヒーを飲み干した。\n\n「じゃあ、明日ね」\n\n彼女の背中が人混みに消えた。\nもう少し、話したかった気がした。",
    choices: [
      {
        id: "c1",
        text: "帰る",
        effect: { empathy: 1, loneliness: -2 },
        next: "scene_night_message",
      },
    ],
  },

  scene_aoi_cool: {
    id: "scene_aoi_cool",
    type: "novel",
    characterId: "aoi",
    timeOfDay: "evening",
    day: 2,
    text: "「そう」\n\n蒼井さんは缶コーヒーを一口飲んだ。\n\n「まあ、困ったら言って」\n\nそれだけだった。\n親切なんだか、そうじゃないんだか、よくわからない人だった。",
    choices: [
      {
        id: "c1",
        text: "「ありがとうございます」",
        effect: { ambition: 1 },
        next: "scene_night_message",
      },
    ],
  },

  // ============================================================
  // DAY 2 — NIGHT: ALONE / MESSAGE
  // ============================================================
  scene_night_alone: {
    id: "scene_night_alone",
    type: "monologue",
    timeOfDay: "night",
    day: 2,
    text: "アパートに帰った。\nシャワーを浴びて、何もする気になれなかった。\n\n東京はうるさいと思っていたのに、\n部屋の中は静かだった。\n\n静かすぎた。",
    choices: [
      {
        id: "c1",
        text: "スマホを開く",
        effect: { loneliness: 1 },
        next: "scene_night_message",
      },
      {
        id: "c2",
        text: "近所のバーに寄ってみる",
        subtext: "— 看板が気になっていた",
        effect: { loneliness: -1 },
        next: "scene_daichi_bar_enter",
      },
    ],
  },

  scene_night_message: {
    id: "scene_night_message",
    type: "message",
    characterId: "aoi",
    timeOfDay: "night",
    day: 2,
    text: "夜11時。\nスマホを開くと、トーク画面があった。\n\n蒼井さんとのトーク。\n最後のメッセージは昨夜のもの。\n\n「今日は楽しかったです」\nそう打って——",
    choices: [
      {
        id: "c1",
        text: "送る",
        effect: { empathy: 2, honesty: 2 },
        characterEffect: { characterId: "aoi", distance: -8 },
        next: "scene_aoi_reply",
      },
      {
        id: "c2",
        text: "消す",
        subtext: "— 送れなかった",
        effect: { loneliness: 3 },
        unsentMessage: "今日は楽しかったです",
        unsentTo: "aoi",
        next: "scene_mio_call",
      },
    ],
  },

  scene_aoi_reply: {
    id: "scene_aoi_reply",
    type: "message",
    characterId: "aoi",
    timeOfDay: "night",
    day: 2,
    text: "少し待った。\n\n「そう」\n\nたった二文字だった。\nでも既読がついていた。\n\n——それで十分だった気がした。",
    choices: [
      {
        id: "c1",
        text: "おやすみと送る",
        effect: { loneliness: -2, empathy: 1 },
        next: "scene_mio_call",
      },
    ],
  },

  // ============================================================
  // DAY 5 — MIO CALLS
  // ============================================================
  scene_mio_call: {
    id: "scene_mio_call",
    type: "message",
    characterId: "mio",
    timeOfDay: "evening",
    day: 5,
    text: "着信。美緒から。\n\n「久しぶり！最近どう？元気？」\n\n3日ぶりだった。\n彼女の声は、地元の夏の匂いがした。",
    choices: [
      {
        id: "c1",
        text: "「実は、ちょっとしんどい」と話す",
        effect: { honesty: 4, loneliness: -4 },
        characterEffect: { characterId: "mio", distance: -12 },
        next: "scene_mio_deep",
      },
      {
        id: "c2",
        text: "「元気だよ、仕事も慣れてきた」と答える",
        effect: { ambition: 2, loneliness: 2 },
        characterEffect: { characterId: "mio", distance: 5 },
        next: "scene_mio_drift",
      },
      {
        id: "c3",
        text: "電話に出ない",
        subtext: "— 後で折り返す、と思っていた",
        effect: { loneliness: 3, honesty: -1 },
        characterEffect: { characterId: "mio", distance: 10 },
        unsentMessage: "ごめん、出られなかった",
        next: "scene_turning_point",
      },
    ],
  },

  scene_mio_deep: {
    id: "scene_mio_deep",
    type: "message",
    characterId: "mio",
    timeOfDay: "evening",
    day: 5,
    text: "「そっか……\nなんか、東京ってそういうとこだよね。\n帰ってきてもいいんだよ、別に」\n\n少し間があった。\n\n「でも、あなたが行きたかった場所でしょ。\nだから、もう少し頑張ってみてよ。\nわたし、応援してるから」",
    choices: [
      {
        id: "c1",
        text: "「ありがとう」と言う",
        effect: { honesty: 2, loneliness: -3 },
        characterEffect: { characterId: "mio", distance: -5 },
        next: "scene_turning_point",
      },
    ],
  },

  scene_mio_drift: {
    id: "scene_mio_drift",
    type: "message",
    characterId: "mio",
    timeOfDay: "evening",
    day: 5,
    text: "「そっか、よかった！\nじゃあ今度帰ってきたときご飯行こ」\n\n「うん、行こ」\n\nそれだけだった。\n\nスマホを置いた後、\nなんとなく、少し遠くなった気がした。",
    choices: [
      {
        id: "c1",
        text: "続きを考える",
        effect: { loneliness: 2 },
        next: "scene_turning_point",
      },
    ],
  },

  // ============================================================
  // DAY 14 — TURNING POINT
  // ============================================================
  scene_turning_point: {
    id: "scene_turning_point",
    type: "novel",
    timeOfDay: "evening",
    day: 14,
    text: "2週間が経った。\n\n蒼井さんからメッセージが届いた。\n「今夜、飲みに行かない？\n会社近くの小さい店。人数ちょうどいい」\n\n同じタイミングで、美緒からも。\n「ねえ、今週末、東京行っていい？」\n\n——どちらにも、返事をしていなかった。\n\n沙希からも着信。\n凛さんからは静かなメッセージが一言。",
    choices: [
      {
        id: "c1",
        text: "蒼井さんに「行きます」と返す",
        effect: { ambition: 3, empathy: 2 },
        characterEffect: { characterId: "aoi", distance: -15 },
        next: "scene_aoi_date",
      },
      {
        id: "c2",
        text: "美緒に「来ていいよ」と返す",
        effect: { honesty: 4 },
        characterEffect: { characterId: "mio", distance: -15 },
        next: "scene_mio_tokyo",
      },
      {
        id: "c3",
        text: "どちらにも返事をしない",
        subtext: "— 今夜は一人でいたかった",
        effect: { loneliness: 5 },
        unsentMessage: "今夜は会えない",
        unsentTo: "aoi",
        next: "scene_solo_night",
      },
      {
        id: "c4",
        text: "沙希に「一緒に行こう」と返す",
        subtext: "— 同期だから、気楽かもしれない",
        effect: { honesty: 2, empathy: 1 },
        characterEffect: { characterId: "saki", distance: -15 },
        next: "scene_saki_evening",
      },
      {
        id: "c5",
        text: "凛さんに「会えますか」と返す",
        subtext: "— 短い一言が、気になった",
        effect: { empathy: 3, loneliness: -2 },
        characterEffect: { characterId: "rin", distance: -15 },
        next: "scene_rin_message",
      },
    ],
  },

  // ============================================================
  // AOI PATH — DATE NIGHT
  // ============================================================
  scene_aoi_date: {
    id: "scene_aoi_date",
    type: "novel",
    characterId: "aoi",
    timeOfDay: "night",
    day: 14,
    text: "小さなバー。\n蒼井さんはカウンターに先に座っていた。\n\n「来たね」\n\nグラスを傾けながら言った。\n会社とは少し違う顔をしていた。\n\n「ねえ、地元ってどんなとこ？」",
    choices: [
      {
        id: "c1",
        text: "「田舎ですよ。東京と全然違う」",
        effect: { honesty: 2 },
        characterEffect: { characterId: "aoi", distance: -8 },
        next: "scene_aoi_confession",
      },
      {
        id: "c2",
        text: "「普通の場所です。蒼井さんは？」",
        effect: { empathy: 3 },
        characterEffect: { characterId: "aoi", distance: -5 },
        next: "scene_aoi_her_past",
      },
    ],
  },

  scene_aoi_her_past: {
    id: "scene_aoi_her_past",
    type: "novel",
    characterId: "aoi",
    timeOfDay: "night",
    day: 14,
    text: "蒼井さんは少し笑った。\n\n「わたし、ここ生まれ。\n東京以外、住んだことない」\n\n少し間があった。\n\n「羨ましいよ、正直。\n帰る場所がある人って。\n東京ってさ、どこに帰ればいいかわかんなくなるんだよね」",
    choices: [
      {
        id: "c1",
        text: "「……それは、孤独ですね」",
        effect: { empathy: 4, honesty: 2 },
        characterEffect: { characterId: "aoi", distance: -12 },
        next: "scene_aoi_confession",
      },
      {
        id: "c2",
        text: "「東京が好きじゃないんですか」",
        effect: { ambition: 1 },
        next: "scene_aoi_confession",
      },
    ],
  },

  scene_aoi_confession: {
    id: "scene_aoi_confession",
    type: "novel",
    characterId: "aoi",
    timeOfDay: "night",
    day: 14,
    text: "閉店の時間になった。\n外に出ると、空気が冷たかった。\n\n蒼井さんが言った。\n\n「ねえ、あなたって、ちゃんと自分のこと話す人なんだね。\nめずらしい」\n\nそう言われた気がした。\nそう言われた、と気づいたとき、\nもう彼女は歩き出していた。",
    choices: [
      {
        id: "c1",
        text: "「また来ますか、ここ」と聞く",
        effect: { empathy: 2, ambition: 1 },
        characterEffect: { characterId: "aoi", distance: -10 },
        next: "scene_ending_calc",
      },
      {
        id: "c2",
        text: "名前を呼ぼうとして、やめる",
        effect: { loneliness: 3 },
        unsentMessage: "また会えますか",
        unsentTo: "aoi",
        next: "scene_ending_calc",
      },
    ],
  },

  // ============================================================
  // MIO PATH — MIO VISITS TOKYO
  // ============================================================
  scene_mio_tokyo: {
    id: "scene_mio_tokyo",
    type: "novel",
    characterId: "mio",
    timeOfDay: "morning",
    day: 14,
    text: "土曜の朝。\n美緒が新宿の改札から出てきた。\n\n「久しぶり！ちょっと太った？」\n\n開口一番、それだった。\n地元のままだった。",
    choices: [
      {
        id: "c1",
        text: "「太ってない」と笑い返す",
        effect: { honesty: 2, loneliness: -5 },
        characterEffect: { characterId: "mio", distance: -8 },
        next: "scene_mio_walk",
      },
      {
        id: "c2",
        text: "「……そうかもな」と認める",
        effect: { honesty: 3 },
        next: "scene_mio_walk",
      },
    ],
  },

  scene_mio_walk: {
    id: "scene_mio_walk",
    type: "novel",
    characterId: "mio",
    timeOfDay: "noon",
    day: 14,
    text: "一日、東京を歩いた。\n\n美緒は何でも珍しそうに見た。\nランチに並んで、カフェに入って、夕方に川沿いを歩いた。\n\n「ねえ、東京って人いっぱいいるのに、\nなんか寂しそうだね」\n\n彼女は普通に言った。\nおれは返事ができなかった。",
    choices: [
      {
        id: "c1",
        text: "「そうかもな」",
        effect: { honesty: 3, loneliness: -3 },
        characterEffect: { characterId: "mio", distance: -10 },
        next: "scene_mio_goodbye",
      },
      {
        id: "c2",
        text: "「楽しいよ、ちゃんと」",
        effect: { ambition: 1, loneliness: 2 },
        next: "scene_mio_goodbye",
      },
    ],
  },

  scene_mio_goodbye: {
    id: "scene_mio_goodbye",
    type: "novel",
    characterId: "mio",
    timeOfDay: "evening",
    day: 14,
    text: "改札の前。\n美緒が振り返った。\n\n「また来るね。\nていうか、帰ってきてもいいんだよ」\n\n「うん」\n\n「……うん、ってなに」\n\n笑いながら、改札を通っていった。\n\n姿が消えても、しばらく動けなかった。",
    choices: [
      {
        id: "c1",
        text: "家に帰る",
        effect: { loneliness: -5, honesty: 2 },
        next: "scene_ending_calc",
      },
    ],
  },

  // ============================================================
  // NEW CHARACTER: 安藤 沙希 (SAKI) — 同期入社
  // ============================================================

  // --- 導入: Day 2 Morning ---
  scene_saki_intro: {
    id: "scene_saki_intro",
    type: "message",
    characterId: "saki",
    timeOfDay: "morning",
    day: 2,
    text: "隣の席の子が振り返った。\n\n「同期ですよね！安藤沙希といいます。よろしくです！！」\n\n元気すぎるくらいの声だった。\n屈託のない目が、まっすぐこっちを見ていた。\nちょっと、眩しかった。",
    choices: [
      {
        id: "c1",
        text: "「こちらこそ、よろしく」と笑顔で返す",
        effect: { honesty: 1, loneliness: -3 },
        characterEffect: { characterId: "saki", distance: -10 },
        next: "scene_saki_first_chat",
      },
      {
        id: "c2",
        text: "「……よろしく」と短く返す",
        effect: { loneliness: 1 },
        next: "scene_kenji_lunch",
      },
    ],
  },

  scene_saki_first_chat: {
    id: "scene_saki_first_chat",
    type: "message",
    characterId: "saki",
    timeOfDay: "morning",
    day: 2,
    text: "「東京って、まだ全然わかんなくて。\n先輩はどこ出身ですか？\nあ、先輩じゃなかった、同期か。笑」\n\n彼女はまくしたてるように話した。\n——この子は、正直だ。\nそれが少し羨ましかった。",
    choices: [
      {
        id: "c1",
        text: "「怖い、かな。まだ慣れてない」と正直に言う",
        effect: { honesty: 3, loneliness: -4 },
        characterEffect: { characterId: "saki", distance: -8 },
        next: "scene_kenji_lunch",
      },
      {
        id: "c2",
        text: "「なんとかなりそう」と返す",
        effect: { ambition: 1 },
        next: "scene_kenji_lunch",
      },
    ],
  },

  // --- 深化: Day 14 (turning_point c4から) ---
  scene_saki_evening: {
    id: "scene_saki_evening",
    type: "novel",
    characterId: "saki",
    timeOfDay: "evening",
    day: 14,
    text: "沙希が選んだのは、会社から少し離れた小さな居酒屋だった。\n\n「いつもは一人で来るんですけど、誰かと来るのはじめてで」\n\n照れたように言った。\n——意外だった。\nこんなに明るいのに、一人でいたのか。",
    choices: [
      {
        id: "c1",
        text: "「俺も一人が多かった」と言う",
        effect: { honesty: 4, loneliness: -5 },
        characterEffect: { characterId: "saki", distance: -12 },
        next: "scene_saki_true",
      },
      {
        id: "c2",
        text: "「意外だな」と笑う",
        effect: { empathy: 2 },
        characterEffect: { characterId: "saki", distance: -6 },
        next: "scene_saki_light",
      },
    ],
  },

  scene_saki_true: {
    id: "scene_saki_true",
    type: "novel",
    characterId: "saki",
    timeOfDay: "evening",
    day: 14,
    text: "「……そうなんですね」\n\n沙希は少し黙った。\nはじめて、笑顔じゃない顔を見た気がした。\n\n「わたし、元気なキャラでいなきゃって思ってたんです。\n誰かに頼ってるように見せたくなくて。\nでも……それって、結構きつかったな」",
    choices: [
      {
        id: "c1",
        text: "「それ、めちゃくちゃわかる」と言う",
        effect: { honesty: 5, empathy: 3, loneliness: -6 },
        characterEffect: { characterId: "saki", distance: -15 },
        next: "scene_saki_connected",
      },
      {
        id: "c2",
        text: "「大丈夫だったの？」と聞く",
        effect: { empathy: 4 },
        characterEffect: { characterId: "saki", distance: -10 },
        next: "scene_saki_connected",
      },
    ],
  },

  scene_saki_connected: {
    id: "scene_saki_connected",
    type: "novel",
    characterId: "saki",
    timeOfDay: "night",
    day: 14,
    text: "閉店間際まで、話した。\n\n仕事のこと。地元のこと。\n東京に来た理由——正直なやつ。\n\n沙希は最後に言った。\n「誘ってくれてよかった。\n……なんか、久しぶりに素直に話せた気がする」\n\n夜の道を、並んで歩いた。\n少しだけ、東京が広くなった気がした。",
    choices: [
      {
        id: "c1",
        text: "「また話そう」と言う",
        effect: { honesty: 3, loneliness: -8, empathy: 2 },
        characterEffect: { characterId: "saki", distance: -10 },
        next: "scene_ending_calc",
      },
    ],
  },

  scene_saki_light: {
    id: "scene_saki_light",
    type: "novel",
    characterId: "saki",
    timeOfDay: "evening",
    day: 14,
    text: "「意外でしょ〜。実は根暗なんですよ」\n\n笑いながら言った。\nでも目の端が、少しだけ寂しそうだった。\n\nそれ以上は聞かなかった。\n聞けなかった、かもしれない。",
    choices: [
      {
        id: "c1",
        text: "乾杯する",
        effect: { loneliness: -3, empathy: 2 },
        characterEffect: { characterId: "saki", distance: -5 },
        next: "scene_ending_calc",
      },
    ],
  },

  // ============================================================
  // NEW CHARACTER: 橘 凛 (RIN) — デザイン部の先輩
  // ============================================================

  // --- turning_point c5から ---
  scene_rin_message: {
    id: "scene_rin_message",
    type: "message",
    characterId: "rin",
    timeOfDay: "evening",
    day: 14,
    text: "凛さんからのメッセージは、一行だった。\n\n「今夜、少し時間ある？」\n\nそれだけ。\n既読がついてから、返信を打った。",
    choices: [
      {
        id: "c1",
        text: "「あります、どこかで」と返す",
        effect: { empathy: 3, honesty: 1 },
        characterEffect: { characterId: "rin", distance: -10 },
        next: "scene_rin_cafe",
      },
      {
        id: "c2",
        text: "「今日は少し疲れてて…」と断る",
        effect: { loneliness: 4 },
        unsentMessage: "会いたかった",
        unsentTo: "rin",
        next: "scene_ending_calc",
      },
    ],
  },

  scene_rin_cafe: {
    id: "scene_rin_cafe",
    type: "novel",
    characterId: "rin",
    timeOfDay: "night",
    day: 14,
    text: "凛さんが選んだのは、静かなカフェだった。\n\n窓際の席。彼女は先に来ていた。\nコーヒーを両手で持って、外を見ていた。\n\n「来てくれた」\n\n振り返って、そう言った。\n——いつもより、少し柔らかかった。",
    choices: [
      {
        id: "c1",
        text: "「呼んでくれたから」と言う",
        effect: { honesty: 3, empathy: 2 },
        characterEffect: { characterId: "rin", distance: -12 },
        next: "scene_rin_depth",
      },
      {
        id: "c2",
        text: "黙って席に着く",
        effect: { empathy: 1 },
        characterEffect: { characterId: "rin", distance: -5 },
        next: "scene_rin_quiet_end",
      },
    ],
  },

  scene_rin_depth: {
    id: "scene_rin_depth",
    type: "novel",
    characterId: "rin",
    timeOfDay: "night",
    day: 14,
    text: "凛さんはコーヒーを一口飲んだ。\n\n「……実は、会社を辞めようと思ってる」\n\n静かな声だった。\n感情を抑えているのがわかった。\n\n「誰にも言ってない。\nなんか、あなたには言えるかなって思って。\n変な話だけど」",
    choices: [
      {
        id: "c1",
        text: "「なんで辞めようと思ったの」と聞く",
        effect: { empathy: 5, honesty: 2 },
        characterEffect: { characterId: "rin", distance: -18 },
        next: "scene_rin_past",
      },
      {
        id: "c2",
        text: "「それは……辛かったね」と言う",
        effect: { empathy: 4, loneliness: -3 },
        characterEffect: { characterId: "rin", distance: -12 },
        next: "scene_rin_close",
      },
    ],
  },

  scene_rin_past: {
    id: "scene_rin_past",
    type: "novel",
    characterId: "rin",
    timeOfDay: "night",
    day: 14,
    text: "「3年いて、でも何も残ってないんだよね。\nデザインは好きなのに、会社のためにしてると\n途中から嫌いになってきて。\n\n……ここに来てから、やっと気づいた」\n\n窓の外を見ながら言った。\n東京の灯りが、彼女の横顔を照らしていた。",
    choices: [
      {
        id: "c1",
        text: "「好きなことのためなら、辞めていいと思う」と言う",
        effect: { honesty: 4, empathy: 3 },
        characterEffect: { characterId: "rin", distance: -15 },
        next: "scene_rin_close",
      },
      {
        id: "c2",
        text: "「……応援してる」と静かに言う",
        effect: { empathy: 5, loneliness: -4 },
        characterEffect: { characterId: "rin", distance: -10 },
        next: "scene_rin_close",
      },
    ],
  },

  scene_rin_close: {
    id: "scene_rin_close",
    type: "novel",
    characterId: "rin",
    timeOfDay: "night",
    day: 14,
    text: "凛さんは少しだけ微笑んだ。\nはじめて、本当に笑った顔を見た気がした。\n\n「ありがとう。なんか……楽になった」\n\nカフェを出ると、夜風が冷たかった。\n\n「またね」\n\n彼女の背中が、夜の中に消えた。\nこんなに近くに、こんな人がいたのか——と思った。",
    choices: [
      {
        id: "c1",
        text: "帰る",
        effect: { empathy: 5, honesty: 2, loneliness: -10 },
        characterEffect: { characterId: "rin", distance: -10 },
        next: "scene_ending_calc",
      },
    ],
  },

  scene_rin_quiet_end: {
    id: "scene_rin_quiet_end",
    type: "novel",
    characterId: "rin",
    timeOfDay: "night",
    day: 14,
    text: "しばらく、二人でコーヒーを飲んだ。\n\n何を話すでもなく。\nでも、沈黙が苦じゃなかった。\n\n凛さんは帰り際に言った。\n「……来てくれてよかった」\n\n小さな声だった。\n届いたかどうか、自信がなかった。",
    choices: [
      {
        id: "c1",
        text: "帰る",
        effect: { empathy: 3, loneliness: -5 },
        characterEffect: { characterId: "rin", distance: -8 },
        next: "scene_ending_calc",
      },
    ],
  },

  // ============================================================
  // NEW CHARACTER: 松本 大地 (DAICHI) — バーの常連
  // ============================================================

  // --- 導入: Day 2 Night (night_alone c2から) ---
  scene_daichi_bar_enter: {
    id: "scene_daichi_bar_enter",
    type: "monologue",
    timeOfDay: "night",
    day: 2,
    text: "路地の奥に、小さなバーの看板があった。\n\nドアを開けると、木の匂い。\nカウンターに数人。\nマスターが黙ってグラスを磨いていた。\n\n隣の客が、こっちを見た。",
    choices: [
      {
        id: "c1",
        text: "カウンターに座る",
        effect: { loneliness: -2 },
        next: "scene_daichi_first",
      },
    ],
  },

  scene_daichi_first: {
    id: "scene_daichi_first",
    type: "novel",
    characterId: "daichi",
    timeOfDay: "night",
    day: 2,
    text: "「はじめましての顔だ。いらっしゃい」\n\n隣の男が言った。\n店員じゃなかった。\n常連らしかった。\n\n——松本大地。26歳。\n東北出身で、東京には3年前から住んでいる。\n名前を聞いたわけじゃないのに、気づいたら話していた。",
    choices: [
      {
        id: "c1",
        text: "「東京、どうですか」と聞く",
        effect: { empathy: 2, loneliness: -3 },
        characterEffect: { characterId: "daichi", distance: -12 },
        next: "scene_daichi_talk",
      },
      {
        id: "c2",
        text: "「どうも」と会釈して、黙って飲む",
        effect: { loneliness: 1 },
        next: "scene_night_message",
      },
    ],
  },

  scene_daichi_talk: {
    id: "scene_daichi_talk",
    type: "novel",
    characterId: "daichi",
    timeOfDay: "night",
    day: 2,
    text: "「最初の1年が一番しんどくて、\nそっから急に楽しくなった。\n今はまた変わってきたけどな」\n\nグラスを傾けながら、淡々と話した。\n嘘をついている感じがしなかった。\n\n「なんで東京に来たの」",
    choices: [
      {
        id: "c1",
        text: "「変わりたくて」と正直に言う",
        effect: { honesty: 3, loneliness: -4 },
        characterEffect: { characterId: "daichi", distance: -10 },
        next: "scene_daichi_honest",
      },
      {
        id: "c2",
        text: "「なんとなく」と流す",
        effect: { loneliness: 1 },
        characterEffect: { characterId: "daichi", distance: -3 },
        next: "scene_night_message",
      },
    ],
  },

  scene_daichi_honest: {
    id: "scene_daichi_honest",
    type: "novel",
    characterId: "daichi",
    timeOfDay: "night",
    day: 2,
    text: "「そうか。俺も最初それだった。\n\nでも変わったかどうかって、\n自分じゃなかなかわかんないんだよな。\n\n——気づいたら変わってた、みたいなことの方が多い気がする」\n\n大地は笑った。\n深夜のバーの笑顔は、地元の友人みたいだった。",
    choices: [
      {
        id: "c1",
        text: "「また来てもいいですか」と聞く",
        effect: { honesty: 2, loneliness: -5 },
        characterEffect: { characterId: "daichi", distance: -8 },
        next: "scene_night_message",
      },
      {
        id: "c2",
        text: "黙ってグラスを空にする",
        effect: { loneliness: -2 },
        characterEffect: { characterId: "daichi", distance: -3 },
        next: "scene_night_message",
      },
    ],
  },

  // --- 深化: solo_night c2から ---
  scene_daichi_solo_night: {
    id: "scene_daichi_solo_night",
    type: "novel",
    characterId: "daichi",
    timeOfDay: "night",
    day: 14,
    text: "あのバーの前を通った。\n明かりがついていた。\n\n中に入ると、大地がいた。\n\n「また来たか」\n\n特に驚かなかった。\nそれが逆に、落ち着いた。",
    choices: [
      {
        id: "c1",
        text: "「ちょっとしんどくて」と正直に言う",
        effect: { honesty: 4, loneliness: -5 },
        characterEffect: { characterId: "daichi", distance: -15 },
        next: "scene_daichi_wisdom",
      },
      {
        id: "c2",
        text: "「なんとなく」と流す",
        effect: { loneliness: -2 },
        characterEffect: { characterId: "daichi", distance: -5 },
        next: "scene_daichi_quiet_drink",
      },
    ],
  },

  scene_daichi_wisdom: {
    id: "scene_daichi_wisdom",
    type: "novel",
    characterId: "daichi",
    timeOfDay: "night",
    day: 14,
    text: "大地はグラスに酒を注いで、こっちに置いた。\n\n「東京でしんどくなるのって、\n誰かと比べるからだよ、だいたい。\n\nでも比べる相手がいるってことは、\n自分がどこにいるかわかってるってことだから。\nそれって悪くない」\n\n押しつけがましくない言い方だった。",
    choices: [
      {
        id: "c1",
        text: "「……そうかもな」と言う",
        effect: { empathy: 3, honesty: 2, loneliness: -8, ambition: 2 },
        characterEffect: { characterId: "daichi", distance: -12 },
        next: "scene_daichi_morning_walk",
      },
    ],
  },

  scene_daichi_morning_walk: {
    id: "scene_daichi_morning_walk",
    type: "monologue",
    timeOfDay: "night",
    day: 14,
    text: "バーを出ると、夜が明けかけていた。\n\n大地は「またな」と言って、逆方向に歩いていった。\n\nおれは東の空を見た。\nオレンジでも赤でもない、灰色の時間。\n\n——東京に来て、こんな時間を過ごすとは思わなかった。\nでも、悪くなかった。",
    choices: [
      {
        id: "c1",
        text: "家に帰る",
        effect: { loneliness: -10, honesty: 3, empathy: 2 },
        next: "scene_ending_calc",
      },
    ],
  },

  scene_daichi_quiet_drink: {
    id: "scene_daichi_quiet_drink",
    type: "novel",
    characterId: "daichi",
    timeOfDay: "night",
    day: 14,
    text: "二人で、静かに飲んだ。\n\n特に何も話さなかった。\nそれでよかった。\n\n深夜1時に店を出た。\n大地は「またな」と言って、あっさり帰った。\n\n——そのあっさりさが、なんか好きだった。",
    choices: [
      {
        id: "c1",
        text: "家に帰る",
        effect: { loneliness: -5, empathy: 1 },
        characterEffect: { characterId: "daichi", distance: -5 },
        next: "scene_ending_calc",
      },
    ],
  },

  // ============================================================
  // SOLO PATH — ALONE NIGHT
  // ============================================================
  scene_solo_night: {
    id: "scene_solo_night",
    type: "monologue",
    timeOfDay: "night",
    day: 14,
    text: "誰にも返事をしなかった夜。\n\n公園のベンチに座った。\nスケートボードの音が遠くから聞こえた。\n\n——おれはなんのために東京に来たんだろう。\n\n答えは出なかった。\n出なくてよかったのかもしれない。\n\n空が少しだけ明るかった。",
    choices: [
      {
        id: "c1",
        text: "もう少し座っていた",
        effect: { loneliness: 3, empathy: 3, honesty: 3 },
        next: "scene_ending_calc",
      },
      {
        id: "c2",
        text: "あのバーに行く",
        subtext: "— 大地がいるかもしれない",
        effect: { loneliness: -2 },
        next: "scene_daichi_solo_night",
      },
    ],
  },

  // ============================================================
  // ENDING CALCULATION GATEWAY
  // ============================================================
  scene_ending_calc: {
    id: "scene_ending_calc",
    type: "monologue",
    timeOfDay: "night",
    day: 30,
    text: "一ヶ月が経った。\n\n東京の夜は、最初より少しだけ\n静かじゃなくなっていた。\n\nおれは変わったのだろうか。\n変わっていないのだろうか。\n\nわからない。\nでも、それでよかった気がした。",
    choices: [
      {
        id: "c1",
        text: "——END——",
        effect: {},
        next: "__ending__",
      },
    ],
  },
};

export function getScene(id: string): Scene | undefined {
  return SCENES[id];
}

export const FIRST_SCENE_ID = "scene_tokyo_001";
