# REDESIGN BLUEPRINT
## Developer Blog Platform — Product, UX & UI Redesign

**Document status:** Master redesign specification  
**Version:** 1.0  
**Purpose:** Persistent source of truth for Claude Code  
**Implementation model:** 7 controlled phases  
**Backend strategy:** Preserve existing backend wherever possible

---

# 1. PURPOSE

This document defines the product direction, UX philosophy, visual language, content experience, responsive behavior, design system and implementation strategy for the complete frontend redesign.

This is NOT a request to redesign the application randomly page-by-page.

The redesign must be executed according to this blueprint.

Claude Code must read this document before beginning any redesign work.

Claude must also read:

```text
/docs/REDESIGN_TRACKER.md
/docs/BACKEND_AUDIT.md
```

before implementation.

If the current implementation conflicts with this blueprint, inspect the actual code and determine whether the conflict is:

1. intentional legacy behavior,
2. an implementation problem,
3. a backend constraint,
4. or something that requires clarification.

Do not silently invent a new product direction.

---

# 2. PRODUCT DEFINITION

This application is an:

> Admin-centric developer blogging and knowledge-sharing platform.

The admin is the primary/only publisher.

Readers:

- discover posts
- read posts
- explore topics
- comment
- discuss
- interact with content

The platform is NOT:

- a general multi-author publishing platform
- Medium
- a Reddit clone
- a social network
- a portfolio with a blog attached
- a generic SaaS dashboard template

The product should feel like a serious, modern developer platform.

---

# 3. PRODUCT INSPIRATION

The platform should combine ideas from several product categories.

## Reddit

Use as inspiration for:

- content discovery
- discussion mentality
- topic/channel thinking
- reader participation
- making content feel alive

Do NOT copy:

- Reddit visual design
- Reddit layout
- subreddit mechanics
- user publishing model
- Reddit-specific interaction patterns

---

## Linear

Use as inspiration for:

- visual precision
- spacing
- typography
- restrained motion
- polished interactions
- dark/light theme quality
- product maturity

---

## Vercel

Use as inspiration for:

- technical credibility
- clean layouts
- developer-oriented presentation
- typography
- restrained visual language
- strong dark/light experiences

---

## GitHub

Use as inspiration for:

- developer information architecture
- discussions
- activity
- content organization
- useful information density

Do not copy its visual language.

---

## Notion

Use as inspiration for:

- long-form content hierarchy
- whitespace
- mixed-content presentation
- readable information structures

Do not turn the blog into a Notion clone.

---

# 4. DESIGN PERSONALITY

The final product should feel:

- modern
- mature
- technical
- creative
- comfortable
- confident
- polished
- slightly playful
- useful
- intentionally designed

It should NOT feel:

- like a final-year college project
- like a cyberpunk demo
- like a terminal emulator
- like an old admin dashboard
- like a generic Bootstrap template
- like Medium
- like Reddit
- like an AI-generated landing page

The design should have personality without sacrificing usability.

---

# 5. CORE DESIGN PRINCIPLE

## Meaningful design over decorative design.

Every visual element should have a reason.

Good:

- visual hierarchy
- meaningful badges
- contextual images
- reading progress
- useful metadata
- subtle hover states
- clear section separation
- useful animations
- contextual empty states

Avoid:

- fake telemetry
- fake system status
- decorative terminal text
- meaningless counters
- excessive glowing effects
- excessive borders
- constant animations
- decorative noise

The existing technical identity should be refined, not completely erased.

---

# 6. VISUAL IDENTITY TO PRESERVE

The following existing ideas are valuable and may be retained in refined form:

- dark technical identity
- accent-on-dark aesthetic
- bordered surface cards
- subtle accent-line treatment
- reading progress
- skeleton loading
- empty states
- comment experience
- 720px article reading column
- CSS-variable-based theme architecture
- existing theme switching behavior

Do not remove these merely for the sake of making the UI different.

---

# 7. VISUAL IDENTITY TO REMOVE OR REDUCE

Reduce or remove:

- fake telemetry
- fake session clocks
- excessive CRT effects
- excessive terminal decoration
- tiny 8–11px text
- Orbitron used everywhere
- excessive glow
- unnecessary Three.js decoration
- random animation
- decorative system labels
- meaningless technical badges
- fake statistics
- inconsistent button designs
- duplicated component styling

