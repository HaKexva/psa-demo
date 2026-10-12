# PSA · Pitcher Status Analyzer (demo site)

Pitcher analysis from public game video: season and tournament reports that score each outing against the pitcher's
own previous ones (PSI), plus single-game pages that show every pitch.
Live page: https://hakexva.github.io/psa-demo/

This build quotes cropped broadcast frames (img/footage/) for research and commentary.

Source broadcasts: 2025 第十三屆中信盃黑豹旗 冠軍戰 羅東高工 vs 平鎮高中 (公視+, https://www.youtube.com/watch?v=SbqKPdi0Qzw), 2024 中華職棒二軍總冠軍賽 G4 味全龍二軍 vs 統一獅二軍 (CPBLTV, https://www.youtube.com/watch?v=hXOoe7WfKqI), 胡智為 · 2025–2026: Video: game highlights on YouTube from 統一獅 Uni Lions, 博斯體育台, MOMO SPORTS, 緯來體育台, 愛爾達體育家族 ELTA Sports, DAZN Taiwan and CPBL (rights remain with them; linked, not hosted). Pitch data: rebas.tw Open Data (ODC-By) for 2025; CPBL official site play-by-play for 2026..

All rights to the broadcasts remain with their owners. Pitches on the pages link to the original video on YouTube.
Measurements are for workload and consistency tracking, not medical assessment.

This branch is regenerated on every publish (single commit). To take the broadcast frames down, publish again from the
lab project with the same options plus `--no-footage` (runs: final_1930_6000 cpbl2024g4_0000_6000).
