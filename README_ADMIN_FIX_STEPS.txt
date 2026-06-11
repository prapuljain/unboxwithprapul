UnboxWithPrapul Admin Fix v3

Upload the files inside this folder to your GitHub repository root.
Do not upload the folder itself.

What this fixes:
- Studio editor is hidden until GitHub token login.
- Login accepts only the GitHub user: prapuljain.
- Publish button is locked during publishing to stop duplicate commits.
- Same slug updates the article instead of creating duplicate posts.
- Article URLs become clean: /posts/article-slug/
- Old /posts/article-slug.html URLs redirect to the clean URL.
- Featured image upload works.
- Body image upload works.
- File-only upload works from Studio.
- Studio is noindexed and removed from public homepage text.
- Missing Apple Siri AI image is included.

After upload:
1. Commit changes.
2. Wait for GitHub Pages deployment.
3. Open https://unboxwithprapul.in/studio.html
4. Paste your GitHub fine-grained token.
5. Click Login and load posts.

Security note:
This is a static GitHub Pages site. The Studio page can be opened by URL, but nobody can publish without your GitHub token. For full private admin-page protection, move the site to Cloudflare Pages and enable Cloudflare Access for /studio.html.
