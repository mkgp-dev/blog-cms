# blog-cms

A blog CMS frontend with both the author dashboard and the public reading experience.

## Features
- Login with JWT storage
- Public homepage for published blog posts
- Dedicated public post pages under `/content/:id`
- Public comment viewing and submission
- Infinite scrolling public feed in batches of `9`
- Admin-only routes for posts and comments
- Search, filters, and date range queries
- Pagination
- Create, edit, view, and delete posts
- Delete comments
- WYSIWYG editor with Tiptap

## Built with
- React (Vite) + TypeScript
- React Router v7
- TanStack React Query
- Tailwind CSS v4 + shadcn/ui
- Tiptap editor
- localForage

## Environment Variables
Create a `.env` file
```env
VITE_API_BASE_URLS="http://localhost:3000,http://localhost:4000"
```

## Developer Mock Data
- Public-blog mock mode is configured in [src/config/public-blog-data-source.ts](./src/config/public-blog-data-source.ts).
- Switch `DEFAULT_PUBLIC_BLOG_DATA_SOURCE` from `"real"` to `"mock"` to validate the public UI with local in-app sample content.
- The mock source only affects the public blog pages and does not change admin data access.

## License
This is a source-available project. You can use it and modify it for personal, non-commercial purposes, but you may not redistribute it or claim it as your own. See the [LICENSE](./LICENSE) file for full details.
