"""Create the website's original art with the explicitly selected private skill.

Credentials remain inside the user's skill helper. Existing successful images are
reused on restart; model and quality are never silently changed.
"""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import hashlib
import json
import subprocess
import sys

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "design" / "generated"
HELPER = Path(r"C:\Users\ccf\.cc-switch\skills\gpt-image-generator\scripts\aiimagesee_image.py")
STYLE = "Premium editorial art for a medical research software website. Deep midnight navy #090d14 background, luminous cyan and restrained mint highlights, physically convincing glass, sophisticated cinematic lighting, generous negative space. No text, no letters, no logos, no watermark, no UI, no numeric scientific results. Landscape 3:2 composition. "
PROMPTS = {
    "research": STYLE + "A sculptural translucent glass orbital loop surrounding a tiny illuminated biological specimen, suspended above a dark reflective surface. A calm research instrument aesthetic, not a robot or a laboratory stock photograph. Central composition, delicate floating cyan particles, crisp and exceptionally refined.",
    "cells": STYLE + "An intimate macro composition of three translucent organic cells and a short elegant DNA strand. One cell glows cyan and another mint, with extremely fine membrane and nucleus detail. Scientific conceptual illustration, not a microscopy result. Arrange subjects toward the right two thirds, beautifully dark negative space at left.",
    "medicine": STYLE + "An elegant abstract anatomical heart made of translucent blue glass with a subtle branching vascular structure, floating in a dark space, delicate mint points of light and soft cyan caustics. Biomedical conceptual illustration, not a clinical scan. Object on the right side, dark negative space on the left. Absolutely no text.",
    "creative": STYLE + "A single spectacular translucent cyan flower emerging from a polished liquid silver ribbon, a fusion of botanical science and visual art, editorial still life. Black-blue studio background, gentle mint reflection, a little fine grain, beautifully art directed, dramatic macro composition with no text.",
}

def generate(item):
    name, prompt = item
    target = OUT / f"{name}.png"
    log = OUT / f"{name}.log"
    if not target.exists():
        with log.open("w", encoding="utf-8") as stream:
            result = subprocess.run([sys.executable, str(HELPER), "generate", "--model", "gpt-image-2.5-sunburst", "--quality", "high", "--size", "1536x1024", "--n", "1", "--prompt", prompt, "--out", str(target)], stdout=stream, stderr=subprocess.STDOUT)
        if result.returncode or not target.exists():
            print(f"FAILED {name}; see {log.relative_to(ROOT)}", flush=True)
            return {"name": name, "state": "failed", "prompt": prompt}
    print(f"READY {name}", flush=True)
    return {"name": name, "state": "generated", "prompt": prompt, "model": "gpt-image-2.5-sunburst", "quality": "high", "size": "1536x1024", "sha256": hashlib.sha256(target.read_bytes()).hexdigest()}

if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    with ThreadPoolExecutor(max_workers=2) as pool:
        receipts = list(pool.map(generate, PROMPTS.items()))
    (OUT / "receipts.json").write_text(json.dumps(receipts, ensure_ascii=False, indent=2), encoding="utf-8")
    sys.exit(1 if any(x["state"] == "failed" for x in receipts) else 0)
