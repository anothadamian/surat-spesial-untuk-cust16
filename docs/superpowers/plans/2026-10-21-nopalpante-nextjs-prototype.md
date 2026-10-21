# Nopalpante Next.js Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the complete mobile-first Nopalpante birthday journey in the existing Next.js foundation.

**Architecture:** Copy the Kienan Next.js/React app foundation into the currently asset-only Nopalpante folder, preserving all original customer assets. Adapt its current page structure and styles to the approved `AlurWeb` order, reuse Dlynn's game/transition behavior as a reference, and keep customer-specific content in replaceable data with neutral placeholders.

**Tech Stack:** Next.js 16.3.5, React 19.2.6, TypeScript, CSS, Playwright for browser-flow QA.

**Spec:** [2026-10-21-nopalpante-nextjs-design.md](../specs/2026-10-21-nopalpante-nextjs-design.md)

## Global Constraints

- Keep Next.js; do not introduce Vite or replace the app with a standalone hand-built site.
- Preserve the supplied numbered `AlurWeb` order and original Nopalpante assets.
- Use recipient `nopalpante` and sender `putriimut`; keep missing customer data as replaceable placeholders.
- Do not copy customer-specific content or photos from Kienan, Dlynn, or Bébé.
- Replace all duck-specific visuals and wording in games with the supplied cute-spider asset.
- Use YouTube ID `o25_Tn8BnFM`; keep its player visible and at least 200 × 200 px.
- Mobile-first with working desktop layout, keyboard/touch game controls, reduced-motion support, and no narrow-screen horizontal overflow.

## Review Focus

1. Wrong PIN, empty customer copy, or missing photo slots must not break or skip the prototype. Test invalid/valid PIN and fallback slots in Task 1.
2. Catch-game timeout/missed targets and retries must keep the player able to continue. Test win, retry, and next-button gating in Task 2.
3. YouTube playback and local MP3 must not overlap, including when the iframe loads late or is blocked. Test visible frame, start/pause/resume behavior, and unavailable-video fallback in Task 3.
4. Holding the candle must work for pointer and keyboard input without advancing before completion. Test progress, cancellation, and completed wish in Task 4.
5. Games and persistent controls must remain reachable on a 320 px mobile viewport and desktop. Test both viewport sizes and horizontal overflow in Task 5.

---

### Task 1: Clone the Next.js foundation and establish the opening flow

**Files:**
- Copy/adapt: `Customer/Custom Web/Kienan/birthday-gift-kienan/app/` into `Customer/Custom Web/Nopalpante/app/`.
- Copy/adapt: Kienan `package.json`, lockfile, `next.config.ts`, and TypeScript configuration into Nopalpante root.
- Create: `Customer/Custom Web/Nopalpante/public/img/laba-laba-imut.png` and `public/music/` assets from supplied Nopalpante originals; copy required Kienan non-personal template decorations only if used.
- Create: `app/data.ts` for Nopalpante identity, demo copy, four replaceable photo slots, and YouTube ID.
- Modify: `app/page.tsx`, `app/layout.tsx`, and copied app styles.
- Test: `tests/e2e/journey.spec.ts` (PIN and opening/gift sequence).

**Interfaces:**
- Produces `GiftData` with `name`, `nickname`, `from`, `pin`, `intro`, `message`, `wish`, and exactly four photo records; missing records resolve to neutral placeholders.
- Produces the app shell with ordered scene navigation and stable accessible controls used by later tasks.

- [ ] **Step 1: Copy Kienan's Next.js foundation** into Nopalpante without copying its customer photos, music, personal copy, generated output, or `node_modules`; preserve `AlurWeb/`, `img/`, `music/`, and `data.txt` originals.
- [ ] **Step 2: Add the Playwright setup and failing browser coverage** for a wrong PIN staying on the intro, demo PIN `1234` reaching the gift screen, and the gift action entering the first catch game.
- [ ] **Step 3: Run `npm run test:e2e -- --grep "PIN|gift"`** and confirm the new flow assertions fail against the copied, not-yet-adapted foundation.
- [ ] **Step 4: Adapt the opening and gift screens** with Nopalpante demo identity, neutral content, blue theme tokens, and the supplied spider asset path; use demo PIN `1234` from the spec.
- [ ] **Step 5: Run `npm run test:e2e -- --grep "PIN|gift"` and `npm run build`**; both must pass.

### Task 2: Implement the first catch game and the custom envelope reveal

