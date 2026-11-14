#!/usr/bin/env python3
"""Write docs/LAO_UI_REVIEW.md: a table (key | Lao | English gloss) for the native reviewer.

Usage: python scripts/export_lao_review.py
Edit the Lao in app/frontend/js/strings.json (or in the generated table, then copy back).
Strings without a `lo` field are learner-only English and are left out.
"""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
strings = json.loads((root / "app" / "frontend" / "js" / "strings.json").read_text(encoding="utf-8"))
note = strings.pop("_note")
strings = {k: v for k, v in strings.items() if "lo" in v}

lines = [
    "# Lao UI text: review needed",
    "",
    "All Lao below was **invented by an AI** and has not been checked by a native speaker.",
    "Please mark anything wrong, unnatural, too formal/casual, or misspelled, and suggest a fix.",
    "The English column only explains what each line is meant to say; it is not shown in the app.",
    "",
    "| # | Key | Lao (on screen) | Meant to say | Fix / OK? |",
    "|---|-----|-----------------|--------------|-----------|",
]
for i, (key, v) in enumerate(strings.items(), start=1):
    lines.append(f"| {i} | `{key}` | {v['lo']} | {v['en']} | |")
(root / "docs" / "LAO_UI_REVIEW.md").write_text("\n".join(lines) + "\n", encoding="utf-8", newline="\n")
print(f"wrote docs/LAO_UI_REVIEW.md ({len(strings)} strings)")
