#!/usr/bin/env bash
set -Eeuo pipefail

if [[ "$(id -u)" -ne 0 ]]; then
  echo "必须使用 root 执行 Nginx 配置。" >&2
  exit 1
fi

site_config="/www/server/panel/vhost/nginx/html_www.zhangdashi.ai.conf"
map_config="/www/server/panel/vhost/nginx/00-zhangdashi-cache-map.conf"
legacy_alias="alias /www/wwwroot/zhangdashi.ai/website_promotion_zds/.next/static/;"
shared_alias="alias /www/zhangdashi-deploy/shared/next-static/;"
backup_dir="/www/zhangdashi-deploy/shared/nginx-backups"
timestamp="$(date +%Y%m%d%H%M%S)"
site_backup="$backup_dir/html_www.zhangdashi.ai.conf.$timestamp"
map_backup="$backup_dir/00-zhangdashi-cache-map.conf.$timestamp"
map_existed=false

install -d -m 0700 -o root -g root "$backup_dir"
cp -a "$site_config" "$site_backup"
if [[ -f "$map_config" ]]; then
  cp -a "$map_config" "$map_backup"
  map_existed=true
fi

rollback() {
  cp -a "$site_backup" "$site_config"
  if [[ "$map_existed" == true ]]; then
    cp -a "$map_backup" "$map_config"
  else
    rm -f "$map_config"
  fi
  /www/server/nginx/sbin/nginx -t >/dev/null 2>&1 || true
}
trap rollback ERR

if grep -Fq "$legacy_alias" "$site_config"; then
  sed -i "s#${legacy_alias}#${shared_alias}#" "$site_config"
elif ! grep -Fq "$shared_alias" "$site_config"; then
  echo "没有找到预期的 Next.js 静态资源 alias，停止修改。" >&2
  exit 1
fi

cat > "$map_config" <<'EOF'
# 公开站点 HTML 与 RSC 不落客户端缓存；CMS 与 API 保留应用原有缓存头。
map $request_uri $zhangdashi_response_cache_control {
    default $upstream_http_cache_control;
    ~^/(cn|jp|hk)(?:/|$) "no-store, max-age=0";
}
EOF
chmod 0644 "$map_config"

if ! grep -Fq 'add_header Cache-Control $zhangdashi_response_cache_control always;' "$site_config"; then
  sed -i '/^[[:space:]]*proxy_pass http:\/\/127\.0\.0\.1:3000;$/a\        proxy_hide_header Cache-Control;\n        add_header Cache-Control $zhangdashi_response_cache_control always;' "$site_config"
fi

/www/server/nginx/sbin/nginx -t
/www/server/nginx/sbin/nginx -s reload
trap - ERR

echo "Nginx 静态资源与公开页面无缓存策略配置完成。"
