#!/bin/sh
# SVG → PNG für die Übersicht: Telefon 2×, PC in Originalgröße
cd "$(dirname "$0")"
for f in *.svg; do
  case "$f" in
    pc-*) w=1440 ;;
    *) w=780 ;;
  esac
  rsvg-convert -w "$w" "$f" -o "${f%.svg}.png"
done
