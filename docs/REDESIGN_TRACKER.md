# REDESIGN TRACKER

Implementation state for the redesign. Read with `REDESIGN_BLUEPRINT.md` (direction) and `FRONTEND_AUDIT.md` / `BACKEND_AUDIT.md` (existing system). Last updated: 2026-10-04.

## Roadmap
| Phase | Scope | Status |
|---|---|---|
| 1 | Foundation + Critical Fixes | COMPLETED |
| 2 | Product Shell + Navigation | COMPLETED |
| 3 | Public Product Experience ("Engineering Broadsheet") | **COMPLETED / APPROVED** — established public design language; do not redesign |
| 4A | Product Workflows & UX — auth, reader space, comments, publishing, admin console, archive view modes, Reading Map, Save for later | **IMPLEMENTATION COMPLETE / MANUAL REVIEW PENDING** |
| 4B | Interface Art Direction — material system (paper / glass / workshop), motion refinement | next |
| 5 | Competition Polish + Final QA | later |

The user does the main manual UI testing. Per phase: implement, run the production build, update this tracker, stop. No large browser/API suites; never write to the user's database for testing.

## Current Objective
User's manual review of Phase 4A (checklist below). Then Phase 4B (materials + motion) on instruction.

## Next Action — Phase 4A manual checks
**Restart the API first** (new endpoints: `/api/user/saved*`, `/api/comment/activity`; `savedPosts` field).
- Auth: sign in / sign up (validation, wrong password, duplicate email/username, success → back to the page you came from), Google, already-signed-in redirect.
- Article: Save for later (signed in/out), Reading Map on desktop (collapse, active section, click to jump) and phone (floating control → bottom sheet), Copy link, code-block copy.
- Discussion: post, reply, edit, delete (with/without replies), Helpful toggle + count, signed-out prompts, long text on a phone.
- Archive: Visual / Compact switch (persists for the session), filters, load more, phone layout.
- Reader space (`/dashboard` as a reader): Continue reading / Recently read (this device), Saved, Activity (your comments, marked helpful), Account (save, avatar, sign out, delete with typed confirmation).
- Publishing console (`/dashboard` as admin): totals, recent lists, Posts (search, edit, delete), Discussion (delete), Readers (remove; not yourself), Account.
- Editor (`/createPost`, `/update-post/:id`): title, toolbar (styles, marks, lists, quote, code block, link dialog, image upload + alt text, undo/redo, More menu), cover upload/replace, validation, unsaved-changes guard, publish/update → article. Check that an older article opens and saves unchanged.
- Phones (360–430px) for every surface above; both themes.

## Phase 4A — backend decisions (documented before implementation)
Inspection: Comment already persists likes (`likes[]`, `numberOfLikes`, `PUT /api/comment/likeComment/:id`), so **comment appreciation needs no backend change** (UI term: "Helpful"). Nothing exists for saved posts, a user's own comments/appreciations, or reading history.
- **Save for later — additive.** `User.savedPosts: [String]` (post ids, default `[]`). `GET /api/user/saved` (auth): the reader's saved posts, newest saved first. `PUT /api/user/saved/:postId` (auth): toggle; returns `{ saved, savedPosts }`. Both are declared before `GET /api/user/:userId`. Existing user responses simply gain a `savedPosts` array.
- **Reader activity — additive.** `GET /api/comment/activity` (auth): `{ comments, appreciated }`, the reader's 20 most recent comments and the 20 most recent comments they marked helpful, each with `post: { title, slug }`. Read-only; no schema change.
- **Reading history / continue reading — no backend.** Stored on the reader's device (localStorage: slug, title, image, category, furthest progress, timestamp; max 12 items; writes throttled and on leave). Labelled "on this device". Zero database writes, private by default. Cross-device sync is deferred (it would need a per-user history collection or array and write throttling).
- Dependency: `@tiptap/extension-image@3.20.5` (required for V1 inline images; uploads reuse `POST /api/post/upload-image`). `@tiptap/extensions` declared explicitly (already present via StarterKit) for Placeholder.

