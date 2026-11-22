// app/page.tsx — Giftia 検索画面（案①：左にサイドバー、右に検索結果）
// 要件定義書 ver8 と 11/20 の「ひとまずの方針」に合わせて、2週目の穴埋め版から作り替えた。
// タブ（いまの検索／取引先へのお礼）はなくし、誕生日プレゼントを探す画面1つにした。
"use client"; // ← ブラウザで動く合図。useState や onClick を使う画面に必要

// useEffect：画面を開いたときに1回だけテイストの一覧を読み込むために使う
import { useEffect, useState } from "react";
import ResultCard from "./ResultCard";
// searchBirthdayGifts・SearchResult：誕生日の検索と、その結果の形。fetchTastes・Taste：テイストの一覧をもらう
import { searchBirthdayGifts, fetchTastes, type SearchResult, type Taste } from "@/lib/api";
// サイドバーに並べる選択肢（カテゴリー10種・見た目6種・使い方7種）
import { CATEGORIES, LOOKS, USAGES } from "@/lib/masters";

export default function Home() {
  // ① 状態（変化するデータ）を覚える箱
  const [keyword, setKeyword] = useState("");                       // キーワード（任意）
  const [budget, setBudget] = useState("");                         // 予算（入力欄の文字のまま持つ。任意）
  const [look, setLook] = useState("");                             // 見た目の系統ID（V01〜V06。空＝選んでいない）
  const [usage, setUsage] = useState("");                           // 使い方の系統ID（F01〜F07。空＝選んでいない）
  const [categoryId, setCategoryId] = useState("");                 // カテゴリーID（C01〜C10。空＝すべて）
  const [tastes, setTastes] = useState<string[]>([]);               // テイストID（最大3つ）
  const [result, setResult] = useState<SearchResult | null>(null);  // 検索結果（件数・上位10件・×1.2の件数）
  const [error, setError] = useState("");                           // 予算の入力エラー・APIにつながらないときの文言
  const [tasteList, setTasteList] = useState<Taste[]>([]);          // テイスト101個の一覧（/api/masters から）
  const [tasteError, setTasteError] = useState(false);              // 一覧を読み込めなかったら true

  // 画面を開いたときに1回だけ、テイストの一覧を読み込む（FR-01）
  useEffect(() => {
    fetchTastes().then(setTasteList).catch(() => setTasteError(true));
  }, []);

  // ② 検索の処理（FR-03）：条件をAPIに送り、結果を result に入れる
  // next には「今変えた条件」だけを渡す。✕で条件を外したとき、外したあとの条件ですぐ検索し直すため（FR-04）
  async function runBirthdaySearch(
    next: { keyword?: string; budget?: string; look?: string; usage?: string; categoryId?: string; tastes?: string[] } = {},
  ) {
    const c = { keyword, budget, look, usage, categoryId, tastes, ...next }; // 今の条件に、変えた分だけ上書きする
    // 予算は任意（11/22 MTGで決定）。空なら金額で絞らない。入れたときは1円以上の整数だけ通す（FR-01）
    const yen = c.budget.trim() === "" ? null : Number(c.budget);
    if (yen !== null && (!Number.isInteger(yen) || yen <= 0)) {
      setError("予算は1円以上の数字で入力してください（例：5000）");
      return;
    }
    setError("");
    try {
      setResult(await searchBirthdayGifts({
        keyword: c.keyword, budget: yen, look: c.look, use: c.usage,
        categoryId: c.categoryId, tastes: c.tastes,
      }));
    } catch (err) {
      setResult(null);
      setError(`APIにつながりません：${(err as Error).message}`); // 原因はブラウザの Console に出る
    }
  }

  // ③ 画面（案①：左にサイドバー＝条件をえらぶ、右に検索結果）
  return (
    <main className="page">
      <header className="header"><h1>Giftia</h1></header>
      <h2 className="title">誕生日プレゼントを探す</h2>
      <p className="lead">相手の好きな雰囲気や使い道から、プレゼントを探せます。</p>

      <div className="layout">
        {/* サイドバー：条件をえらぶ（FR-01）。Enter か「この条件で探す」で検索 */}
        <form className="side" onSubmit={(e) => { e.preventDefault(); runBirthdaySearch(); }}>
          <h3>条件をえらぶ</h3>

          {/* キーワード：ほかの条件と組み合わせて絞る（任意） */}
          <label className="lbl">キーワード <span className="opt">任意</span></label>
          <input className="q" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="例：送別 お菓子／ブランド名" />

          {/* シーン：Phase1は誕生日だけ（絞り込みはバック側で固定） */}
          <label className="lbl">シーン</label>
          <select defaultValue="誕生日">
            <option value="誕生日">誕生日</option>
          </select>

          {/* 予算：任意（FR-01） */}
          <label className="lbl">予算 <span className="opt">任意</span></label>
          <div className="yen">
            <input inputMode="numeric" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="5000" /> 円まで
          </div>

          <h4>どんなものを贈りたい？</h4>

          {/* 見た目：1つだけ選べる。もう一度押すと外れる */}
          <p className="lbl">見た目 <span className="opt">任意・1つ</span></p>
          <div className="chips">
            {LOOKS.map((o) => (
              <button type="button" key={o.id} className={look === o.id ? "chip on" : "chip"}
                onClick={() => setLook(look === o.id ? "" : o.id)}>{o.name}</button>
            ))}
          </div>
          {look && <p className="def">{LOOKS.find((o) => o.id === look)?.definition}</p>}

          {/* 使い方：1つだけ選べる。もう一度押すと外れる */}
          <p className="lbl">使い方 <span className="opt">任意・1つ</span></p>
          <div className="chips">
            {USAGES.map((o) => (
              <button type="button" key={o.id} className={usage === o.id ? "chip on" : "chip"}
                onClick={() => setUsage(usage === o.id ? "" : o.id)}>{o.name}</button>
            ))}
          </div>
          {usage && <p className="def">{USAGES.find((o) => o.id === usage)?.definition}</p>}

          {/* カテゴリー：1つだけ選べる。変えたら、選んでいたテイストは外す（テイストはカテゴリーごとのため） */}
          <p className="lbl">カテゴリー <span className="opt">任意・1つ</span></p>
          <div className="chips">
            {CATEGORIES.map((o) => (
              <button type="button" key={o.id} className={categoryId === o.id ? "chip on" : "chip"}
                onClick={() => { setCategoryId(categoryId === o.id ? "" : o.id); setTastes([]); }}>{o.name}</button>
            ))}
          </div>

          {/* テイスト（FR-01）：カテゴリーを選んだときだけ欄を出す。最大3つ。一覧は /api/masters から */}
          {categoryId && (
            <>
              <p className="lbl">
                {CATEGORIES.find((o) => o.id === categoryId)?.name}のテイスト <span className="opt">任意・3つまで</span>
              </p>
              {/* 一覧を読み込めなかったときは、案内だけ出す */}
              {tasteError ? (
                <p className="def">テイストの一覧を読み込めませんでした。</p>
              ) : (
                <div className="chips">
                  {/* 選んだカテゴリーのテイストだけ並べる。押すと選ぶ／外す。3つ選んだら、ほかは押せない */}
                  {tasteList.filter((t) => t.categoryId === categoryId).map((t) => (
                    <button type="button" key={t.id} className={tastes.includes(t.id) ? "chip on" : "chip"}
                      disabled={!tastes.includes(t.id) && tastes.length >= 3}
                      onClick={() => setTastes(tastes.includes(t.id) ? tastes.filter((x) => x !== t.id) : [...tastes, t.id])}>
                      {t.name}
                    </button>
                  ))}
                </div>
              )}
              {/* 選んだテイストの定義文を出す */}
              {tastes.map((id) => {
                const t = tasteList.find((x) => x.id === id);
                return t ? <p key={id} className="def"><b>{t.name}</b>：{t.definition}</p> : null;
              })}
            </>
          )}

          <button type="submit" className="go">この条件で探す</button>
        </form>

        {/* 検索結果：件数と上位10件（FR-03） */}
        <section className="res">
          {/* 選んでいる条件（FR-04）：✕で外すと、検索ボタンなしですぐ検索し直す。予算も✕で外せる */}
          {result && (
            <div className="cond">
              {budget.trim() && (
                <button type="button" className="cchip" onClick={() => { setBudget(""); runBirthdaySearch({ budget: "" }); }}>
                  {budget}円まで ✕</button>
              )}
              {keyword && (
                <button type="button" className="cchip" onClick={() => { setKeyword(""); runBirthdaySearch({ keyword: "" }); }}>
                  「{keyword}」 ✕</button>
              )}
              {look && (
                <button type="button" className="cchip" onClick={() => { setLook(""); runBirthdaySearch({ look: "" }); }}>
                  {LOOKS.find((o) => o.id === look)?.name} ✕</button>
              )}
              {usage && (
                <button type="button" className="cchip" onClick={() => { setUsage(""); runBirthdaySearch({ usage: "" }); }}>
                  {USAGES.find((o) => o.id === usage)?.name} ✕</button>
              )}
              {categoryId && (
                <button type="button" className="cchip" onClick={() => { setCategoryId(""); setTastes([]); runBirthdaySearch({ categoryId: "", tastes: [] }); }}>
                  {CATEGORIES.find((o) => o.id === categoryId)?.name} ✕</button>
              )}
              {/* 選んでいるテイスト（FR-04）：1つずつ✕で外し、外したあとの条件ですぐ検索し直す */}
              {tastes.map((id) => (
                <button type="button" key={id} className="cchip"
                  onClick={() => { const rest = tastes.filter((x) => x !== id); setTastes(rest); runBirthdaySearch({ tastes: rest }); }}>
                  {tasteList.find((t) => t.id === id)?.name ?? id} ✕</button>
              ))}
            </div>
          )}
          {error && <p className="summary">{error}</p>}
          {result && (
            <>
              <p className="summary">条件に合う候補 {result.total} 件</p>
              <div className="grid">
                {/* selected：選んでいる見た目・使い方・テイストのIDを渡す（空のものは除く） */}
                {result.results.map((g, i) => <ResultCard key={g.id} gift={g} rank={i + 1} selected={[look, usage, ...tastes].filter(Boolean)} />)}
              </div>
              {/* 0件のとき：白い画面で終わらせず、条件を外すよう案内する */}
              {result.total === 0 && (
                <p className="summary">条件に合う商品が見つかりませんでした。条件を外すと見つかるかもしれません。</p>
              )}
              {/* 予算×1.2（FR-12）：10位の下に、増える件数を文字で出す。APIが返さないときや0件のときは出さない */}
              {result.widen && result.widen.added > 0 && (
                <p className="wide">
                  {result.widen.budget.toLocaleString()}円まで広げると、候補が{result.widen.added}件増えます
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
