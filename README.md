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

### v0.2 — Media ✅
- Image uploads
- Video uploads
- Supabase Storage integration
- Video playback
- Upload validation and progress UI
- Share links
- `media` Storage bucket with MIME/type and size restrictions
- Owner-scoped upload/update/delete policies

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

### v0.7 — Communication ✅
- Direct-message conversations
- Text messages and timestamps
- Conversation list and unread/read state foundation
- Secure member-only message access with RLS
- Group-chat-ready conversation model
- Realtime message refresh

### v0.8 — Stories ✅
- Image, video, and text stories
- 24-hour expiration
- Story privacy foundation
- Views, reactions, and replies
- RLS-protected story access

### v0.9 — LIVE ✅
- LIVE session metadata and status
- LIVE discovery and room UI
- External live-player/stream URL support
- Viewer tracking foundation
- LIVE chat
- Moderator and report foundations
- RLS-protected LIVE data

### v1.0 — LarpTok quality release 🚀
- Production Storage bucket and scoped Storage RLS
- Feed/search/relationship indexes for common queries
- Security-advisor review completed; remaining pre-existing SECURITY DEFINER warnings are documented for follow-up
- Mobile-first UI and creator/social platform foundation

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

LarpTok is now at **v1.0**. Future releases should focus on moderation tooling, accessibility improvements, performance optimization, LARP-specific community features, and iterative bug fixes rather than blindly adding every social-media feature.
