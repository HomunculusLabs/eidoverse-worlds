import sys
from PIL import Image, ImageDraw
# Crop the night cone band from before and after-v2, stack for direct A/B.
band = (300, 178, 660, 258)  # x0,y0,x1,y1 — cone band rows incl. valance edge
a = Image.open(sys.argv[1]).convert('RGB').crop(band)
b = Image.open(sys.argv[2]).convert('RGB').crop(band)
w, h = a.size
out = Image.new('RGB', (w, h*2 + 24), (0, 0, 0))
out.paste(a, (0, 0))
out.paste(b, (0, h + 24))
d = ImageDraw.Draw(out)
d.rectangle([0, h, w, h+24], fill=(40, 40, 40))
d.text((8, h + 6), "A = BEFORE (top)   |   B = AFTER v2 (bottom)", fill=(255, 255, 255))
out = out.resize((w*3, (h*2+24)*3), Image.NEAREST)
out.save(sys.argv[3])
print(f"saved {sys.argv[3]} {out.size}")
