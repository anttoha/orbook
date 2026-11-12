#!/bin/sh
# SVG → PNG с настоящим шрифтом Nunito (Chromium), 2× — в эту папку и в /root/work/orbook-compare/27b-telegram-bot/png
cd "$(dirname "$0")"
mkdir -p /root/work/orbook-compare/27b-telegram-bot/png
node /root/work/orbook-compare/_tools/svgpng.mjs . /root/work/orbook-compare/27b-telegram-bot/png 2 && cp /root/work/orbook-compare/27b-telegram-bot/png/*.png .
