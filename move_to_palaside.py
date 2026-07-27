import os
import shutil

source_dir = r"e:\Project\รายงาน รอง"
dest_dir = r"F:\PALASIDE"

if not os.path.exists(dest_dir):
    os.makedirs(dest_dir)

# Move all files and folders
for item in os.listdir(source_dir):
    source_path = os.path.join(source_dir, item)
    dest_path = os.path.join(dest_dir, item)
    
    # Skip the script itself so it doesn't try to move itself while running
    if item == "move_to_palaside.py":
        continue
        
    try:
        # If destination already exists, we might need to overwrite or merge
        if os.path.exists(dest_path):
            if os.path.isdir(source_path):
                # For directories, copytree with dirs_exist_ok then remove source
                shutil.copytree(source_path, dest_path, dirs_exist_ok=True)
                shutil.rmtree(source_path)
            else:
                shutil.copy2(source_path, dest_path)
                os.remove(source_path)
        else:
            shutil.move(source_path, dest_path)
        print(f"Moved: {item}")
    except Exception as e:
        print(f"Failed to move {item}: {e}")

print("Move operation completed.")