Technical personality should come from:

- typography
- information structure
- content
- diagrams
- code
- subtle visual details
- interaction quality

Not from visual noise.

---

# 8. TYPOGRAPHY

Typography must prioritize reading comfort.

## Primary body/UI font

Use a highly readable sans-serif such as Inter or the existing equivalent if already available.

Use it for:

- body text
- navigation
- buttons
- forms
- headings where appropriate
- dashboard content

## Monospace

JetBrains Mono or equivalent may be used for:

- code
- technical metadata
- small labels
- developer-oriented details

Do not use monospace for long paragraphs.

## Display font

Orbitron or a similar display font may remain only for:

- brand moments
- selected headings
- small identity elements

Do not use it throughout the application.

---

# 9. TYPOGRAPHY SCALE

Establish a consistent type scale.

Approximate direction:

| Role | Desktop | Mobile |
|---|---:|---:|
| Hero | 48–64px | 34–42px |
| Page heading | 36–44px | 28–34px |
| Section heading | 24–30px | 22–26px |
| Card heading | 18–22px | 17–20px |
| Body | 16–18px | 16px |
| Secondary | 14–15px | 14px |
| Metadata | 12–13px | 12px |

Exact values may be adjusted after implementation testing.

Never create arbitrary typography sizes page-by-page.

---

# 10. CONTENT WIDTH

Use consistent container rules.

Suggested foundation:

- reading content: approximately 720px
- standard content: approximately 1100–1200px
- dashboard: approximately 1200–1400px where useful
- full-width sections only when visually justified

Large desktop layouts must remain visually balanced.

Do not allow content to become awkwardly left-aligned on wide screens.

---

# 11. SPACING

Create a consistent spacing scale.

Use a limited token system rather than arbitrary values.

Suggested conceptual scale:

```text
4
8
12
16
20
24
32
40
48
64
80
96
```

Pages should feel spacious without becoming empty.

---

# 12. BORDER RADIUS

Use a restrained radius system.

Avoid mixing:

- 2px
- 3px
- 4px
- 6px
- 8px
- random large values

unless the component genuinely requires it.

Use a small number of semantic radius tokens.

---

# 13. COLOR SYSTEM

Create semantic design tokens.

Do not scatter hardcoded colors throughout components.

Required semantic groups:

```text
background
surface
surface-elevated
border
text-primary
text-secondary
text-muted
accent
accent-hover
success
warning
danger
info
focus
```

Dark and light themes must each be intentionally designed.

Do NOT simply invert colors.

---

# 14. DARK THEME

Dark mode should feel:

- deep
- comfortable
- premium
- technical

Avoid:

- pure-black everything
- excessive neon
- glowing borders everywhere
- low contrast text

The accent should be used strategically.

---

# 15. LIGHT THEME

Light mode is a first-class experience.

It must not feel like:

> dark theme + white background.

Design:

- background
- surfaces
- borders
- shadows
- text
- accent contrast

specifically for light mode.

Every important page must be checked independently in light mode.

---

# 16. MOTION SYSTEM

Motion should communicate interaction.

Use subtle transitions generally in the range of approximately:

```text
150ms–250ms
```

Use motion for:

- hover
- focus
- opening/closing
- navigation
- card interaction
- loading
- state changes

Avoid:

- constant animations
- looping decorative animations
- unnecessary parallax
- excessive scaling
- distracting movement

Respect:

```text
prefers-reduced-motion
```

---

# 17. RESPONSIVE FOUNDATION

Design mobile-first.

Primary validation sizes:

```text
360px
375px
390px
414px
430px
768px
820px
912px
1024px
1280px
1440px
1920px
```

Do not design desktop first and simply shrink it.

Responsive behavior must sometimes change layout rather than merely reduce sizes.

---

# 18. GLOBAL COMPONENT SYSTEM

Create shared primitives instead of repeatedly implementing similar UI.

Core primitives should include, where required:

- Button
- Input
- Textarea
- Select
- Field
- Card
- Badge
- Alert
- Spinner
- Skeleton
- EmptyState
- Modal
- PageContainer
- SectionHeader
- Dropdown
- Tabs
- Toast/notification if required

Do not create a component merely because a single page uses it.

Create shared components when a visual or behavioral pattern repeats.

---

# 19. APPLICATION SHELL

The application should have a coherent shell.

Conceptually:

