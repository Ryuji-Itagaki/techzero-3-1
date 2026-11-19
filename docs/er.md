# ER 図（班の DB：giftia_t104）

テーブルの項目とつながりの正（最新版）は、このファイルです。
テーブルや項目を変えたときは、このファイルも同じ PR で直してください。

要件定義書（ver8 5.1）に貼っている画像版は [er_phase1_ver8.png](./er_phase1_ver8.png) です（中身は下の図と同じ）。

```mermaid
erDiagram
    users ||--o{ orders : "注文する"
    users ||--o{ reviews : "書く"
    orders ||--|{ order_items : "含む"
    products ||--o{ order_items : "注文される"
    products ||--o{ reviews : "レビューされる"
    products ||--o{ product_scenes : "シーンタグを持つ"
    products ||--o{ product_facts : "補足情報を持つ"
    categories ||--o{ products : "カテゴリーの商品"
    categories ||--o{ tastes : "カテゴリーのテイスト"
    products ||--o{ product_taste_groups : "テイスト系統を持つ"
    taste_groups ||--o{ product_taste_groups : "付けられる"
    products ||--o{ product_tastes : "テイストを持つ"
    tastes ||--o{ product_tastes : "付けられる"

    users {
        varchar user_id PK
        varchar age_group
        varchar gender
        date registered_at
    }

    orders {
        varchar order_id PK
        varchar user_id FK
        datetime ordered_at
        varchar gift_purpose
        varchar estimated_scene
        varchar recipient_key
        varchar ship_to_type
        int total_amount
    }

    order_items {
        varchar order_id PK, FK
        int line_no PK
        varchar product_id FK
        int quantity
        int unit_price
    }

    products {
        varchar product_id PK
        varchar product_name
        varchar category_id FK "追加（NOT NULL）"
        varchar category "既存・残す ※2"
        int price
        varchar brand
        text description
        varchar size
        int delivery_days
        tinyint gift_wrap
        tinyint message_card
        decimal rating
        int review_count
        int sales_count "注文明細と不一致・調査依頼中"
        int stock
        date registered_at
    }

    product_scenes {
        varchar product_id PK, FK
        varchar scene_tag PK
    }

    product_facts {
        varchar product_id PK, FK
        varchar fact PK
        int value
        varchar source
    }

    categories {
        varchar category_id PK "C01〜C10"
        varchar category_name UK
    }

    taste_groups {
        varchar group_id PK "V01〜V06 / F01〜F07"
        varchar segment "見た目 or 機能"
        varchar display_name
        text definition
    }

    tastes {
        varchar taste_id PK "例 T0510"
        varchar category_id FK
        varchar taste_name
        text definition
    }

    product_taste_groups {
        varchar product_id PK, FK
        varchar group_id PK, FK
    }

    product_tastes {
        varchar product_id PK, FK "※1"
        varchar taste_id PK, FK "※1"
    }

    reviews {
        varchar review_id PK
        varchar product_id FK
        varchar user_id FK
        int rating
        text comment
        date posted_at
    }
```

## 補足

- `product_facts` は、配布の ER 図（データ定義.md）には載っていませんが、班の DB にあるテーブルです。
- 2026-11-20：要件定義書 ver8 5.1 に合わせて、`categories`・`taste_groups`・`tastes`・`product_taste_groups`・`product_tastes` の5テーブルと、`products.category_id` を追加しました。実行した SQL は [db/](../db/README.md) にあります。
- ※1 `product_tastes`：商品とテイストは、カテゴリーが同じものだけ入れる（例：家電の商品には家電のテイストだけ）。一括投入の SQL で、合わない行は入れない。
- ※2 `products.category`：元のデータなので消さずに残す。検索・チェックには `category_id` を使う。
- テイスト系統（`taste_groups`）とテイスト（`tastes`）はひもづけない。系統はカテゴリーをまたいで探すため、テイストはカテゴリーを選んだあとに絞るために使う。
