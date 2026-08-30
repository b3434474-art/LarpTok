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

The media migration is stored in `supabase/migrations/20260830220000_media_storage.sql`.

### v0.3 — Discovery ✅
- User, post, and hashtag search
- Search results tabs
- Recent search history with clear option
- Automatic hashtag extraction from captions
- Clickable hashtags and hashtag pages
- Trending posts
- Trending hashtags
- Trending creators
- Time-aware FYP scoring
- Following-aware feed

The discovery migration is stored in `supabase/migrations/20260830230000_discovery_v03.sql`.

### v0.4 — Social+ ✅
- Reposts and undo repost
- Repost counts and reposted-by display
- Favorites / saved posts
- Notifications for likes, follows, comments, replies, mentions, and reposts
- Nested comment replies
- Comment likes
- Clickable @mentions and mention notifications
- Share links

### v0.5 — Creator ✅
- Creator Center / dashboard
- Overview analytics for views, likes, comments, reposts, favorites, shares, followers, and engagement
- Per-post analytics
- Top-performing content view
- Post editing and deletion
- Post privacy controls
- Comment controls
- Draft creation, loading, and deletion
- Playlist creation, renaming, deletion, privacy, and add/remove posts
- Profile customization
- Private-account setting
- Automatic post-view tracking for analytics
- Analytics database indexes and RLS

The creator migrations are stored in `supabase/migrations/` with the `creator_v05` prefix.

## Stack

- HTML, CSS, JavaScript
- Supabase Auth + PostgreSQL + Storage
- GitHub Pages-ready static frontend

## Supabase setup

The frontend uses the project's public publishable key. Never put a Supabase service-role/secret key in this repository.

If you clone the project, apply the migrations in `supabase/migrations/` to your own Supabase project and update the public project URL/key in `app.js` and `creator.js`.

## GitHub Pages

1. Open **Settings → Pages** in the repository.
2. Choose **Deploy from a branch**.
3. Select `main` and `/ (root)`.
4. Save.

## Roadmap

- v0.6 — Sounds, editing, effects, filters, stickers, Duet, Stitch
- v0.7 — DMs and group chats
- v0.8 — Stories
- v0.9 — LIVE
- v1.0 — LarpTok polish, safety, moderation, performance, and LARP-specific features