```text
App
 └── AppShell
      ├── Header
      ├── Main
      │    └── Page
      └── Footer
```

Dashboard/admin pages may use a specialized shell:

```text
DashboardShell
 ├── Sidebar
 ├── MobileNavigation
 └── MainContent
```

Both shells must belong to the same design system.

---

# 20. HEADER

Desktop:

- clear brand
- useful navigation
- search/discovery
- theme control
- user actions

Mobile:

- brand
- menu
- essential action(s)

Avoid duplicate navigation systems.

The mobile drawer should:

- open cleanly
- close correctly
- close on navigation
- support keyboard interaction
- support Escape where appropriate
- avoid collisions with search/dropdowns

---

# 21. HOMEPAGE

The homepage should prioritize content.

Do not make it feel like a portfolio landing page.

The reader should quickly understand:

1. what this platform is
2. what kind of content exists
3. what is worth reading
4. how to explore more

Possible hierarchy:

```text
Hero / identity
        ↓
Featured content
        ↓
Latest content
        ↓
Topics/categories
        ↓
Recent discussion / useful discovery
        ↓
Footer
```

Exact sections depend on existing backend capabilities.

Do not invent statistics.

Do not use fake telemetry.

---

# 22. POST CARD

Post cards are a core reusable component.

A post card should potentially communicate:

- cover image
- category/topic
- title
- short description/excerpt
- author
- date
- reading time
- useful engagement metadata where available

Avoid:

- muddy/darkened images
- tiny titles
- excessive metadata
- decorative technical noise

The card should make the reader want to open the post.

---

# 23. POST DETAIL — CORE EXPERIENCE

The article page is the most important reader experience.

The reader should feel:

> "This is comfortable to read."

Recommended hierarchy:

```text
Category

Title

Short introduction / excerpt

Author · Date · Reading time

Cover image

Article

Visual content where useful

Conclusion / takeaway

Comments

Related content
```

Maintain approximately a 720px reading column.

Do not force every element into the same width.

For example:

```text
Page
 ├── Hero / metadata
 ├── Cover image
 ├── 720px article content
 ├── wider contextual visual where useful
 ├── comments
 └── related posts
```

---

# 24. LONG-FORM CONTENT PHILOSOPHY

Do not treat a blog post as a wall of text.

Use:

- headings
- short paragraphs
- lists
- code blocks
- quotes
- callouts
- diagrams
- screenshots
- contextual images
- tables when useful
- visual separation

The goal is not:

> Add images everywhere.

The goal is:

> Add a visual element when it helps explain the idea.

---

# 25. IMAGE STRATEGY

The current cover-image-only experience feels limited.

V1 should improve the visual presentation of articles without immediately requiring a complete media platform.

Possible V1 article visuals:

- cover image
- images inside content where the existing editor/backend supports them
- technical screenshots
- diagrams
- architecture visuals
- code-related visuals

Do not add complex media infrastructure unless the backend audit proves it is already available or genuinely required.

---

# 26. COMMENTS — V1

Comments are important because they are the primary reader interaction.

V1 should prioritize:

- readable comments
- clear author identity
- timestamps
- comfortable spacing
- clear reply/interaction affordances where supported
- good empty state
- good loading state
- clear submission feedback
- mobile usability

Do not overcomplicate the V1 composer.

---

# 27. COMMENTS — V2 RESERVED CAPABILITY

Future V2 may introduce:

- image attachments
- GIFs
- emoji picker
- richer composer
- image previews
- reactions
- richer discussion interactions

These are NOT part of the current redesign implementation.

However, the V1 design should avoid making the future composer impossible to extend.

Do not build V2 now.

---

# 28. SEARCH / DISCOVERY

Search should feel like a product feature rather than a technical filter.

Important UX:

- obvious search
- useful empty state
- clear categories
- readable results
- loading state
- pagination/load-more feedback
- consistent result cards
- mobile-friendly filters

If backend APIs support categories/tags/search, expose them naturally.

Do not invent unsupported filtering.

---

# 29. USER EXPERIENCE

Readers should be able to:

```text
Discover
 ↓
Understand
 ↓
Read
 ↓
Interact
 ↓
Explore
```

Avoid unnecessary friction.

Do not force:

- unnecessary authentication
- unnecessary modal interruptions
- fake loading
- decorative confirmation screens
- meaningless CTAs

---

