"""
Helper script to push all backend and frontend code to GitHub.
Usage:
    python push_to_github.py <GITHUB_TOKEN>
Or set GITHUB_TOKEN environment variable.
"""
import os
import sys
import dulwich.repo as dr
import dulwich.porcelain as dp

REPO_DIR = os.path.dirname(os.path.abspath(__file__))

def push_all(token=None):
    if not token:
        token = os.getenv("GITHUB_TOKEN")
    if not token and len(sys.argv) > 1:
        token = sys.argv[1].strip()
    if not token:
        import getpass
        token = getpass.getpass("Enter GitHub Personal Access Token: ").strip()

    repo = dr.Repo(REPO_DIR)
    dp.add(REPO_DIR)
    head_sha = repo.head()
    print("Local HEAD commit:", head_sha.decode("ascii"))

    for repo_name in ["Sahay", "sahay-"]:
        url = f"https://vanguard26s:{token}@github.com/vanguard26s/{repo_name}.git"
        print(f"Pushing all files to {repo_name}...")
        client, host_path = dp.get_transport_and_path(url)

        def generate_pack_data(have, want, progress=None, ofs_delta=None):
            return repo.object_store.generate_pack_data(have, want)

        def determine_wants(refs):
            return {b"refs/heads/main": head_sha}

        client.send_pack(host_path, determine_wants, generate_pack_data)
        print(f"Successfully pushed all files to {repo_name} main branch!")

if __name__ == "__main__":
    push_all()
