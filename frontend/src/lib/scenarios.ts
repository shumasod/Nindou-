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
    text: "2週間が経った。\n\n蒼井さんからメッセージが届いた。\n「今夜、飲みに行かない？\n会社近くの小さい店。人数ちょうどいい」\n\n同じタイミングで、美緒からも。\n「ねえ、今週末、東京行っていい？」\n\n——どちらにも、返事をしていなかった。",
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
        next: "scene_solo_night",
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
