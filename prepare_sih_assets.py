from PIL import Image
import os

src_path = r"C:\Users\hp\.gemini\antigravity\brain\8a43e704-f3e3-404c-a60d-3702e2e87b51\.user_uploaded\media_1787852889631.png"
if os.path.exists(src_path):
    img = Image.open(src_path)
    w, h = img.size
    
    # 1. SIH Logo (Top Right)
    logo = img.crop((int(w * 0.79), int(h * 0.03), int(w * 0.985), int(h * 0.20)))
    logo.save(r"C:\Users\hp\.gemini\antigravity\scratch\aabha-ai\sih_logo.png")
    
    # 2. Brain Lightbulb Graphic (Right Side)
    brain = img.crop((int(w * 0.55), int(h * 0.20), int(w * 0.88), int(h * 0.86)))
    brain.save(r"C:\Users\hp\.gemini\antigravity\scratch\aabha-ai\sih_brain.png")
    print("Assets extracted successfully.")
else:
    print("Source image not found.")
