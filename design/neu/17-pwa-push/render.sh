#!/bin/sh
# SVG → PNG с настоящим шрифтом Nunito (Chromium), 2× — в эту папку и в /root/work/orbook-compare/17-pwa-push/png
cd "$(dirname "$0")"
node /root/work/orbook-compare/_tools/svgpng.mjs . /root/work/orbook-compare/17-pwa-push/png 2 && cp /root/work/orbook-compare/17-pwa-push/png/*.png .
