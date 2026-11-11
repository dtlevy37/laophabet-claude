---
name: app-slice
description: Workflow for building one app slice from _agent/APP_PLAN.md "Slices" — from a "Done when" line through code, review, docs and commit, ending at a named user gate with exact test steps. Use when starting, continuing or finishing any app slice.
---

# Building one app slice

The user's rule: small pieces, one slice at a time, and every slice ends at a named **user gate** with all agent work
already finished. Nobody can run the code before the gate, so careful reading and review replace tests.

## 1. Frame it
- Read the slice in `_agent/APP_PLAN.md` "Slices" and only the spec sections it depends on (grep the headings of
  `_agent/APP_DESIGN.md`, then read those sections by line range). Keep reading small (user, 2026-11-10): read in
  full only the code modules you will change substantially; grep `strings.json`, `styles.css`, `app/README.md` and
  applied migrations (the contract comment above an RPC is enough) and append to them without a full read.
- If the slice has no **Done when** line, write one under it before coding: an observable result the user can check,
  such as "learner finishes lesson 1; `select * from learner_items` shows 4 rows at level 2; the summary screen
  shows words read and % correct".
- If the slice is bigger than about one sitting (more than one migration plus two or three JS modules), propose a
  split in APP_PLAN and do only the first part.
- Open product questions the slice cannot sensibly default: ask now (user present) or pick the conservative option
  and write it under "Decisions log" in APP_PLAN as provisional.

## 2. Build
- Backend first, then frontend: the RPC contract (arguments, returned JSON) is what the UI codes against. Write the
  contract as a comment at the top of the RPC.
- Schema/RPC migrations: follow the `sql-migration` skill. Screens: `frontend-feature`. Activities: `activity-module`.
- Keep to the slice. Note anything else you notice in PROGRESS.md "Later" instead of doing it.

## 3. Check
- Re-read your diff (`git diff`) top to bottom once.
- If approved: `node approved-scripts/check_frontend.js` (JS syntax, strings.json keys).
- Run the `code-reviewer` agent when the slice changes SQL (schema, RLS, RPCs) or more than about 150 lines of JS;
  skip it for small frontend-only changes (user, 2026-11-10: cost). Give it: slice name, Done-when line, files changed. Fix blockers and majors, or explain
  in the hand-over why not. Run it again only if fixes were large.

## 4. Wrap up (all before the gate)
- Docs: `app/README.md` (new tables, RPCs, files), APP_DESIGN if behaviour was decided, APP_PLAN (tick sub-steps;
  the slice itself is ticked after the gate passes).
- New migrations listed in `_agent/PENDING_MIGRATIONS.md`.
- `CHANGELOG.md` entry; `_agent/PROGRESS.md` holds only what is open (the gate, open questions).
- `git add -A` and `git commit -m "checkpoint: S<n> <short name> (awaiting <gate>)"`.

## 5. Hand over at the gate
End the turn with a short message:
1. **What was built** (2–4 lines) and what is untested.
2. **Gate:** exactly what the user does, in order, as copy-paste blocks:
   - migrations: `supabase db reset` (local), or `supabase db push` (hosted);
   - SQL checks with the expected result next to each query;
   - browser steps: URL/route, what to click, what they should see.
3. **Unverifiable points** from the review that the test settles.
4. **Next slice** in one line.

After the user reports back: fix what failed (back to step 3), or tick the slice in APP_PLAN, update PROGRESS, and commit.
