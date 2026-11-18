#!/usr/bin/env bash
# App review accounts (scripts/review/README.md): delete and recreate fresh learner accounts on the LOCAL Supabase,
# so every review run starts as a brand-new learner (no intake answered, no lessons done).
#   capture accounts: review_<device>@test.local   (one per device in scripts/browser/review_capture.js)
#   agent accounts:   review_agent<n>@test.local    (one per review agent, n = 1..AGENTS)
# Password for all: review-pass-1. Never touches the hosted project.
# Usage: bash scripts/review/accounts.sh [AGENTS=8]
set -euo pipefail
AGENTS="${1:-8}"
cd "$(dirname "$0")/../../app/backend"
KEY=$(supabase status -o json 2>/dev/null | python -c "import json,sys;print(json.load(sys.stdin)['SERVICE_ROLE_KEY'])")
API=http://127.0.0.1:54321/auth/v1/admin/users
NAMES="phone phone_desksite tablet_p tablet_l desktop laptop desktop_zoom200"
for n in $(seq 1 "$AGENTS"); do NAMES="$NAMES agent$n"; done
# existing review_* users (local admin API, first 1000 users)
IDS=$(curl -s "$API?per_page=1000" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" |
  python -c "import json,sys;print(' '.join(u['id'] for u in json.load(sys.stdin)['users'] if u['email'].startswith('review_')))")
for id in $IDS; do
  curl -s -X DELETE "$API/$id" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" >/dev/null
done
for name in $NAMES; do
  curl -s -X POST "$API" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \
    -d "{\"email\":\"review_$name@test.local\",\"password\":\"review-pass-1\",\"email_confirm\":true}" >/dev/null
done
supabase db query --local "update public.profiles set role = 'learner' where id in (select id from auth.users where email like 'review\_%@test.local')" >/dev/null 2>&1
echo "fresh review accounts: $(echo $NAMES | wc -w) (password review-pass-1)"
