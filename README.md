# 🎭 LarpTok

A mobile-first LARP video/social community powered by GitHub and Supabase.

## Current status

### v0.1 — Foundation ✅
- Supabase email/password authentication
- User profiles created automatically on signup
- For You / Following / Latest feeds
- Text posts
- Likes, comments, and follows
- Responsive mobile-first UI
- Row Level Security

### v0.2 — Media 🟡
- Image uploads
- Video uploads
- Supabase Storage integration
- Video playback
- Upload validation and progress UI
- Share links

### v0.3 — Discovery ✅
- User, post, and hashtag search
- Search results tabs
- Recent search history with clear option
- Automatic hashtag extraction from captions
- Clickable hashtags and hashtag pages
- Trending posts and creators
- Time-aware FYP scoring

### v0.4 — Social+ ✅
- Reposts and favorites
- Notifications
- Nested replies and comment likes
- Clickable @mentions
- Share links

### v0.5 — Creator ✅
- Creator Center and analytics
- Per-post analytics
- Post editing/deletion/privacy controls
- Drafts
- Playlists
- Profile customization

### v0.6 — Creation ✅
- Browser-based Creation Studio
- Video upload/preview, trimming and speed control
- Text overlays and browser-side rendering
- Edited-video uploads
- Original sounds and sound library

### v0.7 — Communication 🔜
- Direct-message conversations
- Text messages and timestamps
- Conversation list and unread/read state foundation
- Secure member-only message access with RLS
- Group-chat-ready conversation model
- Realtime message refresh

The v0.7 migration is `supabase/migrations/20260830240000_communication_v07.sql`.

## Stack

- HTML, CSS, JavaScript
- Supabase Auth + PostgreSQL + Storage + Realtime
- GitHub Pages-ready static frontend
- Browser MediaRecorder/Canvas APIs for lightweight video rendering

## Supabase setup

The frontend uses the project's public publishable key. Never put a Supabase service-role/secret key in this repository.

If you clone the project, apply the migrations in `supabase/migrations/` to your own Supabase project and update the public project URL/key in the frontend files.

## GitHub Pages

1. Open **Settings → Pages** in the repository.
2. Choose **Deploy from a branch**.
3. Select `main` and `/ (root)`.
4. Save.

## Roadmap

- v0.8 — Stories
- v0.9 — LIVE
- v1.0 — LarpTok polish, safety, moderation, performance, and LARP-specific features
