# Context
Whoop-style PWA (Recovery / Strain / Sleep) over my own Garmin API.
Stack: Vite + React + TypeScript + vite-plugin-pwa + Recharts. Deploy: GitHub Pages.

# Rules (PUBLIC REPO)
- Zero secrets, tokens, credentials, or real health data in code, commits, or screenshots.
- The API key is entered by the user at runtime and stored in localStorage, never in code.
- Develop against mock data (src/mock/); demo mode when no key is set.
- Set Vite `base` to the repo name for GitHub Pages.
- Before every commit, check git status and git diff for anything sensitive.
