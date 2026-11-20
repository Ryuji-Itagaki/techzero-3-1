    // lib/masters.ts — 条件パネルに並べる選択肢（要件定義書 ver8 5.2、班のDBの categories・taste_groups と同じ中身）
// カテゴリー10種とテイスト系統13種は数が少なくめったに変わらないので、画面側にも持っておく。
// テイスト101個は /api/masters からもらう（バック引き継ぎ書）。

export type Option = { id: string; name: string; definition?: string };

// カテゴリー（categories）
export const CATEGORIES: Option[] = [
  { id: "C01", name: "生活雑貨" },
  { id: "C02", name: "食品" },
  { id: "C03", name: "コスメ" },
  { id: "C04", name: "飲料" },
  { id: "C05", name: "家電" },
  { id: "C06", name: "インテリア" },
  { id: "C07", name: "ビジネス小物" },
  { id: "C08", name: "フラワー" },
  { id: "C09", name: "酒類" },
  { id: "C10", name: "カタログギフト" },
];

// 見た目の系統（taste_groups の segment＝見た目）
export const LOOKS: Option[] = [
  { id: "V01", name: "かわいい系", definition: "色や形がかわいらしく、やわらかい雰囲気がある" },
  { id: "V02", name: "シンプル系", definition: "飾りが少なく、色も形もすっきりしている。見た目に目立った特徴がない落ち着いたものも含む" },
  { id: "V03", name: "ナチュラル系", definition: "木・綿・陶器など素材の感じや、温かみのある色を活かしている" },
  { id: "V04", name: "上品系", definition: "落ち着いていて品があり、改まった場でも渡せる" },
  { id: "V05", name: "かっこいい系", definition: "シャープ、無骨、スタイリッシュなど、かっこよさが前に出ている" },
  { id: "V06", name: "おもしろ系", definition: "形や仕掛け、味に遊び心があり、話のネタになる" },
];

// 使い方の系統（taste_groups の segment＝機能。画面では「使い方」と出す）
export const USAGES: Option[] = [
  { id: "F01", name: "毎日使える", definition: "日常の道具として、くり返し使う" },
  { id: "F02", name: "みんなで楽しめる", definition: "家族や職場で分けられる（個包装、詰め合わせ、飲み比べ）" },
  { id: "F03", name: "ほっとひと息", definition: "香り、お茶、お風呂など、くつろぐ時間に使う" },
  { id: "F04", name: "体にやさしい", definition: "無添加、オーガニック、肌にやさしい素材など、体への気づかいがある" },
  { id: "F05", name: "長く楽しめる", definition: "すぐになくならず、長く使える・飾れる（プリザーブド、日持ちするもの）" },
  { id: "F06", name: "もらって困らない", definition: "好き嫌いや使う習慣が分かれにくい日用品。香りもの、甘いもの、飲みもの、花は含めない" },
  { id: "F07", name: "飾って楽しむ", definition: "部屋に置いたり飾ったりして、見て楽しむ。花はすべて含む" },
];