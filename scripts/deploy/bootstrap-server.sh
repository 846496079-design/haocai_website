#!/usr/bin/env bash
set -Eeuo pipefail

if [[ "$(id -u)" -ne 0 ]]; then
  echo "必须使用 root 执行服务器初始化。" >&2
  exit 1
fi

deploy_public_key="${1:-}"
if [[ ! "$deploy_public_key" =~ ^ssh-ed25519[[:space:]]+[A-Za-z0-9+/=]+([[:space:]].*)?$ ]]; then
  echo "第一个参数必须是有效的 Ed25519 部署公钥。" >&2
  exit 1
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
release_script="$script_dir/server-release.sh"
deploy_root="/www/zhangdashi-deploy"
legacy_root="/www/wwwroot/zhangdashi.ai/website_promotion_zds"

if [[ ! -f "$release_script" || ! -d "$legacy_root" ]]; then
  echo "缺少发布脚本或现网站点目录。" >&2
  exit 1
fi

if ! command -v rsync >/dev/null 2>&1; then
  dnf install -y rsync
fi

if ! id deploy >/dev/null 2>&1; then
  useradd --create-home --shell /bin/bash deploy
fi

install -d -m 0700 -o deploy -g deploy /home/deploy/.ssh
printf '%s\n' "$deploy_public_key" > /home/deploy/.ssh/authorized_keys
chown deploy:deploy /home/deploy/.ssh/authorized_keys
chmod 0600 /home/deploy/.ssh/authorized_keys

install -d -m 0755 -o root -g root "$deploy_root"
install -d -m 0750 -o deploy -g deploy "$deploy_root/incoming"
install -d -m 0755 -o root -g root "$deploy_root/releases"
install -d -m 0755 -o root -g root "$deploy_root/shared"
install -d -m 0755 -o root -g root "$deploy_root/shared/next-static"
install -d -m 0700 -o root -g root "$deploy_root/shared/env"
install -d -m 0750 -o root -g root "$deploy_root/shared/logs"

if [[ ! -e "$deploy_root/shared/data" ]]; then
  ln -s "$legacy_root/.data" "$deploy_root/shared/data"
fi
if [[ ! -e "$deploy_root/shared/env/.env.local" ]]; then
  ln -s "$legacy_root/.env.local" "$deploy_root/shared/env/.env.local"
fi
chmod 0600 "$legacy_root/.env.local"

if [[ -d "$legacy_root/.next/static" ]]; then
  rsync -a --ignore-existing "$legacy_root/.next/static/" "$deploy_root/shared/next-static/"
fi

install -m 0750 -o root -g root "$release_script" /usr/local/sbin/zhangdashi-release

sudoers_file="/etc/sudoers.d/zhangdashi-deploy"
printf '%s\n' 'deploy ALL=(root) NOPASSWD: /usr/local/sbin/zhangdashi-release' > "$sudoers_file"
chmod 0440 "$sudoers_file"
visudo -cf "$sudoers_file"

echo "服务器部署目录和 deploy 用户初始化完成。"
