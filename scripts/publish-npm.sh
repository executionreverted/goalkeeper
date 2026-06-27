#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

if [[ -z "${NPM_TOKEN:-}" ]]; then
  echo "error: NPM_TOKEN is required. Put it in .env or export it before publishing." >&2
  exit 1
fi

tmp_npmrc="$(mktemp)"
cleanup() {
  rm -f "$tmp_npmrc"
}
trap cleanup EXIT

printf '//registry.npmjs.org/:_authToken=%s\n' "$NPM_TOKEN" > "$tmp_npmrc"

cd "$ROOT_DIR"
npm publish --access public --userconfig "$tmp_npmrc"
