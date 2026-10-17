# MyPet — first-version website

A responsive, premium-styled static website prototype for pet profiles, care notes, and interactive sound sketches.

## Files
- `index.html` — page structure and original inline SVG hero illustration
- `styles.css` — responsive styling and motion
- `script.js` — pet profile form, local storage, care notes, and synthesised sound sketches

## How to preview locally
1. Download and unzip `mypet-website.zip`.
2. Open the `mypet_website` folder.
3. Double-click `index.html` to open it in a modern browser.
4. Try the cat, dog, and bird sound buttons; add a pet profile; save a care note.

No build step is required. The site uses browser-native HTML, CSS and JavaScript.

## Important prototype limitations
- Pet profiles and care notes are stored in `localStorage` on this browser/device only. They are not private cloud accounts, synced, or backed up. Do not use this prototype to store sensitive records.
- Sound effects are generated in the browser with the Web Audio API. They are playful synthesised approximations, not authentic animal recordings.
- The original dog hero art is an inline SVG. Pet cards use standard emoji illustrations. Google Fonts are loaded from Google Fonts when online; fallback fonts are included.
- This is not a veterinary product and does not diagnose or treat animals.
- No external animal photographs or third-party sound recordings are bundled, so the prototype does not depend on unverified media licenses.

## Publish free with GitHub + Cloudflare Pages
1. Create/sign in to a GitHub account at https://github.com/.
2. Create a new repository, e.g. `mypet-website`. A public repository is simplest for a first deploy; do not upload private/personal data.
3. Upload `index.html`, `styles.css`, and `script.js` to the repository root (the top level, not inside another nested folder). You can use GitHub's web interface: Add file → Upload files → commit changes.
4. Create/sign in to a Cloudflare account at https://dash.cloudflare.com/.
5. Open Workers & Pages → Create application → Pages → Connect to Git.
6. Connect GitHub and select the `mypet-website` repository.
7. For a plain static site, choose no framework / static HTML if prompted. Set the production branch to `main`. Build command can be left blank if accepted, or use `exit 0`. Set build output directory to `/` or the repository root as the dashboard UI permits.
8. Click Save and Deploy. Wait for the deployment to finish. Cloudflare will provide a `*.pages.dev` URL.
9. Open that URL on your phone and laptop. Test navigation, sound buttons, profile creation, and care-note saving.
10. For future updates, upload/commit changed files to GitHub; Cloudflare Pages will redeploy from the connected repository.

Official docs:
- Cloudflare Pages Git integration: https://developers.cloudflare.com/pages/get-started/git-integration/
- Cloudflare static HTML deployment: https://developers.cloudflare.com/pages/framework-guides/deploy-anything/
- Browser audio behavior: https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay

## Before a real public launch
Add a proper privacy notice, assess applicable privacy/data rules, test keyboard and screen-reader use, verify all content, and implement secure server-side storage only if you later need accounts/sync. Keep the sound opt-in; browsers may block autoplay until a user interacts with the page.
