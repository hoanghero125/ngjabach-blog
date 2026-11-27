# **_NgJaBach Blog_**

> - Release: V2.1

**Website:** [_ngjabach.blog_](https://ngjabach.blog)

**Designed and Developed by:** _Đỗ Phạm Bảo Hoàng_ **_-_** [**_Dek_**](https://github.com/hoanghero125)

## Description

This is the source code for NgJaBach Blog, a personal blog of [**_Nguyễn Gia Bách_**](https://github.com/NgJaBach). The blog serves as a platform for sharing knowledge and insights about AI, machine learning, programming, and emerging technologies.

## Tech Stack

- **Framework:** Next.js 15 (Pages Router) with React 19 and TypeScript
- **API:** Next.js API routes in `src/pages/api` (no separate server)
- **Database:** MongoDB with Mongoose 8
- **Styling:** Tailwind CSS 4
- **Auth:** bcrypt password hashes, JWT session in an httpOnly cookie
- **Markdown:** react-markdown with GFM, KaTeX math, emoji and highlight.js. Raw HTML is sanitized.
- **Editor:** @uiw/react-md-editor with a live preview that uses the same renderer as the site
- **Hosting:** Vercel. Pushing to `main` deploys production, and every other branch or pull request gets a preview URL.

## Project Structure

```
scripts/
└── create-admin.mjs        # create the admin account / reset its password
src/
├── components/             # Navbar, Footer, ui/ (Button, Card, Badge)
├── context/                # AuthContext (session state), SearchContext, FooterAnimationContext
├── lib/
│   ├── auth.js             # session cookie, requireAuth wrapper, same-origin check
│   ├── blogs.js            # unique slugs, post ordering
│   ├── db.js               # cached MongoDB connection
│   ├── markdown.tsx        # shared markdown renderer (plugins, sanitizer, components)
│   ├── text.ts             # reading time, comment stripping
│   ├── validate.js         # API input validation
│   └── models/             # Blog, User, LoginAttempt
├── pages/
│   ├── index.tsx           # About me
│   ├── blog.tsx            # post list + search
│   ├── post/[slug].tsx     # a post
│   ├── admin.tsx           # post management (reorder, edit, delete)
│   ├── admin/              # login, create/edit post
│   └── api/                # auth/{login,logout,me}, blogs/{index,[id],reorder,slug/[slug]}
└── styles/
```

## Local Development

### Prerequisites

- Node.js 20 or newer, and npm (use npm, not yarn: the lockfile is `package-lock.json`)
- A MongoDB database (for example a free MongoDB Atlas cluster)

### Setup

```bash
git clone https://github.com/hoanghero125/ngjabach-blog.git
cd ngjabach-blog
npm ci                          # installs the exact versions from package-lock.json
cp .env.local.example .env.local
```

Fill in `.env.local`:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=a_long_random_string
```

Create the admin account (run it again later to reset the password):

```bash
npm run create-admin
```

### Run

```bash
npm run dev      # http://localhost:3000
npm run build    # production build, the same one Vercel runs
npm start        # serve the production build
```

## Making Changes

1. `git switch main && git pull`
2. `git switch -c feature/short-description`
3. Make the change, then check it with `npm run dev` and `npm run build`.
4. Commit, then `git push -u origin feature/short-description`.
5. Open a pull request into `main` and check the Vercel preview link that the bot posts.
6. Merge. Production deploys automatically.

Never run `npm audit fix --force`: it can install breaking or even older versions. Use plain `npm audit fix`, then check that the build still passes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
