from PIL import Image, ImageDraw, ImageFont
import os

logo_path = r"C:\Users\hp\.gemini\antigravity\scratch\aabha-ai\sih_logo.png"
if os.path.exists(logo_path):
    img = Image.open(logo_path).convert("RGBA")
    w, h = img.size
    
    # Replace "2025" text area on the right side of the logo with "2026"
    draw = ImageDraw.Draw(img)
    # The "2025" is located at the bottom-right under SMART INDIA HACKATHON
    # White out the 2025 region
    draw.rectangle([int(w * 0.55), int(h * 0.65), w, h], fill=(255, 255, 255, 255))
    
    # Draw "2026" in bold dark blue
    try:
        font = ImageFont.truetype("arialbd.ttf", int(h * 0.28))
    except:
        font = ImageFont.load_default()
    
    draw.text((int(w * 0.58), int(h * 0.66)), "2026", fill=(27, 63, 139), font=font)
    img.save(r"C:\Users\hp\.gemini\antigravity\scratch\aabha-ai\sih_logo_2026.png")
    print("Updated SIH Logo to 2026.")
