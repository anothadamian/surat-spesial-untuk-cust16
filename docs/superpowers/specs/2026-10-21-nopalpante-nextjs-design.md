# Nopalpante Birthday Prototype — Design

## Goal

Deliver a polished, fully playable, mobile-first birthday-site prototype for recipient **nopalpante**, from sender **putriimut**, that can be personalized with customer data later.

## Source projects and architecture

- Use the existing **Kienan Next.js/React project** as the application foundation and adapt its intro, visual system, and existing component patterns. Keep the Next.js stack; do not rebuild this as a Vite or hand-rolled standalone site.
- Use **Dlynn** as a reference for page transitions and the catch, picnic, and gift-delivery interactions. Adapt those patterns into the selected Next.js foundation; do not copy Dlynn's standalone legacy page wholesale.
- Use **Bébé** only for the deep-blue palette direction.
- Use **AlurWeb's numbered images** as the authoritative story order and screen guidance. Clone the supplied references for the other screens; create an original adaptation only where the user specified no suitable example: screens 4–5.
- Reference projects contribute visual/interaction patterns only. Do not carry over their customer names, photos, captions, messages, or other personal content.

## Journey and interaction requirements

Preserve this order exactly:

1. Intro and four-digit birthday PIN.
2. Gift screen; tapping the gift advances into the requested catch game.
3. Catch six flowers. Keep the customer's requested catching-game behavior; show the next/gift action after completion, with retry available.
4. A closed envelope in a portrait-friendly layout.
5. Original envelope-opening animation and reveal. The reveal leads into the memory presentation; the four small photo thumbnails and visible YouTube frame follow the supplied AlurWeb media direction without changing the remaining order.
6. Memories/gallery with four small photo cards and one prominent visible YouTube player, as noted on the AlurWeb image.
7. Hold the candle button until the flame goes out; then show the wish-sent state.
8.1. Gift/wish screen.
8.2. Reveal the provided message, then show **“Masih ada kejutan kecil untukmu”**.
9. Picnic sorting game.
10. The second catch game, retained as requested.
11. Gift-delivery game as the ending.

Every game must be usable by touch on mobile, have clear progress/success feedback, and offer a restart. Do not remove the second catch game or alter its requested core behavior.

## Theme, content, and media

- Start with the Kienan opening-screen composition, recolored to a deep-navy/blue palette guided by Bébé.
- Replace all duck-specific characters and language in games with the supplied cute-spider character, `/img/laba-laba-imut.png` (copied into the Next public asset area for serving). Apply Dlynn-style transitions using that spider.
- Preserve **nopalpante** and **putriimut** exactly. The empty `data.txt` is intentional: use neutral, clearly replaceable placeholders for missing copy and photos; do not block the prototype on absent personal content.
- Use demo PIN `1234` until customer data replaces it.
- Keep the YouTube player visible on the gallery screen and use only the user-provided video ID `o25_Tn8BnFM`.
- Use the user-provided local MP3 as persistent page music after the envelope is opened. Start playback only from a user gesture, keep compact play/pause and mute controls available, pause the MP3 while the visible YouTube player is playing, and let the user resume it when the video pauses or ends. Never rely on unmuted autoplay or hidden YouTube playback.
- Make the YouTube player at least 200 × 200 px, including at supported mobile widths.

## Responsive behavior and accessibility

- Design mobile-first around the supplied portrait references, then adapt into a balanced desktop composition rather than scaling the phone layout up unchanged.
- Provide touch-sized controls, keyboard operation for the PIN and games, status announcements for progress, reduced-motion support, and no horizontally overflowing layout at narrow widths.

## Acceptance checks

- The Nopalpante app runs and builds with Next.js; no Vite app is introduced.
- The 11 ordered screens above are navigable in sequence and can return/restart as appropriate.
- Both catch games, picnic sorting, candle hold, and delivery interactions can be completed on mobile and desktop.
- Opening the envelope reveals the custom media/letter presentation; the gallery contains four thumbnail slots and the visible YouTube frame.
- Persistent MP3 and YouTube playback do not overlap; music controls remain available after unlocking.
- Missing customer data displays clean replaceable placeholders, not broken-image or empty-layout artifacts.
- Narrow mobile and desktop layouts are visually checked after implementation.
