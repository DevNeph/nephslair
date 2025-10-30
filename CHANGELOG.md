# Changelog

## v1.0.0

### Overview
Initial production-ready baseline for a modern content platform with Projects, Posts, Releases, Polls, and site-wide Settings.

### Highlights
- Website Settings (site identity, SEO description, footer contact, maintenance mode, announcement banner)
- Maintenance Mode gate (admins + login only)
- Announcement bar (dismissible per message for 1 hour)
- Unified Project sidebar("Latest Version", "Last Updated") across pages
- Poll system with standalone/project/post polls and vote preservation on updates
- Release management with guarded file uploads (platform required, no orphan pending file) and tooltips
- Comments with history and voting; threaded UI
- Consistent API responses, validation, error handling
- Hardened migrations and indexing across core entities
- Frontend standards: request wrapper, useFormHandler, unified buttons, SEO head

### Fixes/Quality
- Prevent double-hashing passwords on reset
- Invalidate stale JWTs on password change (`password_changed_at` + middleware check)
- Resolve duplicate routes and index conflicts
- Safe email sending (mock if SMTP missing)

### Known Limitations / Next
- Basic roles (admin/user) only
- No CDN/antivirus for file uploads
- Limited analytics/observability
- Per-page custom SEO is opt-in via `SeoHead`
