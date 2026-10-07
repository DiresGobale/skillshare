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
