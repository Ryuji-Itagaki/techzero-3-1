# main.py — Giftia 検索API（Phase1：友人への誕生日）
# 画面（Next.js）から呼ばれる「窓口」。条件を受け取り、班のDBを検索して、結果を JSON で返す。
# 起動：uvicorn main:app --reload
# 確認：http://localhost:8000/docs（Swagger UI。ブラウザから API を試せる）
#
# 元にしたもの：岡田さんの「バックエンド開発 引き継ぎ書（フロント改修分）」11/20、要件定義書 ver8
#   /api/search  … FR-03（絞り込みと並び順）・FR-11（付いているタグを返す）・FR-12（予算×1.2の件数）
#   /api/masters … FR-01（条件パネルの選択肢）

import os
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from database import fetch_all, get_connection

load_dotenv()  # .env を読む（DB の接続情報・CORS の許可）

app = FastAPI(title="Giftia Search API（Phase1：誕生日）")

# ── CORS ───────────────────────────────────────
# 画面（http://localhost:3000）と API（http://localhost:8000）は別のアプリ＝オリジンが違う。
# 許可する画面の URL は .env の CORS_ORIGINS に書く（カンマ区切りで複数可）。空なら何も許可しない。
origins = [o.strip() for o in os.environ.get("CORS_ORIGINS", "").split(",") if o.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["GET"], allow_headers=["*"])

SCENE = "誕生日"  # Phase1 はシーンを受け取らず、バック側で「誕生日」に固定する
MAX_TASTES = 3    # テイストは最大3つ（FR-01）


@app.get("/api/health")
def health():
    """つながっているかの確認。どの DB に何件の商品があるか"""
    row = fetch_all("SELECT DATABASE() AS db, COUNT(*) AS products FROM products")[0]
    return {"status": "ok", "db": row["db"], "products": row["products"]}