# 30. AUTHENTICATION

Authentication pages must belong to the same product.

Do not maintain a completely separate visual universe.

Auth should be:

- clean
- trustworthy
- simple
- accessible
- responsive

Mobile should prioritize the form.

Remove artificial delays unless technically necessary.

---

# 31. USER DASHBOARD

The user dashboard should no longer look like a legacy admin template.

It should feel like part of the same SaaS product.

Possible structure:

```text
Dashboard

Overview
 ├── useful statistics
 ├── recent activity
 └── recent interactions

Profile

Comments / activity where supported

Account
```

Do not expose unnecessary raw IDs.

Do not use fake statistics.

Use real backend data only.

---

# 32. ADMIN DASHBOARD

The admin dashboard is a major redesign area.

It should support the actual admin-centric product model.

Possible structure:

```text
Admin
 ├── Overview
 ├── Posts
 ├── Comments
 ├── Users
 ├── Categories
 ├── Analytics
 └── Settings
```

Exact sections must reflect actual backend capabilities.

Prioritize:

- clear information hierarchy
- useful statistics
- readable tables
- filters
- search
- pagination
- loading
- empty states
- error states
- confirmations
- responsive behavior

Desktop can use a sidebar.

Mobile should use a compact navigation system.

---

# 33. EDITOR

The editor should be redesigned as a professional publishing interface.

Prioritize:

- readable writing area
- clear hierarchy
- useful toolbar
- image handling where currently supported
- publish/update states
- validation
- loading feedback
- error feedback
- preview/render consistency

Do not unnecessarily replace the existing content engine.

---

# 34. ABOUT / PROJECTS

These pages should support the developer identity without turning the application into a portfolio site.

Use:

- strong typography
- meaningful project descriptions
- useful links
- restrained technical details
- visual hierarchy

Remove gimmicky terminal behavior where it does not add meaning.

---

# 35. ACCESSIBILITY

All redesign work must consider:

- semantic HTML
- labels
- keyboard navigation
- focus states
- button semantics
- dialog semantics
- dropdown keyboard behavior
- contrast
- reduced motion
- image alt text
- form errors

Accessibility is part of the design, not a final afterthought.

---

# 36. PERFORMANCE

Do not add visual complexity that unnecessarily harms performance.

Be cautious with:

- Three.js
- large images
- unnecessary animation
- repeated rendering
- expensive effects

A visual element should justify its cost.

---

# 37. BACKEND RULE

The frontend redesign must preserve the existing backend wherever possible.

Do not change:

- database architecture
- API contracts
- authentication model
- business logic
- authorization
- data relationships

unless the backend audit explicitly identifies a genuine requirement.

Backend changes must be classified as:

```text
REQUIRED
OPTIONAL
DEFERRED
```

Prefer FRONTEND-ONLY solutions.

---

# 38. V1 / V2 BOUNDARY

## V1 — Current redesign

Focus on:

- complete visual redesign
- modern responsive UI
- light/dark themes
- content presentation
- reading experience
- navigation
- search/discovery
- comments UX
- user dashboard
- admin dashboard
- editor UX
- accessibility
- motion
- responsive polish

## V2 — Future enhancements

Potentially:

- comment images
- GIFs
- emoji picker
- richer comments
- reactions
- expanded discussion interactions
- advanced media capabilities

Do not allow V2 features to expand the current implementation scope.

---

# 39. SEVEN IMPLEMENTATION PHASES

The entire redesign is intentionally compressed into seven phases.

## PHASE 1 — FOUNDATION

Scope:

- fix critical existing UI bugs
- establish design tokens
- typography
- colors
- light/dark theme
- spacing
- radius
- containers
- responsive breakpoints
- motion rules
- accessibility foundation
- shared primitives

Do NOT redesign every page in this phase.

---

## PHASE 2 — APPLICATION SHELL

Scope:

- AppShell
- Header
- navigation
- mobile navigation
- footer
- page containers
- global layout
- theme behavior
- responsive shell

Goal:

Every page should now feel like the same product.

---

## PHASE 3 — CONTENT EXPERIENCE

Scope:

- PostCard
- content grids
- homepage
- search
- post detail
- article hierarchy
- reading experience
- images
- metadata
- related content
- content states

Goal:

Make reading the strongest part of the product.

---

## PHASE 4 — AUTH + USER EXPERIENCE

Scope:

