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

# GIFT homepage -> new site (Vercel). Exact match on "/" only.
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteRule ^$ https://www.gift-inc.org/ [R=302,L]
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
