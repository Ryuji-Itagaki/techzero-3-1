# Giftia ギフト検索アプリ（Tech0 Step3-1）

送り先の好みはなんとなく分かっているのに、Giftia の中で「この一品」にたどり着けない。
その課題を、テイストやシーンで探せる検索機能で解決するアプリです。

- 要求・要件の詳細は、要件定義書を参照してください
- AI を使うときのルールは [AGENTS.md](./AGENTS.md) を参照してください

---

## フォルダ構成

| フォルダ    | 中身                             | 起動 URL                   |
| ----------- | -------------------------------- | -------------------------- |
| `frontend/` | 画面（Next.js）                  | http://localhost:3000      |
| `backend/`  | API（FastAPI）。班の DB につなぐ | http://localhost:8000/docs |

<!-- TODO: frontend のフォルダ名が違う場合は直す -->

---

## セットアップと起動

ターミナルを **2 つ** 使います（backend 用と frontend 用）。

### 1. 接続情報（.env）を用意する

接続情報は GitHub には置いていません。
[【取扱注意】Giftia\_接続情報（.env）](https://docs.google.com/document/d/1xi8u3Op3vn9xVU4TRaxMuvZeoA_s53JAyntQz9SEY60/edit?usp=sharing)（班員と講師のみ閲覧可）から受け取ってください。

**backend/.env**
`backend/.env.example` をコピーして `.env` という名前にし、接続情報を入れます。

| 項目                                                          | 書くこと                                                      |
| ------------------------------------------------------------- | ------------------------------------------------------------- |
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | 受け取った接続情報（Workbench と同じ 5 つ）                   |
| `DB_SSL_CA`                                                   | **自分の PC** に置いた SSL 証明書のフルパス（人によって違う） |
| `CORS_ORIGINS`                                                | `http://localhost:3000`                                       |

**frontend/.env.local**
frontend フォルダの直下（`package.json` と同じ場所）に作り、1 行だけ書きます。

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 2. backend（FastAPI）を起動する

```bash
cd backend
python -m venv .venv

# 仮想環境を有効にする
.venv\Scripts\activate          # Windows
source .venv/bin/activate       # Mac

python -X utf8 -m pip install -r requirements.txt
python -m uvicorn main:app --reload
```

http://localhost:8000/docs を開き、`GET /api/health` → Try it out → Execute で、DB 名と件数が返れば OK。

### 3. frontend（Next.js）を起動する

```bash
cd frontend
npm install
npm run dev
```

http://localhost:3000 を開き、画面から検索できれば OK。

### つまずいたら

| 症状                                                       | 対処                                                            |
| ---------------------------------------------------------- | --------------------------------------------------------------- |
| `pip.exe` がブロックされる（アプリケーション制御ポリシー） | `pip` ではなく `python -m pip` を使う                           |
| `UnicodeDecodeError: 'cp932'`                              | `python -X utf8 -m pip ...` のように `-X utf8` を付ける         |
| `.env` が読まれない                                        | `.env.txt` になっていないか確認（拡張子を表示する設定にする）   |
| ターミナルを開き直したら動かない                           | `.venv\Scripts\activate` をもう一度実行する                     |
| 画面から検索するとエラー（CORS）                           | `backend/.env` の `CORS_ORIGINS` を確認し、backend を再起動する |
| ポートが使用中                                             | `--port 8001` や `npm run dev -- --port 3001` で起動する        |
| pull したら動かない                                        | `pip install` / `npm install` をやり直す                        |

---

## 開発ルール

### 役割

| 役割                 | 担当                     |
| -------------------- | ------------------------ |
| リポジトリのリーダー | 板垣                     |
| merge する人         | Approve した人（承認者） |

### 流れ（GitHub Flow）

1. `main` を pull して、作業ブランチを作る
2. ファイルを追加・変更する
3. commit → 作業ブランチを push
4. PR を出す
5. 本人以外がレビューして Approve
6. 承認者が merge → 作業ブランチを削除
7. 全員が `main` を pull して、手元で動くか確かめる

`main` に直接 push しない。

### ブランチ名

形は **`種類/内容`** です。

| 種類        | 使うとき                                   | 例                                  |
| ----------- | ------------------------------------------ | ----------------------------------- |
| `feature/`  | 新しい機能を足す                           | `feature/scene-filter`              |
| `fix/`      | 不具合や間違いを直す                       | `fix/backend-dotfiles`              |
| `docs/`     | README や AGENTS.md などの文書だけを変える | `docs/agents-md`, `docs/team-rules` |
| `refactor/` | 動きは変えずに、コードを整理する           | `refactor/search-query`             |
| `style/`    | 見た目（CSS）だけを変える                  | `style/result-card`                 |
| `test/`     | テストを足す・直す                         | `test/search-api`                   |
| `chore/`    | 設定や部品の更新など、雑務                 | `chore/update-requirements`         |
| `hotfix/`   | 本番で起きた問題を急いで直す               | `hotfix/cors-origin`                |

- 英小文字と `-`（ハイフン）でつなぐ（日本語やスペースは使わない）
- 内容は、何をするか一目で分かる短い英語にする
- 1 つのブランチでは、1 つのことだけをする（AGENTS.md と README は別のブランチにすると、レビューしやすい）

### commit メッセージ

```
◯◯をする (#1)
```

- 何をしたかを日本語で短く書く
- Issue がある場合は、最後に `(#Issue番号)` を付ける（GitHub 上で Issue とつながる）

### PR 本文

```
## 何を
## なぜ
## 確認手順

Closes #1
```

- 自分の言葉で書く
- Issue がある場合は `Closes #Issue番号` を書く（merge すると Issue が自動で閉じる）

### レビューの最低ライン（これを満たさなければ Approve しない）

1. **手元で動く**：PR のブランチを pull して、画面と API が起動し、検索できる
2. **秘密が入っていない**：GitHub の「Files changed」タブで、`.env` やパスワードが含まれていない
3. **説明がある**：PR に「何を・なぜ・どう確認したか」が書いてある
4. **1 つの目的に絞られている**：関係ない変更が混ざっていない
5. **分からないまま Approve しない**：分からない箇所は、コメントで質問する

**できれば（あとで足していく）**

- 要件定義書の要件 ID（FR-xx など）と紐づいている
- AI が書いたコードを、PR を出した本人が説明できる

※ この最低ラインは、進めながら班で更新していきます。

### やってはいけないこと

- `.env` を commit / push しない（`.env.example` にも本物の値を書かない）
- `.env` の中身を AI に見せない・貼らない
- `main` に直接 push しない

`.env` を commit してしまったら、すぐリーダーと講師に連絡してください（削除の commit をしても履歴には残ります）。
