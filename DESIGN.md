# ByPat portfolio — design context

The existing `index.html` remains the current home, with its violet visual identity and Italian, Spanish and English content. `home-plinth.html` is a separate Italian home concept requested from https://plinth-html.vercel.app/home-1.html. This concept does not establish a new identity for the project detail pages.

## New home direction

Marketing portfolio for Patricia Garcia, digital designer and front-end developer in Bisceglie. The goal is to lead visitors through real projects and invite contact. Use the reference's dark opening, oversized sans-serif typography, asymmetric editorial grid, rotated project imagery, stacked scroll introduction and expanding closing image. Reuse the owner's project assets and links. Do not invent clients, awards, testimonials or statistics.

Runtime tokens live in `home-plinth.css` `:root` and `:root.light`: background `#030b14`, surface `#0b131c`, text `#f7f4ee`, muted `#a5a8ab`; light background `#faf9f6`, surface `#efeeeb`, text `#10151a`, muted `#60656a`. Typography uses the existing locally hosted Satoshi for display, body and utility roles. Oversized medium-weight headings, tight letter spacing, small quiet captions. Page gutter is `clamp(20px,2.2vw,42px)`; media uses 16–24px radii, buttons are pills. No glass navigation, violet glow or decorative badges in this concept.

## Behavior and accessibility

Desktop fixed navigation, native modal menu with Escape and focus restoration, persisted optional light theme, native service disclosures, real project links, email contact. Motion uses CSS and a single scheduled scroll frame; respect live reduced-motion changes and preserve readable content without JavaScript. Mobile collapses navigation and galleries to one column. Keep scrollbars operable and provide visible keyboard focus. General-sans/reference videos are replaced by local Satoshi and real project images; the reference's original code and media are not production dependencies.

The revised motion sequence uses character-by-character title entry, staggered introductory content, a pointer-tilted preview, a sticky stack that fans out then expands Eureka into a landscape image, and sticky full-screen project stages with scroll-driven scale and rotation. A contextual project cursor is an additional mouse affordance; native links remain available to touch and keyboard. Closing contact imagery expands with scroll. Native scrolling is retained. Reduced motion disables pinning extensions and returns ordinary readable sections. CSS/JS asset version is bumped when changing this choreography to prevent stale browser caches.

User decision: animations start automatically, including when the system requests reduced motion. A visible motion toggle lets visitors reduce animation; the site-specific choice persists in localStorage. This supersedes the earlier system-first motion policy.

Signal reference addition: the hero retains Design ByPat and gains a pointer-driven image trail using all eight PNGs in img/cards. Cards appear roughly every 100px of pointer travel, rotate randomly, scale in and out over 900ms. The real white logo is img/logo.png. A native replay button exposes the effect to keyboard and touch users; disabling motion cancels the trail and pending timers.

Hero refinements: reuse index.html Mesh Drift WebGL shader via js/hero-background.js, with violet/cyan/magenta palette and original contrast overlay. Title has room above and below glyphs and reserves space for the CTA. Email is bypatdesigner@gmail.com. Role is Patricia Garcia / Junior UI/UX Designer with development Skills. Portfolio PDF does not exist yet; Scarica portfolio PDF is a disabled native button with visible availability note until a real file is supplied.

Final hero direction: Patricia Garcia is the single-line primary heading; UI/UX Designer and bridging Design & Code form a quieter two-line role beneath it. Email and city stay above. Italian introduction aligns to the role in the right column. Layout uses grid instead of absolute text placement, collapses naturally on mobile, and retains the existing shader and card trail. The hero CTA and card replay button were removed at user request.
