#!/usr/bin/env bash
set -Eeuo pipefail
umask 027

deploy_root="/www/zhangdashi-deploy"
incoming_root="$deploy_root/incoming"
releases_root="$deploy_root/releases"
current_link="$deploy_root/current"
shared_static="$deploy_root/shared/next-static"
shared_data="$deploy_root/shared/data"
shared_env="$deploy_root/shared/env/.env.local"
logs_root="$deploy_root/shared/logs"
legacy_root="/www/wwwroot/zhangdashi.ai/website_promotion_zds"
pm2_name="zds-website"
lead_worker_name="zds-lead-worker"
release_id="${1:-}"

if [[ ! "$release_id" =~ ^[0-9a-f]{40}$ ]]; then
  echo "release id 必须是 40 位小写 Git commit。" >&2
  exit 1
fi

incoming_dir="$incoming_root/$release_id"
release_dir="$releases_root/$release_id"
new_release=false

require_release_files() {
  local dir="$1"
  [[ -f "$dir/server.js" ]] || { echo "缺少 server.js。" >&2; return 1; }
  [[ -f "$dir/scripts/leads/worker.mjs" ]] || { echo "缺少线索工作进程。" >&2; return 1; }
  [[ -d "$dir/public" ]] || { echo "缺少 public 目录。" >&2; return 1; }
  [[ -d "$dir/.next/static" ]] || { echo "缺少 .next/static 目录。" >&2; return 1; }
  [[ -f "$dir/SHA256SUMS" ]] || { echo "缺少 SHA256SUMS。" >&2; return 1; }
  [[ ! -e "$dir/.data" && ! -L "$dir/.data" ]] || { echo "发布包不得包含 .data。" >&2; return 1; }
  [[ ! -e "$dir/.env" && ! -L "$dir/.env" ]] || { echo "发布包不得包含 .env。" >&2; return 1; }
  [[ ! -e "$dir/.env.local" && ! -L "$dir/.env.local" ]] || { echo "发布包不得包含 .env.local。" >&2; return 1; }
  [[ ! -e "$dir/public/uploads/cms" && ! -L "$dir/public/uploads/cms" ]] || {
    echo "发布包不得包含 CMS 本地上传目录。" >&2
    return 1
  }
  if find "$dir" -type l -print -quit | grep -q .; then
    echo "上传中的发布包不得包含软链接。" >&2
    return 1
  fi
}

