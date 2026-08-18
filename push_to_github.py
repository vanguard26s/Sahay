"""
Helper script to push local disaster management repository to GitHub.
Usage:
    python push_to_github.py <GITHUB_PERSONAL_ACCESS_TOKEN>
Or:
    python push_to_github.py
    (and it will prompt for the token securely)
"""
import sys
import getpass
import dulwich.porcelain as dp

REPO_DIR = r"c:\Users\online\SIH"
TARGET_URL = "https://github.com/vanguard26s/sahay-.git"
USERNAME = "vanguard26s"

def main():
    if len(sys.argv) > 1:
        token = sys.argv[1].strip()
    else:
        token = getpass.getpass("Enter your GitHub Personal Access Token (ghp_...): ").strip()

    if not token:
        print("Error: No token provided.")
        sys.exit(1)

    auth_url = f"https://{USERNAME}:{token}@github.com/vanguard26s/sahay-.git"
    print(f"Staging latest changes in {REPO_DIR}...")
    dp.add(REPO_DIR)
    
    status = dp.status(REPO_DIR)
    if status.staged.get('add') or status.staged.get('modify') or status.staged.get('delete'):
        commit_id = dp.commit(REPO_DIR, message=b"Update disaster platform code", author=b"vanguard26s <vanguard26s@users.noreply.github.com>")
        print(f"Committed changes: {commit_id}")

    print("Pushing to https://github.com/vanguard26s/sahay-.git (branch: main)...")
    try:
        dp.push(REPO_DIR, auth_url, "refs/heads/main:refs/heads/main")
        print("\nSUCCESS: All files successfully pushed to https://github.com/vanguard26s/sahay-.git!")
    except Exception as e:
        print(f"\nPush failed: {e}")
        print("Please verify that your GitHub token has 'repo' or 'contents:write' permissions.")

if __name__ == "__main__":
    main()
