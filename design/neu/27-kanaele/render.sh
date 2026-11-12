#!/bin/sh
# SVG → PNG с настоящим шрифтом Nunito (Chromium), 2× — в эту папку и в /root/work/orbook-compare/27-kanaele/png
cd "$(dirname "$0")"
mkdir -p /root/work/orbook-compare/27-kanaele/png
node /root/work/orbook-compare/_tools/svgpng.mjs . /root/work/orbook-compare/27-kanaele/png 2 && cp /root/work/orbook-compare/27-kanaele/png/*.png .
