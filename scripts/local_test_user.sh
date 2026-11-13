#!/usr/bin/env bash
# Create (or reuse) a confirmed test account on the LOCAL Supabase only, and set its role.
# Usage: bash scripts/local_test_user.sh [email] [password] [learner|native]
#   default: a1smoke@test.local / smoke-test-pass-1 / learner
# Needs the local stack running (supabase start in app/backend). Never points at the hosted project.
# A `supabase db reset` wipes local accounts: run this again afterwards.
set -euo pipefail
EMAIL="${1:-a1smoke@test.local}"; PASS="${2:-smoke-test-pass-1}"; ROLE="${3:-learner}"
cd "$(dirname "$0")/../app/backend"
KEY=$(supabase status -o json 2>/dev/null | python -c "import json,sys;print(json.load(sys.stdin)['SERVICE_ROLE_KEY'])")
curl -s -X POST http://127.0.0.1:54321/auth/v1/admin/users \
  -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\",\"email_confirm\":true}" >/dev/null || true
supabase db query --local "update public.profiles set role = '$ROLE' where id = (select id from auth.users where email = '$EMAIL')" >/dev/null
echo "local user $EMAIL / $PASS ($ROLE)"
