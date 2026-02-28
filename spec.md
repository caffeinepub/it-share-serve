# Specification

## Summary
**Goal:** Build ShareServe, a full-stack in-app instant messaging platform with photo/video sharing, AI image and video generation, a discovery feed, and a futuristic dark neon UI.

**Planned changes:**

**Backend (Motoko, single actor):**
- User registration with unique username, auto-generated profile number (e.g., #00123), display name, avatar URL, and bio; login via Internet Identity
- Contacts system: search by username or profile number, send/accept/decline contact requests, view contacts list
- One-on-one chat threads: store and retrieve text messages per conversation
- Photo and video storage (base64 or asset URL) attached to messages and user profile feed

**Frontend:**
- Auth flow: Internet Identity login/registration screen
- Home/Discovery screen with a "Video Facts" section showing a horizontal carousel of at least 3 fact cards (cosmic/space background video with overlaid text facts)
- Contacts tab: search users, manage contact requests, view contacts list
- Chat tab: list of conversations, one-on-one chat view with text messaging, inline photo and video attachments
- Create tab: AI image generation (text prompt → generated image, save or share) and AI video generation (text prompt → generated clip, preview, save or share), visually distinct sections on the same tab
- Profile screen: profile number, avatar, display name, username, bio, photo/video gallery, edit profile button
- Dark futuristic theme throughout: near-black backgrounds, neon accents (electric violet, cyan, hot pink), glowing buttons/icons/headings, animated shimmer/glow text effects on key elements, gradient highlights

**User-visible outcome:** Users can register and log in with Internet Identity, manage contacts, exchange text and media messages within the app, generate AI images and videos from prompts, browse a video facts discovery feed, and view/edit their profile — all within a polished dark neon futuristic interface.
