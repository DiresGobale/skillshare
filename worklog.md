---
Task ID: 1
Agent: main (Super Z)
Task: (1) Make admin/company profile able to upload own photo, (2) wire up all CTA buttons (Find jobs, Hire talent, etc.), (3) fix admin not redirecting to dashboard after login.

Work Log:
- Investigated admin login flow: confirmed NextAuth + /api/auth/send-otp + /api/auth/verify-otp all return 200 OK end-to-end via curl. The OTP-on-screen demo display was already implemented in admin-gate.tsx.
- Root cause of "admin not redirecting": after OTP verification, Admin2FAGate called unlockAdmin() but if the React state propagation stalled (e.g. hydration mismatch), the user could be stuck on the "Access granted!" screen. Added a belt-and-suspenders fallback: after unlockAdmin(), also call window.location.assign("/") so the Router re-evaluates with the freshly-set sessionStorage flag.
- Also added a recovery check in Admin2FAGate's mount useEffect: if sessionStorage already has skillmatch.admin-unlocked=1, immediately call unlockAdmin() and skip sending a new OTP (covers the case where the user manually reloads while the unlock flag is still set).
- Fixed all 6 broken `setRole(...)` calls in guest/views.tsx — `setRole` was a no-op stub left over from a previous refactor:
  * "Find jobs" button on hero → navigates to public-jobs browse page (btn-rainbow gradient)
  * "Hire talent" button on hero → navigates to /register with `registerRole=employer` hint in sessionStorage
  * "Sign up as job seeker" / "Sign up as employer" CTA → navigates to /register with role hint
  * "Apply now" / "Sign in to apply" on public-job-detail → navigates to /login
- Updated Register component to read `registerRole` from sessionStorage on mount and pre-select the matching role tab.
- Wired up "Continue with Google" / "Continue with LinkedIn" OAuth placeholder buttons in Login form to show a toast explaining they're not configured in this demo (useToast hook added).
- Added a new "Admin Profile" card at the top of AdminConfig view with ProfilePhotoUpload + editable name/title/location/about fields + read-only email. Admin can now upload their own profile photo, which appears in the sidebar, topbar, and audit logs.
- Verified EmployerCompanyProfile already had ProfilePhotoUpload wired up — re-tested via curl that POST /api/profile/photo works for both employer and admin roles.
- Wired up the Bell + MessageSquare icon buttons in the Topbar (app-shell.tsx) to navigate to /notifications and /messages respectively (were no-op buttons before).
- Wired up seeker/views.tsx previously-no-op buttons:
  * "Save for later" on job-detail → saves to localStorage('skillmatch.savedJobs') + toast
  * "Verify" buttons on resume-analysis → toast "verification requested"
  * Phone button in messages → toast "calls not enabled in demo"
- Wired up employer/views.tsx send-message button (was no-op): added a real `send()` function that appends the draft to the active conversation.
- Removed dead `setTotp("")` / `setShow2FA(false)` references in Login.fillDemo (left over from the TOTP→email-OTP migration) — these were causing TypeScript errors.

Stage Summary:
- Admin login redirect: FIXED. After OTP verification, unlockAdmin() is called AND a hard window.location.assign("/") is performed as a fallback. Recovery logic on gate mount also checks sessionStorage.
- Profile photo upload: WORKING for all three roles (seeker via SeekerProfile, employer via EmployerCompanyProfile, admin via new AdminConfig profile card). POST /api/profile/photo + DELETE /api/profile/photo + GET /api/profile all return 200 OK and persist correctly.
- All major CTA buttons are now functional: Find jobs → public-jobs, Hire talent → register (employer preselected), Sign up CTAs → register, Apply now/Sign in to apply → login, Bell/Message topbar icons → notifications/messages, message send buttons actually append messages, Save for later persists to localStorage.
- Demo OTP is displayed on-screen (blue info box) so the admin can complete 2FA without a real email service.
- All changes compile cleanly (no new TypeScript errors introduced; pre-existing errors in unrelated files are unchanged).

---
Task ID: 2
Agent: main (Super Z)
Task: Add two new pages accessible from the existing public header: (1) a modern, animated Home page with four group photos (5 people each, tech/IT environment), and (2) an FAQ page with 8 expandable/collapsible questions. Beautiful colors, smooth animations, responsive across desktop/tablet/mobile.

