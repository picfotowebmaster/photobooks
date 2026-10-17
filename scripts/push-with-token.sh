#!/usr/bin/env bash

set -euo pipefail

umask 077

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
token_file="${GITHUB_TOKEN_FILE:-$repo_root/.github-token}"
remote="${1:-origin}"

if [[ ! -f "$token_file" ]]; then
  echo "No existe $token_file. Crea el archivo y pega tu token de GitHub." >&2
  exit 1
fi

token="$(sed -e 's/#.*//' -e 's/[[:space:]]//g' "$token_file" | tr -d '\r\n')"

if [[ -z "$token" ]]; then
  echo "El archivo $token_file no contiene un token." >&2
  exit 1
fi

branch="$(git -C "$repo_root" symbolic-ref --short HEAD)"
askpass="$(mktemp "${TMPDIR:-/tmp}/git-askpass.XXXXXX")"
token_tmp="$(mktemp "${TMPDIR:-/tmp}/git-token.XXXXXX")"

printf '%s' "$token" > "$token_tmp"

cleanup() {
  rm -f "$askpass" "$token_tmp"
}
trap cleanup EXIT

cat > "$askpass" <<'EOF'
#!/usr/bin/env bash
case "${1:-}" in
  *[Uu]sername*) printf '%s\n' "${GITHUB_PUSH_USERNAME:-picfotowebmaster}" ;;
  *) cat "${GITHUB_PUSH_TOKEN_FILE:?}" ;;
esac
EOF
chmod 700 "$askpass"

GITHUB_PUSH_TOKEN_FILE="$token_tmp" \
GIT_ASKPASS="$askpass" \
GIT_TERMINAL_PROMPT=0 \
  git -C "$repo_root" -c credential.helper= push "$remote" "$branch"