@app.get("/api/search")
def search(
    budget: Optional[int] = Query(default=None, ge=1, description="予算（任意）。入れたときだけ price <= budget"),
    look: str = Query(default="", description="見た目の系統IDを1つ（V01〜V06）"),
    use: str = Query(default="", description="使い方の系統IDを1つ（F01〜F07）"),
    category_id: str = Query(default="", description="カテゴリーIDを1つ（C01〜C10）"),
    tastes: str = Query(default="", description="テイストIDをカンマ区切りで最大3つ（例 T0608,T0609）"),
    q: str = Query(default="", description="キーワード（空白区切りで複数。すべてを含む商品）"),
    # 11/23 MTG：1ページの件数を10件→20件に変更（画面は limit=20 を送る）
    limit: int = Query(default=20, ge=1, le=100, description="返す件数（1ページ分）"),
    # 11/23 MTG：ページ送り（「次へ」）のために追加。何件目から返すか（0＝1件目から、20＝21件目から）
    offset: int = Query(default=0, ge=0, description="飛ばす件数（ページ送り用。0なら先頭から）"),
):
    """誕生日タグ・在庫あり（予算を入れたときは予算以下）の商品から、条件に合う上位 limit 件と件数を返す"""
    groups = [g for g in (look, use) if g]                       # 選んだ系統（見た目・使い方）
    taste_ids = [t.strip() for t in tastes.split(",") if t.strip()]  # 選んだテイスト
    if len(taste_ids) > MAX_TASTES:
        raise HTTPException(status_code=422, detail=f"テイストは{MAX_TASTES}つまで")

    # ① 合っている数（match_count）を計算する式。何も選ばなければ 0
    #    ＝ 選んだ系統のうち付いている数 ＋ 選んだテイストのうち付いている数
    parts, mparams = [], []
    if groups:
        ph = ",".join(["%s"] * len(groups))  # f文字列で組むのは %s の数だけ（値は params で渡す）
        parts.append(
            f"(SELECT COUNT(*) FROM product_taste_groups g "
            f"WHERE g.product_id = p.product_id AND g.group_id IN ({ph}))"
        )
        mparams += groups
    if taste_ids:
        ph = ",".join(["%s"] * len(taste_ids))
        parts.append(
            f"(SELECT COUNT(*) FROM product_tastes t "
            f"WHERE t.product_id = p.product_id AND t.taste_id IN ({ph}))"
        )
        mparams += taste_ids
    match_sql = " + ".join(parts) if parts else "0"

    # ② いつもかける条件（在庫あり・誕生日タグあり）＋ 選ばれた条件
    where = [
        "p.stock > 0",
        "EXISTS (SELECT 1 FROM product_scenes s WHERE s.product_id = p.product_id AND s.scene_tag = %s)",
    ]
    wparams = [SCENE]
    if category_id:
        where.append("p.category_id = %s")
        wparams.append(category_id)
    for word in q.split():  # キーワードは1語ずつ、商品名・ブランド・説明文のどれかに含む（AND）
        where.append("(p.product_name LIKE %s OR p.brand LIKE %s OR p.description LIKE %s)")
        wparams += [f"%{word}%"] * 3

    def base(price_sql: str) -> str:
        """商品ごとに合っている数を出し、系統・テイストを選んだときは 1 以上だけ残す（OR）"""
        inner = f"""SELECT p.product_id, p.category, p.category_id, p.brand, p.product_name,
                           p.price, p.rating, p.review_count, p.sales_count,
                           ({match_sql}) AS match_count
                    FROM products p
                    WHERE {" AND ".join(where)} AND {price_sql}"""
        keep = "WHERE x.match_count > 0" if parts else ""
        return f"FROM ({inner}) x {keep}"

    # 予算は任意（11/22 MTGで決定）。入れたときだけ金額で絞る
    if budget is None:
        in_budget = base("1 = 1")  # 予算なし＝金額で絞らない（1 = 1 は「いつも正しい」条件）
        p_in = (*mparams, *wparams)
    else:
        in_budget = base("p.price <= %s")
        p_in = (*mparams, *wparams, budget)

    # DBへの接続は1回だけ作って、5本のSQLを続けて流す（毎回つなぐと遅いため）
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            # 件数（1ページ分に切る前の、全部の件数。画面の「全○ページ」の計算にも使う）
            cur.execute(f"SELECT COUNT(*) AS n {in_budget}", p_in)
            total = cur.fetchone()["n"]

            # 上位 limit 件。並び順：合っている数 → 売れた数 → 商品IDの大きい順＝登録の新しい順（FR-03、11/23 MTG）
            # 11/23 MTG：OFFSET を追加。offset 件を飛ばしてから limit 件を返す（2ページ目は offset=20）
            # 並び順の最後に商品IDがあるので、ページをまたいでも同じ商品が二重に出ない
            cur.execute(
                f"SELECT x.* {in_budget} "
                f"ORDER BY x.match_count DESC, x.sales_count DESC, x.product_id DESC LIMIT %s OFFSET %s",
                (*p_in, limit, offset),
            )
            rows = cur.fetchall()

            # FR-12：予算を×1.2にすると増える件数（budget < price <= wide_budget）。予算なしなら数えない
            widen = None
            if budget is not None:
                wide_budget = budget * 12 // 10  # 予算×1.2（小数は切り捨て）
                cur.execute(
                    f"SELECT COUNT(*) AS n {base('p.price > %s AND p.price <= %s')}",
                    (*mparams, *wparams, budget, wide_budget),
                )
                widen = {"budget": wide_budget, "added": cur.fetchone()["n"]}

            # FR-11：上位の商品に付いている系統・テイストをまとめて取る（0件なら流さない）
            tags_g, tags_t = {}, {}
            ids = [r["product_id"] for r in rows]
            if ids:
                ph = ",".join(["%s"] * len(ids))
                cur.execute(
                    f"""SELECT ptg.product_id, tg.group_id, tg.segment, tg.display_name
                        FROM product_taste_groups ptg
                        JOIN taste_groups tg ON tg.group_id = ptg.group_id
                        WHERE ptg.product_id IN ({ph})
                        ORDER BY tg.group_id""",
                    tuple(ids),
                )
                for r in cur.fetchall():
                    tags_g.setdefault(r["product_id"], []).append(
                        {"id": r["group_id"], "segment": r["segment"], "name": r["display_name"]}
                    )
                cur.execute(
                    f"""SELECT pt.product_id, t.taste_id, t.taste_name
                        FROM product_tastes pt
                        JOIN tastes t ON t.taste_id = pt.taste_id
                        WHERE pt.product_id IN ({ph})
                        ORDER BY t.taste_id""",
                    tuple(ids),
                )
                for r in cur.fetchall():
                    tags_t.setdefault(r["product_id"], []).append(
                        {"id": r["taste_id"], "name": r["taste_name"]}
                    )
    finally:
        conn.close()

    results = []
    for r in rows:
        gift = to_gift(r)
        gift["matchCount"] = int(r["match_count"])
        gift["tasteGroups"] = tags_g.get(r["product_id"], [])  # 付いていなければ空の配列
        gift["tastes"] = tags_t.get(r["product_id"], [])
        results.append(gift)

    return {
        "total": total,
        "widen": widen,  # 予算なしなら null
        "results": results,
    }


@app.get("/api/masters")
def masters():
    """条件パネルに並べる選択肢（カテゴリー・テイスト系統・テイスト）を定義文ごと返す"""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT category_id, category_name FROM categories ORDER BY category_id")
            categories = [{"id": r["category_id"], "name": r["category_name"]} for r in cur.fetchall()]

            cur.execute(
                "SELECT group_id, segment, display_name, definition FROM taste_groups ORDER BY group_id"
            )
            groups = [
                {"id": r["group_id"], "segment": r["segment"], "name": r["display_name"],
                 "definition": r["definition"]}
                for r in cur.fetchall()
            ]

            cur.execute(
                "SELECT taste_id, category_id, taste_name, definition FROM tastes ORDER BY taste_id"
            )
            taste_list = [
                {"id": r["taste_id"], "categoryId": r["category_id"], "name": r["taste_name"],
                 "definition": r["definition"]}
                for r in cur.fetchall()
            ]
    finally:
        conn.close()
    return {"categories": categories, "tasteGroups": groups, "tastes": taste_list}


def to_gift(r: dict) -> dict:
    """DB の列名 → 画面（lib/api.ts の Gift 型）の項目名。今ある項目の名前は変えない"""
    return {
        "id": r["product_id"],
        "category": r["category"],
        "categoryId": r["category_id"],
        "brand": r["brand"],
        "name": r["product_name"],
        "price": r["price"],
        "rating": float(r["rating"]) if r["rating"] is not None else 0,  # レビューなしは 0
        "reviewCount": r["review_count"],
    }
