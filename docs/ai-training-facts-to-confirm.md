# AI研修サービスページ — 要確認ファクト一覧

`/services/ai-training` はソフトローンチ（Header/Footer/sitemap 未配線）で先行実装した。
コピー内の数値・固有名詞はすべて仮値で、`src/app/services/ai-training/_components/aiTrainingContent.ts`
内に `// 【要確認】` コメントを付けてある。本ドキュメントと 1:1 対応しているので、
値が確定したら両方（コピーとこの表）を更新すること。

| # | 項目 | 現在の仮値 | aiTrainingContent.ts のキー | 確認先メモ |
|---|------|-----------|------------------------------|-----------|
| 1 | 通常価格 | **確定（2026-09-02）: 税込40万円・1名あたり計10時間** | `PRICING.regular.figure` / `PRICING.regular.note` | — |
| 2 | 助成金名 | **確定（2026-09-02）: 人材開発支援助成金**（バナーで大きく表示） | `PRICING.banner.title` / `PRICING.banner.sub` / `PRICING.subsidized.body` | コース正式名称の表記のみ行3参照 |
| 3 | 助成率・上限 | **確定（2026-09-02）: 最大75%支給** | `PRICING.subsidized.aside` | コース正式名称（事業展開等リスキリング支援コース想定）の表記のみ要確認 |
| 4 | 実質負担額 | **確定（2026-09-02）: 税込10万円**（通常 税込40万円） | `PRICING.regular.figure` / `PRICING.subsidized.figure` | — |
| 5 | 対象企業の条件 | 未記載（FAQで助成金の審査がある旨のみ言及） | `FAQ.items[2].answer`（助成金Q&A）/ `HERO.points[2].body` / page.tsx metadata.description | 中小企業要件・雇用保険適用事業所要件など対象条件を確認し、必要ならFAQに追加。確定時は上記3箇所を要見直し |
| 6 | 最少催行人数 | 目安3名〜（1名からも相談可、という表現） | `FAQ.items[1].answer` | 実際の最少催行人数を確認 |
| 7 | 期間・回数 | **確定（2026-09-02）: 1名あたり計10時間**（回数の割り方は柔軟） | `PRICING.regular.note` / `FAQ.items[3].answer` | — |
| 8 | オンライン/対面 | 両対応（仮） | `FAQ.items[4].answer` | 実施形式の対応範囲を確認 |
| 9 | 講師 | ページ上の講師記載は削除済み（2026-09-02 REASONS 差し替えで「実務経験のある講師」文言が消滅） | — | 講師紹介を載せる場合のみ再検討 |
| 10 | アフターフォロー期間 | 研修終了後30日間 | `REASONS.items[2].body` | 実際のフォロー期間を確認 |

## 反映手順

1. この表の「現在の仮値」列を確定値に更新する。
2. `aiTrainingContent.ts` の対応キーを書き換え、該当行の `// 【要確認】` コメントを削除する。
3. すべての行のコメントが消えたら、このファイルは削除するかアーカイブしてよい。
