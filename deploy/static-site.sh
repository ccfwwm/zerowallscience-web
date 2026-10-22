#!/usr/bin/env bash
# Publish a verified Astro archive without changing the shared docs service or Nginx configuration.
set -Eeuo pipefail
umask 022
revision="${1:-}"
archive="${2:-}"
expected_archive_sha256="${3:-}"
[[ "$revision" =~ ^[0-9a-f]{40}$ ]] || { echo 'Invalid Git revision' >&2; exit 2; }
[[ "$expected_archive_sha256" =~ ^[0-9a-f]{64}$ ]] || { echo 'Invalid archive hash' >&2; exit 2; }
[[ "$archive" == "/var/www/zerowallscience-web/incoming/$revision/site.tar.gz" ]] || { echo 'Invalid archive path' >&2; exit 2; }
printf '%s  %s\n' "$expected_archive_sha256" "$archive" | sha256sum --check --status

web=/var/www/zerowallscience-web
exec 9>/opt/zerowallscience-docs/deploy.lock
flock -n 9 || { echo 'A production deployment is already running' >&2; exit 2; }
test ! -e /opt/zerowallscience-docs/maintenance
nginx -t
old_release="$(readlink "$web/current")"
[[ "$old_release" == releases/* && "$old_release" != *..* ]] || { echo 'Invalid current release' >&2; exit 2; }
release="web-$revision-$(date -u +%Y%m%dT%H%M%SZ)"
target="$web/releases/$release"
mkdir "$target"
tar -xzf "$archive" --no-same-owner -C "$target"
chmod -R a+rX "$target"
test -s "$target/index.html"
test -s "$target/en/index.html"
test -s "$target/assets/v2/wechat-group-3.png"
test -s "$target/assets/v2/wechat-group-3-code.png"
test -s "$target/assets/v2/promo-poster.webp"
(cd "$target" && sha256sum --check --status SHA256SUMS)
# Keep content-addressed assets usable for visitors with an already open old page.
if test -d "$web/$old_release/_astro"; then
  cp -an "$web/$old_release/_astro/." "$target/_astro/"
fi
nginx_before="$(sha256sum /etc/nginx/conf.d/zerowallscience-web.*.conf)"
switched=0
rollback() {
  if [[ "$switched" == 1 ]]; then
    ln -s "$old_release" "$web/current.web-rollback"
    mv -Tf "$web/current.web-rollback" "$web/current"
    systemctl reload nginx
    echo "Rolled back to $old_release" >&2
  fi
}
trap rollback ERR
ln -s "releases/$release" "$web/current.web-next"
mv -Tf "$web/current.web-next" "$web/current"
switched=1
# Drop cached file descriptors after switching the static directory symlink.
systemctl reload nginx
for page in / /en/; do
  # A graceful reload can briefly serve a request from the preceding worker.
  for attempt in {1..10}; do
    body="$(curl -fsS --max-time 20 --resolve zerowallscience.org:443:127.0.0.1 "https://zerowallscience.org$page")"
    [[ "$body" == *'/assets/v2/wechat-group-3-code.png'* ]] && break
    sleep 1
  done
  [[ "$body" == *'id="community"'* && "$body" == *'/assets/v2/wechat-group-3-code.png'* ]]
  [[ "$body" == *'id="film"'* && "$body" == *'https://zerowall.chengxunkeji.cn/webfiles/zerowallsciencevideo.mp4'* ]]
  [[ "$body" != *'film-caption'* && "$body" != *'ppt-sample-link'* ]]
done
curl -fsS --max-time 20 http://127.0.0.1:13001/api/health >/dev/null
curl -fsS --max-time 20 --resolve zerowallscience.org:443:127.0.0.1 https://zerowallscience.org/docs/ >/dev/null
curl -fsS --max-time 20 --resolve zerowallscience.org:443:127.0.0.1 https://zerowallscience.org/admin/ >/dev/null
[[ "$nginx_before" == "$(sha256sum /etc/nginx/conf.d/zerowallscience-web.*.conf)" ]]
trap - ERR
printf '{"revision":"%s","release":"releases/%s","previousRelease":"%s","nginxChanged":false,"docsRestarted":false}\n' "$revision" "$release" "$old_release"
