# Sakura `.htaccess` — backup & rollback reference

**File on server:** `/home/gift-original/www/gift-inc/.htaccess`
**Captured:** 2026-07-13, immediately before the homepage-redirect change (Step 3 of the domain switch plan).
**Purpose:** rollback artifact. If the redirect misbehaves, restore the "ORIGINAL" block below verbatim and the old homepage returns instantly.

---

## Server layout notes (discovered 2026-07-13)

The doc root `/home/gift-original/www/gift-inc/` hosts far more than the 5-page WordPress site the earlier plan assumed. Live siblings found in that folder:

`DashBoard/`, `DashBoard02/`, `DashBoard03/`, `dashboardtest/`, `dashboardtest2/`, `support997/`, `saleshub/`, `QRClockIn/`, `knowledge/`, `hikari/`, `lstepdemopage/`, `qr2/`, `docs/`, `css/`, `img/`, plus `sendMail.php`, `ads.txt`, `.env`, `aios-bootstrap.php`.

**Consequence:** the redirect rule MUST be exact-match. A wildcard/catch-all rule would take down every one of those apps at once. This is the single failure mode to guard against.

---

## ORIGINAL (restore this to roll back)

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

## Rollback procedure

1. ファイルマネージャー → `/home/gift-original/www/gift-inc/` → edit `.htaccess`
2. Delete the `# GIFT homepage -> new site` block
3. Save. The old homepage serves again immediately.

Rollback is instant because the old WordPress files were never deleted — only hidden behind the redirect.

**Why the first deploy uses `302`, not `301`:** a 301 is cached permanently by browsers. If we shipped a 301 and then rolled back, visitors who already hit it would keep being redirected from their own browser cache even after the server rule was gone — the rollback would work server-side and still look broken to real users. A 302 is not cached that way, so rollback is genuinely instant. Promote to 301 only after the verification table passes.

---

## Verification table

Run before and after the change. Every row must be unchanged **except** the homepage.

| Path | Before (captured 2026-07-13) | After |
|---|---|---|
| `gift-inc.org/` | 200, no redirect | **302 → `https://www.gift-inc.org/`** |
| `gift-inc.org/DashBoard/` | 200, no redirect | 200, no redirect |
| `gift-inc.org/support997/` | 200, no redirect | 200, no redirect |
| `/DashBoard/fetch_sf_report.php` | 200 | 200 |
| `/DashBoard/save_config.php` | 200 | 200 |
| `/DashBoard/sf_soql_cache.php` | 500 *(pre-existing, not our doing)* | 500 |
| `/DashBoard/sf_upsert.php` | 500 *(pre-existing, not our doing)* | 500 |
| `www.gift-inc.org/` | 200, new site, valid SSL | 200, new site, valid SSL |

If any "must stay 200" row starts redirecting → the rule was written too broadly. Roll back immediately.
