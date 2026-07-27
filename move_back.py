import os
import shutil

source_dir = r"F:\PALASIDE"
dest_dir = r"e:\Project\รายงาน รอง"

items_to_move_back = [
    ".claude", ".codex", ".gemini", ".gitignore", ".impeccable", ".vercel",
    "1.jpg", "2.1.jpg", "2.jpg", "3.1.jpg", "3.jpg", "4.1.jpg", "4.jpg", 
    "5.1.jpg", "5.jpg", "6.1.jpg", "6.2.jpg", "6.jpg", "7.1.jpg", "7.2.jpg", "7.jpg",
    "M17.png",
    "lithos-hero",
    "รายงาน รอง.code-workspace",
    "code_artifact (1).html"
]

for item in items_to_move_back:
    source_path = os.path.join(source_dir, item)
    dest_path = os.path.join(dest_dir, item)
    
    if os.path.exists(source_path):
        try:
            if os.path.isdir(source_path):
                shutil.copytree(source_path, dest_path, dirs_exist_ok=True)
                shutil.rmtree(source_path)
            else:
                shutil.copy2(source_path, dest_path)
                os.remove(source_path)
            print(f"Moved back: {item}")
        except Exception as e:
            print(f"Failed to move back {item}: {e}")
            
print("Revert operation completed.")
