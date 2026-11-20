// lib/api.ts — 画面と FastAPI のやりとり（案①：誕生日の検索と、テイストの一覧）
// 項目名はバック引き継ぎ書のとおり。2週目の searchGifts（タブ用）は、画面を作り替えたので消した。

// 画面が使う商品1つ分の形（API の results の中身）
export type Gift = {
  id: string;          // 商品ID（例 G0001）
  category: string;    // カテゴリ
  brand: string;       // ブランド・店名
  name: string;        // 商品名
  price: number;       // 価格（円）
  rating: number;      // レビューの平均
  reviewCount: number; // レビュー件数
  // ここから下は新しいAPIが返す項目。今のAPIは返さないので「?」（あってもなくてもよい）にしている
  categoryId?: string;  // カテゴリーID（例 C06）
  matchCount?: number;  // 選んだ見た目・使い方・テイストのうち、合っている数
  tasteGroups?: { id: string; segment: string; name: string }[]; // 付いているテイスト系統
  tastes?: { id: string; name: string }[];                      // 付いているテイスト
};

// API の場所。NEXT_PUBLIC_ の値はブラウザに配られる＝秘密は置かない（.env.local に書く）
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ===== 誕生日の検索（案①の画面用） =====

// 画面から渡す検索条件（FR-01）
export type BirthdayCondition = {
  keyword: string;    // キーワード（空なら送らない）
  budget: number;     // 予算（必須）
  look: string;       // 見た目の系統ID（V01〜V06。空なら送らない）
  use: string;        // 使い方の系統ID（F01〜F07。空なら送らない）
  categoryId: string; // カテゴリーID（C01〜C10。空なら送らない）
  tastes: string[];   // テイストID（最大3つ）
};

// APIから届く結果（FR-03・FR-12）
export type SearchResult = {
  total: number;                             // 条件に合う件数
  widen?: { budget: number; added: number }; // 予算×1.2で増える件数（今のAPIは返さない）
  results: Gift[];                           // 上位10件
};

// 条件をAPIに送り、結果をもらう。空の条件は送らない
export async function searchBirthdayGifts(c: BirthdayCondition): Promise<SearchResult> {
  const params = new URLSearchParams();
  params.set("budget", String(c.budget));
  params.set("price_max", String(c.budget)); // 今のAPI用（新しいAPIができたら消す）
  if (c.keyword) params.set("q", c.keyword);
  if (c.look) params.set("look", c.look);
  if (c.use) params.set("use", c.use);
  if (c.categoryId) params.set("category_id", c.categoryId);
  if (c.tastes.length) params.set("tastes", c.tastes.join(","));
  params.set("limit", "10"); // 定義書どおり上位10件

  const res = await fetch(`${API}/api/search?${params.toString()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

// ===== テイストの一覧（FR-01・DR-02）：/api/masters からテイスト101個をもらう =====
// カテゴリーと系統は lib/masters.ts に持っているので、ここでは使わない
export type Taste = {
  id: string;         // テイストID（例 T0510）
  categoryId: string; // どのカテゴリーのテイストか（例 C05）
  name: string;       // テイスト名
  definition: string; // 定義文
};

export async function fetchTastes(): Promise<Taste[]> {
  const res = await fetch(`${API}/api/masters`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`); // 今のAPIには /api/masters がないので、ここでエラーになる
  const data = await res.json();
  return data.tastes;
}
