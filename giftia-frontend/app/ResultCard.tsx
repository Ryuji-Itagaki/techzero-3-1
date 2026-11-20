// app/ResultCard.tsx — 結果カード（部品）。商品画像・順位・価格・合っている数・タグを出す（案①）
import type { Gift } from "@/lib/api";
// useState：画像を読み込めなかったことをカードごとに覚えておく（NO IMAGE を出すため）
import { useState } from "react";

// selected：画面で選んでいる見た目・使い方・テイストのID。合っているタグだけ色を変える（FR-11）。渡されなければ空
export default function ResultCard({ gift, rank, selected = [] }: { gift: Gift; rank: number; selected?: string[] }) {
  // 画像を読み込めなかったら true にする（NO IMAGE の枠に切り替えるため）
  const [noImage, setNoImage] = useState(false);
  return (
    <div className="card">
      {/* 商品画像（FR-13）：public/images/品番.jpg。読み込めなかったら、同じ大きさの枠に「NO IMAGE」と出す */}
      {noImage ? (
        <div className="thumb noimg">NO IMAGE</div>
      ) : (
        <img
          src={`/images/${gift.id}.jpg`}
          alt={gift.name}
          className="thumb"
          onError={() => setNoImage(true)}
        />
      )}
      <p className="meta">{rank}位・{gift.category}・{gift.brand}</p>
      <h3 className="name">{gift.name}</h3>
      <p className="price">{gift.price.toLocaleString()}円</p>
      <p className="meta">評価{gift.rating}（{gift.reviewCount}件）</p>
      {/* 合っている数（FR-11）：条件を選んで1つ以上合ったときだけ出す */}
      {gift.matchCount ? <p className="match">{gift.matchCount}つの条件に一致</p> : null}
      {/* 付いている見た目・使い方・テイスト（FR-11）：タグがなければ欄ごと出さない */}
      {gift.tasteGroups?.length || gift.tastes?.length ? (
        <div className="tags">
          {/* 選んだ条件と合うタグは "tag hit"（ボルドーの太字＋下線）。これがそのまま推薦理由になる（6.3） */}
          {gift.tasteGroups?.map((t) => <span key={t.id} className={selected.includes(t.id) ? "tag hit" : "tag"}>{t.name}</span>)}
          {gift.tastes?.map((t) => <span key={t.id} className={selected.includes(t.id) ? "tag hit" : "tag"}>{t.name}</span>)}
        </div>
      ) : null}
    </div>
  );
}
