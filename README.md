# GitHub Pages

<img src="https://octodex.github.com/images/Professortocat_v2.png" align="right" height="200px" />

Hey ImpashreeShetty!

Mona here. I'm done preparing your exercise. Hope you enjoy! 💚

Remember, it's self-paced so feel free to take a break! ☕️

[![](https://img.shields.io/badge/Go%20to%20Exercise-%E2%86%92-1f883d?style=for-the-badge&logo=github&labelColor=197935)](https://github.com/ImpashreeShetty/responsible-individuals-website/issues/1)

---

&copy; 2025 GitHub &bull; [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md) &bull; [MIT License](https://gh.io/mit)

## Instagram Feed Setup

The homepage now showcases the latest Instagram posts. To wire it up with live data:

1. Create an Instagram Basic Display / Graph API app and generate a long-lived token with the `user_media` scope.
2. Look up the Instagram user ID for `@responsibleindividuals`.
3. Configure the Netlify site (or your hosting provider) with:
   - `INSTAGRAM_USER_ID=<numeric-id>`
   - `INSTAGRAM_ACCESS_TOKEN=<long-lived-token>`
4. Redeploy the site. The `/instagram-feed` serverless function will proxy the API and the homepage grid will hydrate automatically.

If the credentials are missing, the site falls back to a set of curated sample posts.

