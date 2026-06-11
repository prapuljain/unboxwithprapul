UnboxWithPrapul v5 fix

What changed:
1. Fixed oversized article cards and thumbnails.
2. Added runtime duplicate protection in assets/js/main.js.
3. Added Clean duplicates button in studio.html.
4. Studio still supports editing posts, featured image upload, body image insertion, and file upload.
5. Main pages now use clean URLs: /news/, /reviews/, /guides/, /videos/, /about/, /contact/.
6. Old .html URLs redirect to clean URLs, so old links do not break.
7. Google Analytics ID G-RFV5RKYYF9 is kept from the old site.

Upload all files inside this folder to your GitHub repo root and commit.
After deployment, open https://unboxwithprapul.in and hard refresh with Ctrl+F5.
If data/posts.json still contains duplicates from previous publishes, open /studio.html, login, and click Clean duplicates.