- login
- authentication UI
- user-facing dashboard
- profile/account areas
- user states
- loading/error/empty states

Goal:

Make the user-facing product feel complete.

---

## PHASE 5 — ADMIN EXPERIENCE

Scope:

- admin shell
- admin navigation
- dashboard overview
- posts management
- comments management
- users
- analytics
- tables
- filters
- modals
- admin states

Goal:

Completely replace the legacy admin-dashboard feeling.

---

## PHASE 6 — EDITOR + SECONDARY PAGES

Scope:

- create post
- update post
- editor experience
- About
- Projects
- supporting pages
- comments V1 refinement

Goal:

Bring remaining product surfaces into the same design system.

Do NOT implement V2 comment media features.

---

## PHASE 7 — SYSTEM-WIDE POLISH

Scope:

- mobile audit
- tablet audit
- desktop audit
- large-screen audit
- light-theme audit
- dark-theme audit
- accessibility
- motion
- performance
- loading states
- empty states
- error states
- visual consistency
- spacing consistency
- typography consistency
- interaction consistency

Goal:

Make the application feel finished and production-quality.

---

# 40. IMPLEMENTATION DISCIPLINE

Claude must NEVER implement multiple phases simply because they appear related.

For each phase:

1. Read this blueprint.
2. Read the tracker.
3. Read the backend audit when relevant.
4. Determine current phase.
5. Inspect the actual code.
6. Identify existing implementation.
7. Create a concise implementation plan.
8. Implement ONLY the current phase.
9. Validate the implementation.
10. Update the tracker.
11. Stop.

Do not continue automatically into the next phase.

---

# 41. SESSION CONTINUITY

A new Claude Code session must NOT assume that previous context exists.

At the beginning of every redesign session:

```text
1. Read REDESIGN_BLUEPRINT.md
2. Read REDESIGN_TRACKER.md
3. Read BACKEND_AUDIT.md
4. Determine current phase from REDESIGN_TRACKER.md
5. Inspect the relevant codebase
6. Compare actual implementation against the blueprint
7. Continue only from the current phase
```

Do not ask the user to repeat information already documented in these files.

---

# 42. CODEBASE ANALYSIS RULE

The blueprint is the design/product source of truth.

The actual codebase is the implementation source of truth.

Never assume that a component, route, API or feature exists because this document mentions it.

Always inspect the code.

Never assume the code behaves as expected because its name suggests it does.

Verify.

---

# 43. CHANGE CONTROL

Before changing a file, determine:

- Is it required for the current phase?
- Does it affect backend behavior?
- Does it affect an API contract?
- Does it affect authentication?
- Does it affect routing?
- Does it affect unrelated pages?
- Is there already a reusable component that should be changed instead?

Prefer changing the shared foundation rather than creating another one-off implementation.

---

# 44. DO NOT OVERENGINEER

Do not introduce unnecessary:

- libraries
- frameworks
- architecture patterns
- state-management systems
- backend services
- microservices
- caching systems
- animation libraries
- component libraries

unless there is a clear technical reason.

Use the existing stack where practical.

---

# 45. SUCCESS CRITERIA

The redesign is successful when the application no longer feels like:

> "a final-year project blog."

It should feel like:

> "a real developer platform that could be used and maintained as a serious product."

A user should be able to:

- understand the platform quickly
- discover interesting posts
- comfortably read long technical content
- understand content hierarchy
- navigate naturally
- use the site comfortably on mobile
- use light or dark mode comfortably
- participate through comments
- return to discover more content

An admin should be able to:

- publish
- edit
- manage
- monitor
- moderate
- analyze

through a dashboard that feels like part of the same product.

---

# 46. FINAL PRODUCT FEEL

The target feeling is:

**Serious enough to trust.**

**Creative enough to remember.**

**Simple enough to use.**

**Technical enough to feel authentic.**

**Polished enough to feel like a real SaaS product.**

The product should have personality without becoming a visual gimmick.

---

# 47. CURRENT SCOPE BOUNDARY

The current redesign is V1.

Do not expand scope into:

- multi-author publishing
- Reddit-style communities
- advanced social networking
- comment media
- GIF infrastructure
- emoji infrastructure
- advanced reactions
- major backend architecture changes

unless explicitly approved later.

The current objective is:

> Build an excellent admin-centric developer blogging platform with a world-class reading and discussion experience.