verify_manifest() {
  local dir="$1"
  local calculated_manifest
  if ! awk '
    {
      path = $0
      sub(/^[^ ]+[ ][ *]/, "", path)
      if (path !~ /^\.\// || path ~ /(^|\/)\.\.(\/|$)/) exit 1
    }
  ' "$dir/SHA256SUMS"; then
    echo "SHA256SUMS 含有不安全路径。" >&2
    return 1
  fi
  calculated_manifest="$(mktemp)"
  (
    cd "$dir"
    find . -type f ! -name SHA256SUMS -print0 | sort -z | xargs -0 sha256sum > "$calculated_manifest"
    sha256sum --strict --check SHA256SUMS > "$logs_root/checksum-$release_id.log"
  )
  if ! cmp -s "$calculated_manifest" "$dir/SHA256SUMS"; then
    rm -f "$calculated_manifest"
    echo "SHA256SUMS 与发布包实际文件不一致。" >&2
    return 1
  fi
  rm -f "$calculated_manifest"
}

extract_css_paths() {
  grep -oE 'href="[^"]+\.css([^\"]*)?"' "$1" \
    | sed -E 's/^href="//; s/"$//; s/&amp;/\&/g' \
    | sort -u
}

verify_public_revalidation_headers() {
  local headers_file="$1"
  grep -Eqi '^Cache-Control:.*(^|[[:space:],])no-cache([[:space:],]|$)' "$headers_file" \
    && ! grep -Eqi '^Cache-Control:.*(^|[[:space:],])no-store([[:space:],]|$)' "$headers_file" \
    && ! grep -Eqi '^Cache-Control:.*(^|[[:space:],])s-maxage[[:space:]]*=[[:space:]]*[1-9][0-9]*' "$headers_file" \
    && ! grep -Eqi '^Cache-Control:.*(^|[[:space:],])max-age[[:space:]]*=[[:space:]]*[1-9][0-9]*' "$headers_file"
}

verify_site() {
  local base_url="$1"
  local host_header="${2:-}"
  local require_public_cache="${3:-false}"
  local work_dir
  local curl_host=()
  work_dir="$(mktemp -d)"
  if [[ -n "$host_header" ]]; then
    curl_host=(-H "Host: $host_header")
  fi

  if ! curl -fsS "${curl_host[@]}" -D "$work_dir/page.headers" -o "$work_dir/page.html" "$base_url/cn/"; then
    rm -rf "$work_dir"
    return 1
  fi
  if [[ "$require_public_cache" == true ]]; then
    if ! verify_public_revalidation_headers "$work_dir/page.headers" \
      || ! grep -Eqi '^ETag:[[:space:]]*[^[:space:]]+' "$work_dir/page.headers"; then
      rm -rf "$work_dir"
      return 1
    fi
    if ! curl -fsS "${curl_host[@]}" -H 'RSC: 1' -D "$work_dir/rsc.headers" -o "$work_dir/rsc.body" "$base_url/cn/" \
      || ! grep -Eqi '^Content-Type:.*text/x-component' "$work_dir/rsc.headers" \
      || ! verify_public_revalidation_headers "$work_dir/rsc.headers" \
      || [[ ! -s "$work_dir/rsc.body" ]]; then
      rm -rf "$work_dir"
      return 1
    fi
  fi

  mapfile -t css_paths < <(extract_css_paths "$work_dir/page.html")
  if [[ "${#css_paths[@]}" -eq 0 ]]; then
    rm -rf "$work_dir"
    return 1
  fi

  local index=0
  local css_path
  local css_url
  for css_path in "${css_paths[@]}"; do
    index=$((index + 1))
    if [[ "$css_path" =~ ^https?:// ]]; then
      css_url="$css_path"
    else
      css_url="$base_url${css_path}"
    fi
    if ! curl -fsS "${curl_host[@]}" -D "$work_dir/css-$index.headers" -o "$work_dir/css-$index.body" "$css_url" \
      || ! grep -Eqi '^Content-Type:.*text/css' "$work_dir/css-$index.headers" \
      || [[ ! -s "$work_dir/css-$index.body" ]]; then
      rm -rf "$work_dir"
      return 1
    fi
  done

  rm -rf "$work_dir"
}

find_preflight_port() {
  local port
  for port in $(seq 3100 3199); do
    if ! ss -ltn | awk '{print $4}' | grep -Eq ":${port}$"; then
      echo "$port"
      return 0
    fi
  done
  return 1
}

preflight_release() {
  local dir="$1"
  local port
  local pid
  local ready=false
  port="$(find_preflight_port)" || return 1
  (
    cd "$dir"
    HOSTNAME=127.0.0.1 PORT="$port" NODE_ENV=production node server.js > "$logs_root/preflight-$release_id.log" 2>&1
  ) &
  pid=$!

  for _ in $(seq 1 30); do
    if ! kill -0 "$pid" >/dev/null 2>&1; then
      break
    fi
    if curl -fsS "http://127.0.0.1:$port/cn/" >/dev/null 2>&1; then
      ready=true
      break
    fi
    sleep 1
  done

  if [[ "$ready" == true ]] && verify_site "http://127.0.0.1:$port"; then
    kill "$pid" >/dev/null 2>&1 || true
    wait "$pid" 2>/dev/null || true
    return 0
  fi

  kill "$pid" >/dev/null 2>&1 || true
  wait "$pid" 2>/dev/null || true
  return 1
}

switch_current() {
  local target="$1"
  local temporary_link="$deploy_root/.current-$release_id-$$"
  ln -s "$target" "$temporary_link"
  mv -Tf "$temporary_link" "$current_link"
}

start_current() {
  pm2 delete "$pm2_name" >/dev/null 2>&1 || true
  pm2 delete "$lead_worker_name" >/dev/null 2>&1 || true
  HOSTNAME=127.0.0.1 PORT=3000 NODE_ENV=production \
    pm2 start "$current_link/server.js" --name "$pm2_name" --cwd "$current_link" --time
  if [[ -f "$current_link/scripts/leads/worker.mjs" ]]; then
    NODE_ENV=production \
      pm2 start "$current_link/scripts/leads/worker.mjs" --name "$lead_worker_name" --cwd "$current_link" --time
  fi
  pm2 save --force >/dev/null
}

start_legacy() {
  pm2 delete "$pm2_name" >/dev/null 2>&1 || true
  pm2 delete "$lead_worker_name" >/dev/null 2>&1 || true
  pm2 start /usr/bin/bash --name "$pm2_name" --cwd "$legacy_root" -- \
    -c 'node node_modules/next/dist/bin/next start -H 127.0.0.1 -p 3000'
  pm2 save --force >/dev/null
}

ensure_shared_environment() {
  install -d -m 0700 "$(dirname "$shared_env")"
  if [[ ! -f "$shared_env" ]]; then
    install -m 0600 /dev/null "$shared_env"
  fi
  chmod 0600 "$shared_env"
  if ! grep -Eq '^LEAD_DATA_ENCRYPTION_KEY=' "$shared_env"; then
    printf '\nLEAD_DATA_ENCRYPTION_KEY=%s\n' "$(openssl rand -base64 32)" >> "$shared_env"
  fi
  if ! grep -Eq '^LEAD_WORKER_TOKEN=' "$shared_env"; then
    printf 'LEAD_WORKER_TOKEN=%s\n' "$(openssl rand -hex 32)" >> "$shared_env"
  fi
}

ensure_shared_link() {
  local target="$1"
  local link_path="$2"
  if [[ -L "$link_path" ]]; then
    [[ "$(readlink "$link_path")" == "$target" ]] || {
      echo "持久化链接指向异常：$link_path" >&2
      return 1
    }
  elif [[ -e "$link_path" ]]; then
    echo "发布包不应包含持久化路径：$link_path" >&2
    return 1
  else
    ln -s "$target" "$link_path"
  fi
}

verify_lead_worker() {
  if [[ ! -f "$current_link/scripts/leads/worker.mjs" ]]; then
    return 0
  fi
  local worker_pid
  local heartbeat="$current_link/.data/lead-worker-heartbeat.json"
  worker_pid="$(pm2 pid "$lead_worker_name" | tail -n 1 | tr -d '[:space:]')"
  [[ "$worker_pid" =~ ^[1-9][0-9]*$ ]] \
    && [[ -f "$heartbeat" ]] \
    && find "$heartbeat" -mmin -2 -print -quit | grep -q .
}

wait_for_production() {
  local attempt
  for attempt in $(seq 1 45); do
    if verify_site 'http://127.0.0.1:3000' \
      && verify_site 'http://127.0.0.1' 'zhangdashi.ai' true \
      && verify_lead_worker; then
      return 0
    fi
    sleep 1
  done
  return 1
}

cleanup_releases() {
  mapfile -t releases < <(find "$releases_root" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' | sort -rn | awk '{print $2}')
  local index=0
  local dir
  for dir in "${releases[@]}"; do
    index=$((index + 1))
    if (( index > 5 )) && [[ "$(readlink -f "$current_link")" != "$dir" ]]; then
      rm -rf --one-file-system "$dir"
    fi
  done
}

[[ -d "$incoming_dir" ]] || { echo "没有找到上传目录：$incoming_dir" >&2; exit 1; }
require_release_files "$incoming_dir"
verify_manifest "$incoming_dir"

if [[ -e "$release_dir" ]]; then
  if ! cmp -s "$incoming_dir/SHA256SUMS" "$release_dir/SHA256SUMS"; then
    echo "同一 commit 已存在不同构建产物，拒绝覆盖。" >&2
    exit 1
  fi
  rm -rf --one-file-system "$incoming_dir"
else
  mv "$incoming_dir" "$release_dir"
  new_release=true
  chown -R root:root "$release_dir"
fi

ensure_shared_environment
ensure_shared_link "$shared_data" "$release_dir/.data"
ensure_shared_link "$shared_env" "$release_dir/.env.local"
rsync -a --ignore-existing "$release_dir/.next/static/" "$shared_static/"

if ! preflight_release "$release_dir"; then
  echo "新版本预启动检查失败，未切换生产流量。" >&2
  if [[ "$new_release" == true ]]; then
    rm -rf --one-file-system "$release_dir"
  fi
  exit 1
fi

previous_target="$(readlink -f "$current_link" 2>/dev/null || true)"
switch_current "$release_dir"
start_current

if ! wait_for_production; then
  echo "新版本生产健康检查失败，开始自动回滚。" >&2
  if [[ -n "$previous_target" && -f "$previous_target/server.js" ]]; then
    switch_current "$previous_target"
    start_current
  else
    rm -f "$current_link"
    start_legacy
  fi
  wait_for_production || echo "回滚后的健康检查仍失败，请立即人工检查。" >&2
  exit 1
fi

cleanup_releases
echo "发布成功：$release_id"
