# .htaccess — 旧サイト (さくら) 用・これをまるごとコピーする

**設置場所:** `/home/gift-original/www/gift-inc/.htaccess`
**バックアップ:** `docs/htaccess-backup-2026-07-13.md` (元に戻すときはこれを貼り直す)

## 2026-07-13 (第2回) の変更点 — 旧 WordPress の残りページを 301 する

第1回のドメイン切替では **トップページ (`^$`) だけ** をリダイレクトした。
その結果、旧 WordPress の下層ページが 4 本そのまま生きており、Google の検索結果に
**旧サイトのページが並び続けていた**（実際に「株式会社GIFT」で検索すると、
新サイトの下に旧サイトの「会社概要」が出る状態だった）。

まだ 200 を返していた旧ページ:

| 旧 URL | ページ | 新 URL |
|---|---|---|
| `/about/` | 会社概要 | `https://www.gift-inc.org/company` |
| `/lstep/` | Lステップ | `https://www.gift-inc.org/services/aiops` |
| `/lsteprpa/` | RPA | `https://www.gift-inc.org/services/aiops` |
| `/privacypolicy/` | プライバシーポリシー | `https://www.gift-inc.org/privacy` |

リダイレクト先は `next.config.js` の `redirects()` と同じ対応表にしてある。

**安全性:** ルールはすべて **完全一致** (`^about/?$` のように `$` で終える)。
ワイルドカードは使わない。ドキュメントルートには他に十数個のアプリが同居しており、
`/Dashboard`・ブログ・各種 API は **1 文字も触らない**。

---

```apache
# BEGIN SAKURA Internet Inc.
<IfModule mod_deflate.c>
SetOutputFilter DEFLATE
AddOutputFilterByType DEFLATE text/css
AddOutputFilterByType DEFLATE application/x-javascript application/javascript application/ecmascript
</IfModule>
<IfModule mod_expires.c>
ExpiresActive On
<FilesMatch "\.(css|js)$">
ExpiresDefault "access plus 1 week"
</FilesMatch>
<FilesMatch "\.(gif|jpe?g|png)$">
ExpiresDefault "access plus 1 month"
</FilesMatch>
</IfModule>
# END SAKURA Internet Inc.

# GIFT 旧サイト -> 新サイト (Vercel) への 301。
# すべて完全一致。WordPress ブロックより前に置くこと (でないと WP に食われる)。
<IfModule mod_rewrite.c>
RewriteEngine On

# トップページ
RewriteRule ^$ https://www.gift-inc.org/ [R=301,L]

# 旧 WordPress の公開ページ (2026-07-13 追加)
RewriteRule ^about/?$        https://www.gift-inc.org/company        [R=301,L]
RewriteRule ^lstep/?$        https://www.gift-inc.org/services/aiops [R=301,L]
RewriteRule ^lsteprpa/?$     https://www.gift-inc.org/services/aiops [R=301,L]
RewriteRule ^privacypolicy/?$ https://www.gift-inc.org/privacy       [R=301,L]
</IfModule>

# BEGIN WordPress
# "BEGIN WordPress" から "END WordPress" までのディレクティブ (行) は
# 動的に生成され、WordPress フィルターによってのみ修正が可能です。
# これらのマーカー間にあるディレクティブへのいかなる変更も上書きされてしまいます。
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
RewriteBase /
RewriteRule ^index\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]
</IfModule>

# END WordPress

# Begin AIOWPSEC Firewall
<IfModule mod_php5.c>
php_value auto_prepend_file '/home/gift-original/www/gift-inc/aios-bootstrap.php'
</IfModule>
<IfModule mod_php7.c>
php_value auto_prepend_file '/home/gift-original/www/gift-inc/aios-bootstrap.php'
</IfModule>
<IfModule mod_php.c>
php_value auto_prepend_file '/home/gift-original/www/gift-inc/aios-bootstrap.php'
</IfModule>
# End AIOWPSEC Firewall
```

---

## 貼り替えたあとの確認 (これを全部通す)

301 で新 URL に飛ぶこと:

```bash
curl -sI https://gift-inc.org/            | head -1   # 301
curl -sI https://gift-inc.org/about/      | grep -i location   # -> /company
curl -sI https://gift-inc.org/lstep/      | grep -i location   # -> /services/aiops
curl -sI https://gift-inc.org/lsteprpa/   | grep -i location   # -> /services/aiops
curl -sI https://gift-inc.org/privacypolicy/ | grep -i location # -> /privacy
```

**壊れていないこと (最重要)** — 以下が 301 に化けていたら即ロールバック:

```bash
curl -sI https://gift-inc.org/wp-admin/          | head -1   # 触っていないこと
curl -sI https://aiops.gift-inc.org/             | head -1   # 200
# Dashboard / ブログ / 各種 API も従来どおり開けること (ブラウザで実際に確認)
```

## Google 側の後始末

`.htaccess` を直しただけでは検索結果はすぐには変わらない。Google が再クロールするまで
旧ページのスニペットが残る (数日〜2週間)。急ぐなら Search Console で:

1. **サイトマップ送信**: `https://www.gift-inc.org/sitemap.xml`
2. **URL 検査 → インデックス登録をリクエスト**: 新トップページと `/company`
3. 旧 URL (`/about/` 等) は 301 を検出しだい Google が自動で新 URL に統合する。
   `削除ツール` は使わない (301 の評価継承を邪魔するため)