Work Log:
- Generated 4 group photos via the image-generation skill (z-ai CLI) at 1344x768 landscape:
  * /public/groups/group1.jpg — 5 engineers collaborating in glass-walled meeting room
  * /public/groups/group2.jpg — 5 IT engineers pair-programming at standing desk
  * /public/groups/group3.jpg — 5 tech professionals celebrating around project whiteboard
  * /public/groups/group4.jpg — 5 developers in casual lounge for daily standup
  All photos emphasize multiethnic African/Asian/Latin American diversity, modern tech office environment, professional & collaborative feeling.
- Extended GuestView type in src/lib/app-context.tsx to add "home" and "faq".
- Updated src/app/page.tsx Router to dispatch view=home → <HomePage/> and view=faq → <FAQPage/>.
- Updated PublicHeader nav links to: Home | Browse jobs | FAQ | About | Contact. "Get started" button upgraded to btn-rainbow gradient. Mobile slide-down panel picks up the same links automatically.
- Updated PublicFooter to add Home, FAQ, and Post a job (employer preselected) links.
- Created new useScrollReveal hook at src/hooks/use-scroll-reveal.ts — IntersectionObserver-based, returns `isVisible` boolean once element scrolls into view. Used to trigger scroll-reveal animations.
- Added 13 new keyframes/utilities to globals.css: fadeUp, fadeIn, slideInLeft, slideInRight, scaleIn, floatY, slowSpin, gradientShiftSlow, marquee, expandDown, collapseUp, pulseGlow, blob, plus utility classes (.animate-*, .lift-card, .zoom-img, .reveal-on-scroll, .delay-100..800, .faq-chevron, .shimmer-line).
- Created HomePage component with 6 sections:
  * HomeHero — split layout with copy on left + floating group1 photo on right (animated gradient blobs, floating stat badges, pulse-glow ring)
  * HomeStats — 4 animated counters (4,872+ seekers, 958+ employers, 1,247 roles, 6,124 verified skills) with gradient icon tiles
  * HomeGroupPhotos — 2x2 grid of all 4 group photos with gradient overlays, captions, hover zoom, lift-card shadow, scroll reveal
  * HomeFeatures — 6 feature cards (explainable scores, AI resume, verified skills, skill-gap, privacy, real-time) with gradient icon tiles
  * HomeTestimonials — 3 success-story quote cards with avatar gradients
  * HomeCTA — gradient call-to-action banner with animated blobs + dual sign-up buttons
- Created FAQPage component with:
  * FAQHero — gradient hero with animated blobs and gradient-text headline
  * Category filter pills (All / How it works / Pricing / Verification / Privacy / Career growth) — click to filter
  * 8 expandable FAQ rows, each with: gradient icon tile, category label, question, chevron rotation animation, smooth grid-rows[1fr↔0fr] expand/collapse transition (500ms cubic-bezier)
  * FAQContactCTA — "Still have questions?" card linking to Contact and About pages
- All sections use RevealBlock wrapper (scroll-triggered fade-up) with staggered delays for a polished, modern feel.
- Color scheme: violet → blue → emerald gradients throughout, with accent colors (amber, rose, fuchsia, cyan) for variety. Consistent with existing btn-rainbow/btn-blue/btn-green utility classes.
- Responsive: all grids collapse to single column on mobile, 2 columns on tablet, 3-4 on desktop. Hero photo collage hidden on mobile (lg:block) to keep mobile clean.
- Verified dev server compiles cleanly (no TypeScript errors in any new file). Group photos all return 200 OK via curl.

Stage Summary:
- Two new pages live: /home (HomePage) and /faq (FAQPage), both accessible from the existing public header nav.
- Home page features 4 group photos in a 2x2 grid, animated counters, scroll-reveal sections, floating hero photo with stat badges, and a gradient CTA.
- FAQ page has 8 expandable questions with smooth grid-rows-based expand/collapse animation, chevron rotation, category filter pills, and a contact CTA.
- 13 new CSS animations added to globals.css; new useScrollReveal hook added for IntersectionObserver-based scroll triggers.
- All code is responsive (mobile/tablet/desktop), uses consistent gradient color scheme (violet/blue/emerald), and integrates with existing button styles (btn-rainbow, btn-blue, btn-green).
- TypeScript clean, dev server running, all 4 group photos served at /groups/group{1-4}.jpg.