**Files:**
- Modify: `app/page.tsx` (scene state and render branches).
- Create: `app/components/CatchGame.tsx` and `app/components/SpiderTransition.tsx` if those responsibilities are not already isolated in the copied app.
- Modify: `app/journey.css` (blue adaptation and mobile-first scene/game styles).
- Modify: `tests/e2e/journey.spec.ts`.

**Interfaces:**
- `CatchGame` accepts `goal` and `onComplete`; completion reveals the next action and replay resets score/timer. There is no skip action.
- Scene order is `intro → gift → flowers → envelope → letter → memories`; the envelope transition uses the Nopalpante spider.

- [ ] **Step 1: Add failing tests** for catching six flowers, withholding next until completion, replay resetting progress, and tapping the closed envelope producing an opened state before advancing.
- [ ] **Step 2: Run `npm run test:e2e -- --grep "flowers|envelope"`** and confirm the assertions fail before implementation.
- [ ] **Step 3: Adapt the existing Kienan catch-game structure** to use flowers and the spider, with touch drag plus arrow/button controls and explicit win/timeout/retry states.
- [ ] **Step 4: Add the custom portrait envelope and spider transition**; opening reveals the letter/card state and provides a clear path to the AlurWeb memories screen.
- [ ] **Step 5: Run the focused browser tests and `npm run build`**; all must pass.

### Task 3: Add the four-photo gallery, visible YouTube player, and persistent music

**Files:**
- Create: `app/components/MemoryGallery.tsx` and `app/components/MusicDock.tsx` if not present in the copied foundation.
- Modify: `app/page.tsx`, `app/data.ts`, `app/journey.css`, and `app/layout.tsx` as needed.
- Test: `tests/e2e/media.spec.ts`.

**Interfaces:**
- Gallery renders exactly four flip-photo placeholders and the visible YouTube embed from ID `o25_Tn8BnFM`.
- Music dock owns the local MP3 and exposes play/pause/mute; it pauses MP3 while the YouTube player reports playing and allows manual resume after pause/end.

- [ ] **Step 1: Add failing tests** for four gallery slots, a visible player at least 200 × 200 px, user-gesture MP3 start, YouTube-triggered pause, and resume control when video ends or is unavailable.
- [ ] **Step 2: Run `npm run test:e2e -- tests/e2e/media.spec.ts`** and confirm the expected media assertions fail before implementation.
- [ ] **Step 3: Implement the gallery and persistent audio dock** using supplied MP3 and YouTube ID; keep YouTube visible and handle blocked playback without hiding controls.
- [ ] **Step 4: Run media tests and `npm run build`**; all must pass.

### Task 4: Complete candle, gift/message, picnic, second catch, and delivery scenes

**Files:**
- Create/adapt: `app/components/CandleWish.tsx`, `app/components/PicnicGame.tsx`, and `app/components/DeliveryGame.tsx` (reuse existing Kienan components where they already fit).
- Modify: `app/page.tsx`, `app/data.ts`, and `app/journey.css`.
- Modify: `tests/e2e/journey.spec.ts`.

**Interfaces:**
- Later sequence stays `memories → candle → wish → message → picnic → joys → delivery`.
- Picnic and delivery interactions accept touch/mouse/keyboard input, expose completion status, and provide replay; second catching game remains in the flow.

- [ ] **Step 1: Add failing tests** for candle hold completion/cancel, gift message reveal and exact continuation label, picnic success/replay, second catch success/replay, and delivery success/restart.
- [ ] **Step 2: Run `npm run test:e2e -- --grep "candle|message|picnic|delivery|second catch"`** and verify each relevant assertion fails.
- [ ] **Step 3: Adapt the corresponding existing Kienan/Dlynn interactions** into the specified scene order, replace all duck visuals/text with the spider, and use replaceable neutral demo content.
- [ ] **Step 4: Run focused journey tests and `npm run build`**; all must pass.

### Task 5: Responsive and complete-flow quality check

**Files:**
- Modify: `app/journey.css` only for verified responsive/accessibility issues.
- Modify: `tests/e2e/responsive.spec.ts` and `README.md` with prototype/run instructions.

- [ ] **Step 1: Add failing viewport assertions** at 320 × 740 and 1280 × 800 for no horizontal overflow, visible controls, and reachable video/game areas.
- [ ] **Step 2: Run the responsive test** and confirm any failing geometry before styling changes.
- [ ] **Step 3: Fix only measured mobile/desktop issues**, keyboard focus visibility, reduced-motion behavior, and long-copy/photo-placeholder layout.
- [ ] **Step 4: Run `npm run test:e2e`, `npm run build`, and a complete browser walkthrough** from PIN through delivery; confirm all games can finish and replay and that no personal reference content remains.
