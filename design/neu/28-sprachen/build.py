import glob,os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
p=sorted(glob.glob("*.png"))
open("index.html","w").write("<meta charset=utf-8><title>28 Sprachen</title><body style='font:14px sans-serif;background:#eee'><h1>28 · Sprache in Darstellung</h1>"+"".join(f"<figure style='display:inline-block;margin:8px'><img src='{x}' height=700><figcaption>{x}</figcaption></figure>" for x in p))
