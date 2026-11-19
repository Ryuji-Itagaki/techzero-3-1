# db/ 班のDB（giftia_t104）に実行したSQL

ER図（要件定義書 ver8 5.1）に合わせて、班のDBに表を足したときのSQLです。
2026-11-20 に、上から順に実行済みです。

| 順番 | ファイル | やったこと |
| --- | --- | --- |
| 1 | `giftia_er_update.sql` | categories を作り、products に category_id を足して埋めた（NULL 0件）。taste_groups・tastes・product_taste_groups・product_tastes を作った |
| 2 | `step4_tastes.sql` | tastes（テイスト101個）の中身。`giftia_er_update.sql` の STEP 4 と同じもの |
| 3 | `step6_tags.sql` | スプシ raw タブのタグを 1タグ＝1行 に分けて入れた（product_taste_groups 9,512行、product_tastes 5,229行） |

## 入れるときに直したこと

- 見た目の「すっきり系」は「シンプル系」（V02）として入れた
- 「香りを楽しむ（…）」のようなかっこ書きは外して、tastes の名前に合わせた
- 商品とテイストのカテゴリーが合わない行は入れない（ER図 ※1）。実際は0件だった

## 番号の決め方

- カテゴリー：C01 生活雑貨、C02 食品、C03 コスメ、C04 飲料、C05 家電、C06 インテリア、C07 ビジネス小物、C08 フラワー、C09 酒類、C10 カタログギフト
- テイスト：T ＋ カテゴリー番号2桁 ＋ 連番2桁（例：家電の「遊び心」= T0510）
- テイスト系統：V01〜V06（見た目）、F01〜F07（機能＝使い方）
