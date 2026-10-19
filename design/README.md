# ZeroWall Science website redesign

Art direction: deep navy with cyan and violet from the user's original ZeroWall icon; generous spacing and five research chapters. The supplied transparent PNG in `branding/zerowall-icon.png` is preserved byte for byte as the navigation/footer logo and full-size favicon. Browser-size icons are resized derivatives. The hero isolates the original coloured artwork and white Z from its pale app tile, with subtle depth, orbital accents and violet shards; mobile and reduced-motion modes show a composition embedding the same original. The desktop scroll storyboard has five equal chapters inside a seven-viewport sticky stage. Mobile and reduced-motion layouts use the same content in normal document flow.

Core order: Research Agent, virtual gene knockout, medical research, paper reproduction, editable PPTX. The later creative section covers image, video and music workflows.

All rendered artwork uses `/assets/v2/`. `manifest.json` records asset provenance, dimensions, hashes, language and purpose. Generated conceptual art uses the user-selected `gpt-image-2.5-sunburst`, quality `high`; prompts and receipts are stored in `design/generated/` and copied into the manifest. Quantitative-looking workflow graphics are explicitly labelled illustrations. Actual application captures use a separate clean profile and preserve the software UI.

The working Astro page is also the responsive HTML design prototype. Final browser evidence, the slide-export evidence and installer verification live under `artifacts/`.

The typography revision follows a measured comparison of the live VibeDev page: Chinese system sans, 700-weight headings, 16–19px primary text, readable 13–16px product demos, alternating feature compositions, brighter cyan accents and a larger chapter introduction. Montserrat is bundled locally under the SIL Open Font License. See `TYPOGRAPHY-REVIEW.md` for the measured differences and `font-manifest.json` for the font source and hash. Sticky chapters require at least 1200 × 780px so the larger text remains fully visible.

The bilingual WeChat community section follows the download area, with a footer anchor, a lossless QR crop, original-image enlargement and download. The supplied image and displayed validity date are documented in `COMMUNITY-REVIEW.md`; asset provenance is in `manifest.json`.