## Next Action — manual review checklist (Phase 3)
- Home in both themes at phone / tablet / desktop: masthead, lead story + "Also new", Latest writing grid, topics, projects strip, archive CTA. "Long reads" only shows when ≥2 recent posts are ≥5 min.
- /search: search, topic chips (horizontal scroll on phones), Latest/Oldest, clear filters, empty result, Load more (needs >9 posts), sticky toolbar under the header.
- Post page on several real articles: title scale, cover, prose (headings, lists, code blocks, quotes, links, inline images incl. wide images on desktop), "On this page" (only when the post has ≥3 H2s: sidebar ≥1280px, collapsible above), reading progress, Copy link, Discussion block, related posts.
- About and Projects (incl. /projects#id deep links from Home).
- Article images: crops/aspect ratios look right for your real covers.

---
# PHASE 4A RECORD

## Surfaces
- **Auth** (`pages/SignIn.jsx`, `SignUp.jsx`, `components/auth/AuthLayout.jsx`, `components/OAuth.jsx`): one focused column (identity → form → "or" → Google → switch link). Client validation, friendly server errors (duplicate email/username mapped), password show/hide, no artificial delay, return-to-origin (`location.state.from`), success notice after sign-up, already-signed-in redirect. `getAuth()` now runs on click, so the page renders without Firebase config. Contracts unchanged.
- **Discussion** (`components/comments/*`): composer with counter (200) and ⌘/Ctrl+Enter; signed-out prompt; skeleton / error + retry / "Start the discussion" empty state; threads on rules (no boxes); one-level replies; "Helpful" toggle (aria-pressed, count, pending, error); inline edit/reply with errors; delete via Modal with soft-delete explanation; Publisher / You badges; authors cached per user id.
- **Save for later** (`components/reader/SaveButton.jsx`): byline + article footer; persisted (see backend); synced into the stored user (`setSavedPosts`).
- **Reading Map** (`components/reader/ReadingMap.jsx`) replaces "On this page": ≥1280px a sticky collapsible companion (position n / N, progress, H3s under the active section, 2-line clamp); below that a small floating control shown only while the article body is on screen, opening a bottom sheet (`Drawer side="bottom"`). Active section tracked on scroll; jumps are smooth (instant with reduced motion) and focus the heading.
- **Archive** (`pages/Search.jsx`): Visual (default) / Compact switch (`aria-pressed`, sessionStorage). Visual = image-led story rows (phone: full-width 16:9 image above the text); Compact = typographic index. Lead story kept in Visual on the unfiltered newest view.
- **Reader space** (`components/workspace/ReaderSpace.jsx`): Overview (Continue reading + Recently read from device history, Saved from the account), Activity (your comments, comments you marked helpful), Account. Onboarding empty states, no zero counters.
- **Publishing console** (`components/workspace/AdminConsole.jsx`): Overview (real totals + "+N in the last 30 days", quick actions, latest articles, recent discussion), Posts (search, view/edit/delete), Discussion (delete with quote preview), Readers (remove, not self), Account. Tables become stacked records under 768px. Charts removed (no history data).
- **Account settings** (`components/workspace/AccountSettings.jsx`, readers + publisher): avatar upload, username/email/password with validation and save feedback, sign out, separated danger zone (type username to delete).
- **Publishing** (`components/publishing/PostForm.jsx`, `components/PostEditor.jsx`, `pages/CreatePost.jsx`, `UpdatePost.jsx`): sticky action bar (back, status / unsaved changes, Cancel, Publish / Update); serif auto-growing title; editor canvas uses the reader `.prose` styles; toolbar groups (text-style select, marks, blocks, link/image, undo/redo, More menu for colours / clear) that scroll horizontally on phones; link and image modals; inline image upload with progress / error / alt text; side panel (topic, cover upload / replace, words, reading time, address preview); validation, unsaved-changes guard (beforeunload + discard dialog).
- Shell: account links → "My A2D / Activity / Account settings" (reader) or "Publishing console / New article / Account settings" (admin); legacy `?tab=profile|dash` mapped; editor routes are footer-less; guards return users to where they came from.

## Structural decisions
- New CSS layer `styles/workspace.css`; `.pc--row` redesigned as the image-led story row; `Drawer` gained a bottom-sheet variant.
- New shared helpers: `utils/http.js` (`requestJSON` + friendly errors), `utils/readingHistory.js`, `components/workspace/WorkspaceLayout.jsx` (`ConfirmDialog`, `useNotice`, `PanelHeader`), `usePostIndex` (id → title for comment lists).
- Comment edit stays available to admins (existing behaviour); Edit/Delete are text actions, not icons.
- Removed legacy: `Comment.jsx`, old `CommentSection.jsx`, `DashSidebar`, `DashProfile`, `DashPosts`, `DashUsers`, `DashComments`, `DashboardComp` (Chart.js no longer imported; `chart.js` / `react-chartjs-2` packages can go in Phase 5).

## Backend changes (additive; documented above before implementation)
- `User.savedPosts` + `GET /api/user/saved`, `PUT /api/user/saved/:postId`; `GET /api/comment/activity`. No existing route or response shape changed.

## Known limits / deferred
- Reading history is per device (no sync). The comment author lookup is still one cached request per author (the API doesn't embed authors). The admin comment list labels articles via a one-off archive fetch (fine at this scale).
- No forgot-password / email verification (not supported by the backend).
- Deferred to 4B: materials (paper / glass / workshop), richer motion and transitions, editor floating controls.
- Build ✅. Lint: only the known `react/prop-types` rule and fast-refresh warnings. Read-only inspection (own Vite :5174, GET only, a mocked signed-in user in localStorage for the editor, no submissions): sign-in 390/1440, archive 390, article Reading Map 1440 + phone control 390, editor 1440/390 — no page errors, 0 overflow after fixing an editor toolbar overflow on phones.

---
# PHASE 3 RECORD

## Redesigned surfaces
- **Home** (`pages/Home.jsx`): publication masthead (statement, description, search) → lead story (`feature`) + 3 supporting (`row`) → Latest writing grid → Browse by topic (categories actually used in recent posts) → Long reads (longest recent posts by read time, only if ≥2 are ≥5 min) → Projects & case studies (3) → Explore the archive (real `totalPosts`). Three.js, session clock, stats counters, LIVE/telemetry, glitch and portfolio CTA removed.
- **Posts / Search** (`pages/Search.jsx`): archive page header + large search, sticky toolbar with URL-driven topic chips and a Latest/Oldest segmented control, results summary + Clear filters, lead story on the unfiltered newest-first view, card grid, skeleton / empty / error / load-more states (with loading + error feedback). Same API params as before.
- **PostCard system** (`components/content/PostCard.jsx`): one component, variants `feature`, `card`, `row`, `compact` (numbered); whole card is one stretched link; derived excerpt, date, read time; Cloudinary-sized images; `PostCardSkeleton`. `TopicLinks` chips component.
- **Post detail** (`pages/PostPage.jsx`): back link, topic, large title, byline (publisher, date, read time, "Updated" when edited >1 day later), 16:9 cover at 960px, 720px `.prose` column, table of contents from H2/H3 (sticky sidebar ≥1280, collapsible otherwise), reading progress, topic + Copy link footer, Discussion band (existing CommentSection, unchanged inside), related posts (same category first, topped up with latest), document title, skeleton / not-found / error states.
- **Article typography** (`styles/article.css`): 18–20px Inter body, 1.75 line height, H2/H3 hierarchy with anchor scroll offset, lists, callout-style blockquotes, inline code + code blocks, tables (scroll wrapper), inline images centred and allowed to break out to 960px on desktop, figcaptions, hr, highlights.
- **About**: publication-first page (tagline, what it covers → topic links, how it's written, short publisher note with links). No stats or résumé content.
- **Projects**: case-study list (area, name, what it is, how it was built, stack, links). A2D links to itself ("You're reading it"); no LIVE badges.

## Structural decisions
- New CSS layers: `styles/content.css` (cards, grids, chips, search bar, page header), `styles/pages.css` (Home/Discover/About/Projects), `styles/article.css` (post + prose). Legacy glitch/live/sec-divider/`.post-content` CSS removed from `index.css`.
- Type scale extended in `tokens.css`: `--text-display` 38→72, `--text-title` 34→60, `--text-page` 34→48, `--text-section` 26→36, `--text-card` 19→24, `--text-article` 18→20, `--text-meta` 13px; `--tracking-display`, `--container-media` 960px.
- Derived-only content: excerpts from paragraph text, read time, topics from real categories, related = same category + latest. No featured flags, views or popularity.
- Shared data: `constants/projects.js` (from the original Projects copy, split into summary/built), `constants/site.js` (name, tagline, description, publisher). `getCategoryLabel` added to `constants/categories.js`.
- Helpers: `utils/posts.js` (`fetchPosts`, `postPath`, `PAGE_SIZE`), `utils/content.js` (`excerpt`, `formatDate`, `imageUrl` Cloudinary transforms, `prepareArticle` heading ids / lazy images / external-link rel / table wrappers).
- Removed: `components/PostCard.jsx`, `components/CallToAction.jsx`, `utility/stats.jsx` (Home/About no longer show stats; `/api/stats` untouched).
- JS bundle 1.83 MB → 1.21 MB (Three.js no longer imported; `three` still in package.json — remove in Phase 5).

## Motion pass (after user review: "too static")
- `styles/motion.css` (imported last in `index.css`) holds the public interaction language; no new dependency.
- Brand `[A2D]`: brackets part ±3px and turn accent, the wordmark gets a one-pass accent sweep on hover/focus (replaces the old glitch).
- Home masthead: pointer-following spotlight over the hero grid (`components/motion/usePointerSpotlight.js`, rAF-throttled CSS vars). Only for fine hover pointers without reduced motion; fades out when the pointer leaves; nothing loops.
- Headline: one-time entrance; "written clearly." wipes in and an accent underline draws once. The kicker, lead and search fade up in sequence.
- Section entrances: `components/motion/Reveal.jsx` (IntersectionObserver, fires once) on Home sections below the lead, About sections, Projects case studies and post "related" posts. Cards and tiles stagger via `--i`.
- Micro-interactions: card image drift + bottom shade + shadow, title underline sweep (existing), compact-row index highlight, topic chip lift/press, segmented press, search icon wakes on focus with a deeper field shadow, nav active underline grows in, footer link underline slide, case-study link arrows, copy-link icon pop.
- Gating: all entrances and the spotlight sit under `prefers-reduced-motion: no-preference`; hover effects under `(hover: hover)`. The global reduced-motion rule still neutralises everything else.
- Also fixed: `/projects#id` deep links from Home now scroll to the case study (the shell's scroll-to-top had cancelled the hash).

## Art direction v2 — "the engineering broadsheet" (supersedes the cyan/grid look)
- **Colour:** warm paper/ink foundations (light: newsprint `#f1eee6` + ink `#17171b`; dark: graphite `#111113` + paper `#eeeae1`). Brand ultramarine (`#2b36d9` light / `#8c93ff` dark), secondary vermilion `--color-accent-2`, inverse band tokens `--color-inverse*`, `--color-glass`, night code-block tokens. All text pairs ≥4.5:1. No cyan anywhere.
- **Type:** `--font-display` = Instrument Serif (Google Fonts, roman + italic) for statements, page/article titles, card and section heads; Inter for UI and reading; JetBrains Mono only for technical labels (dates, indices, captions). Orbitron dropped (legacy auth/dashboard styles that name it fall back until Phase 4).
- **Three.js — "The Lattice"** (`components/motion/HeroSculpture.jsx`, lazy `import()` → own chunk ~129 KB gz): subdivided-icosahedron node/edge lattice with ~10 face "shards" lifted off the surface (1 in 7 vermilion), an octahedral core and a dashed orbit. Scrolling reassembles the shards; a fine pointer tilts it; very slow ambient drift only while visible. On-demand rendering, pauses off-screen / hidden tab, DPR cap, lighter build on touch (no drift, no pointer), a static frame under reduced motion; colours follow the theme tokens live.
- **Home:** asymmetric hero (serif headline overlapping the lattice, glass search on a rule, real dateline + counts, "Fig. 01" caption) → lead story with an overlapping text plane → numbered "Also new" → asymmetric feature + stack → typographic index → inverse topic band (big serif topic index) → long reads → hard-edged "From the workshop" cards (the one neo-brutalist moment) → giant "Read *everything* →" archive link.
- **Archive:** serif header, line search, text topic tabs + "Latest / Oldest" toggle on a glass sticky bar; unfiltered = lead + two stories + typographic index; filtered = story rows with thumbnails.
- **Article:** serif opening and H2s, vermilion topic marker, drop cap, callout vs. single-paragraph pull quote, "§" section breaks, night code blocks with a label bar + Copy button (`prepareArticle` wraps `<pre>`, delegated click in PostPage), 1100px cover / wide images.
- **About / Projects / shell:** serif page titles with italic accents, Swiss rules, serif wordmark between mono vermilion brackets (brackets open on hover), glass header, serif footer sign-off.
- **Motion** (`styles/motion.css`), three categories: ambient (lattice), interaction (card image ease, headline underline, index-row shift, workshop hard-shadow lift, arrows, press states), narrative (one-time hero line rise + full-stop pop + lattice fade, `Reveal` sections). Pointer spotlight hook removed.
- Files: `styles/{tokens,base,content,pages,article,motion,shell}.css`, `pages/{Home,Search}.jsx`, `components/content/PostCard.jsx` (variants lead/feature/card/row/index/compact), `components/motion/HeroSculpture.jsx`, `components/shell/Footer.jsx`, `utils/content.js`, `client/index.html` (fonts).
- Inspection: production build ✓; screenshots reviewed (Home dark/light 1440 + 390, workshop/archive section, archive, article light 1440 + 390 dark), no page errors, no overflow at those sizes. Tuned from review: fewer/smaller shards, lattice offset right on wide screens, caption placement, lead headline size.

## Deferred / known
- Comments UI is still legacy styled inside the new Discussion band (Phase 4).
- Editor heading/prose styles don't match the new `.prose` yet (Phase 4 Create/Edit).
- No code-block syntax highlighting or copy buttons (possible Phase 5).
- `three` is used again (lazy chunk); main-bundle size warning remains (Phase 5).

## Validation (Phase 3)
- ✅ Production build succeeds; eslint on Phase 3 files clean apart from the project-wide `react/prop-types` rule.
- ✅ Tiny targeted check (own Vite on :5174 against the user's running API, GET requests only, no data written): Home, /search, a real post, /about, /projects at 360px (light) and 1280px (dark): 0 horizontal overflow (the old Home 360/375 overflow is gone), no page errors. Screenshots of Home (desktop) and a post (phone) reviewed. Fixes from that review: excerpts no longer merge headings into text; post header back link / topic spacing; blockquote top spacing.
- ✅ Motion pass: production build succeeds, eslint clean (apart from prop-types). No browser checks run, per instruction.
- ⚠️ Manual visual/responsive review by the user is pending (checklist above), including the motion pass: brand hover, hero spotlight (desktop mouse), headline entrance, scroll reveals, reduced-motion OS setting, phone behaviour.

---
# PHASE 2 RECORD (completed — user approved)

## Completed Work
- **AppShell** (`components/shell/AppShell.jsx`): skip link → sticky Header → `<main id="main-content">` → Footer. On pathname change it scrolls to top and focuses `<main>`; this replaces `ScrollToTop`. "Focus routes" (`/signin`, `/signup`, `/dashboard`) render without the footer. The shell adds no page padding; pages own their spacing via `ui-container`/`<Container>`.
- **Header** (`components/shell/Header.jsx`):
  - Brand wordmark `[A2D]` (the only display-font use) and primary nav from real routes: Home, Posts (`/search`, also active on `/dashboard/post/*`), Projects, About.
  - Active route marked with an accent underline and `aria-current`.
  - Search: inline field at ≥1024, icon link to `/search` at 768–1023, inside the drawer below 768. It keeps Search-page filters when used on `/search`.
  - Theme toggle with an action label.
  - Account: "Sign in" when signed out; otherwise an avatar button opening the account menu (identity, Admin badge, role-based links, Sign out). Admin links: Dashboard, New post, Profile; reader: Profile.
- **Mobile navigation:** right-side Drawer (dialog with focus trap, Escape, backdrop, scroll lock), containing search, primary nav, and an account section or Sign in / Create account. It closes on route change and when the viewport grows to ≥768. Focus returns to the menu button on dismiss; after navigation it moves to `<main>`.
- **Footer** (`components/shell/Footer.jsx`): brand + real tagline, Explore (the primary routes), Connect (GitHub, LinkedIn, Portfolio, marked as new-tab), copyright. Placeholder "Privacy/Terms" `#` links and the duplicate social row removed; one portfolio URL.
- **New primitives:** `Menu` / `MenuItem` / `MenuSeparator` / `MenuHeader` (WAI-ARIA menu button: arrow keys, Home/End, Escape returns focus, Tab and outside click close, closes on route change); `Drawer`; shared `useDialog` hook (focus trap/restore, Escape, scroll lock), which `Modal` now uses too.
- Shared shell modules: `navigation.js` (nav items, external links, account links, focus routes), `useSignOut.js` (same `POST /api/user/sign-out` contract), `Brand.jsx`, `ThemeToggle.jsx`.
- `--header-height` is now 56px on phones and 64px from 768px up.
- Compatibility only (no redesign): the Search filter bar and the DashSidebar mobile topbar now stick below the header (`top: var(--header-height)`, `z-index: var(--z-sticky)`) instead of at `top: 0` under it.

## Files/Areas Changed
- New: `client/src/components/shell/{AppShell,Header,Footer,Brand,ThemeToggle}.jsx`, `shell/{navigation,useSignOut}.js`, `components/ui/{Menu,Drawer}.jsx`, `components/ui/useDialog.js`, `styles/shell.css`.
- Edited: `App.jsx` (routes wrapped in AppShell), `components/ui/{Modal.jsx,index.js}`, `styles/{ui,tokens}.css`, `index.css` (imports shell.css), `pages/Search.jsx` and `components/DashSidebar.jsx` (sticky offset only), `pages/dev/UiPreview.jsx` (no nested `<main>`).
- Removed: `components/Header.jsx`, `components/footer.jsx`, `components/ScrollToTop.jsx` (superseded).
- Backend: no changes.

## Important Decisions
- **Breakpoints for the shell:** <768 drawer; ≥768 inline nav + account; ≥1024 inline search. No other shell media queries.
- **Mobile nav pattern:** Drawer rather than a dropdown panel. It gives modal behaviour (no background interaction), room for search and account, and Phase 5 can reuse it for dashboard mobile nav.
- **Account entry:** a single avatar menu; admin tools live inside it rather than as header buttons, so readers see a calm header. Mobile mirrors the same links in the drawer.
- **No footer on focus routes:** auth and dashboard keep the header for orientation but skip the footer, because their pages are full-viewport layouts (Phases 4/5 redesign them).
- **Route-change focus** goes to `<main>` (not on first load); `ScrollToTop` was folded into AppShell.
- Route declarations (`/About`, `/Projects`, `/SignIn`…) left as-is: React Router matches case-insensitively and links use lowercase.

## Known Issues / Deferred Items
- **Home at 360/375px overflows horizontally (+31px / +16px)** because of Home's legacy `// resources · LIVE krithik01.onrender.com` divider (`.sec-divider-right`). Not caused by the shell (header/footer measured flush at all widths). Remove in the Phase 3 Home redesign (it's fake-telemetry decoration).
- **Dashboard (Phase 5):** the DashSidebar desktop sidebar is `height: 100vh` under the header, so it scrolls with the page. Its mobile topbar still duplicates brand + hamburger alongside the site header and still renders as a side column (audit bug). Only its sticky offset was adjusted.
- Auth pages keep their own full-screen amber layout and fixed CRT overlay (which also covers the header) until Phase 4.
- Avatar images use `alt=""` (the accessible name is on the button); broken avatar URLs show the browser's broken-image glyph.
- Existing Phase 1 items below remain open.

## Validation Status (Phase 2 — lightweight, as requested)
- ✅ Production build succeeds. `eslint` on shell/ui files: no errors other than the known project-wide `react/prop-types` rule.
- ✅ Focused headless-Chrome shell check, **24 passing** (own Vite on :5174 proxied to the user's running API; read-only public calls; signed-in state mocked in localStorage, no accounts created):
  - header/nav/main/footer render, real nav items, Home active; nav click → `/search` with Posts active and focus on `<main>`; header search → `?searchTerm=`
  - theme toggle; no footer on `/signin`; nav collapses at 360/375/414
  - drawer: opens as a labelled dialog with focus inside and scroll locked; Escape closes and returns focus; closes after navigating with focus on `<main>`; admin account links; panel, close button and badge inside the viewport with a long username
  - 768/1024/1440: no overflow, account control shown; account menu opens with focus on the first item, ↓ moves, Escape returns focus to the avatar, fits the viewport; sign out from the menu; no page errors
- ⚠️ 2 checks fail by design of the check: Home overflow at 360/375, traced to the legacy Home divider (above). `/search`, `/about` and `/projects` measure 0 overflow at 360px.
- ✅ Screenshots reviewed: desktop dark/light, tablet 768, account menu, mobile drawer (signed-in admin, long name).
- ⚠️ Not verified: real devices / touch, iOS Safari, 820/912/1920 widths, real signed-in reader account, screen-reader output.
- ⚠️ Incident: while starting validation, my seed request hit the user's already-running API on :3000 and created one test user (`administratorwithalongname`, non-admin). It was deleted via its own self-delete endpoint minutes later (delete 200; sign-in now 404). No other data was written.

---
# PHASE 1 RECORD (completed)

## Completed Work
- **Backend (approved audit fixes L1–L4):**
  - L1 `updateUser`: always responds and sets only the fields sent; username max length uses `.length`.
  - L2 `getusers`: `.skip(startIndex)` (the old `skip({startIndex})` was ignored, so "Load more" repeated page 1); month maths fixed.
  - L3 `express.json({ limit: '2mb' })`.
  - L4 `/api/auth/google` verifies the Firebase ID token (`api/utils/verifyFirebaseToken.js`, no new dependency); identity comes only from the token.
- **Frontend contract / critical fixes:**
  - OAuth sends `{ idToken }`; absolute API paths.
  - Search sends `order`, defaults to "All categories", says "Showing N"; shared `constants/categories.js`.
  - Dashboard reads the real `lastMonthusers` / `lastMonthsPosts` keys, comments `sort=desc`, StatCard `color-mix`, post links fixed, default tab.
  - Comment error messages and soft-delete thread handling; global 401 → clear stale user (`utils/authInterceptor.js`).
  - Read time from words; `CallToAction` restored (it had been an OAuth copy); Projects title bug; theme pre-paint in `index.html` (persisted → OS → dark).
- **Design foundation:** `styles/tokens.css` (semantic colours for both themes, fluid type scale, spacing, radius, containers, motion, z-index, breakpoints), `styles/base.css` (base, focus-visible, reduced motion, containers, typography roles), `styles/ui.css`. `index.css` import order and legacy token aliases.
- **Primitives** (`components/ui/`): Button, Field/Input/Textarea/Select, Card, Badge, Alert, Spinner, Skeleton, EmptyState, Modal, Container, SectionHeader. Dev-only `/__ui` reference page.

## Backend Changes Made (all phases so far)
- Only the approved contract change: `POST /api/auth/google` body is `{ idToken }` (response unchanged). Optional env `FIREBASE_PROJECT_ID` (defaults to `mern-blog-3c52d`). The server needs outbound HTTPS to `www.googleapis.com`.

## Important Decisions (foundation)
- Styling: CSS variables + global `ui-`/`shell-` prefixed classes; no runtime `<style>` injection in new code; Tailwind kept only for preflight.
- Breakpoints sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536 (documented in `tokens.css`).
- Legacy aliases: `--text-muted` → secondary, `--text-faint` → muted. Body text is 16px.
- Accent: dark `#22d3ee`, light `#0e7490`; text tokens ≥4.5:1, focus ring ≥3:1. Input borders are ~1.6:1 (focus ring compensates; revisit in Phase 7).

## Known Issues / Deferred (still open)
- `client/package-lock.json` had uncommitted changes before Phase 1 (not ours; untouched).
- Lint debt: the `react/prop-types` rule is enforced but no component uses PropTypes, plus other pre-existing errors. Decide in Phase 7.
- Sign-in/up crash without `VITE_FIREBASE_API_KEY` (`getAuth` at render). Phase 4.
- JS-driven animation (Three.js, canvases, typing) ignores reduced motion. Phases 3/4/6.
- Synthetic dashboard chart data (Phase 5); legacy per-page `<style>` blocks and hardcoded colours (replaced per phase); 1.8 MB bundle (Phase 7); optional backend improvements from the audit not done.
