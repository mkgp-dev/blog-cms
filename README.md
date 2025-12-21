# blog-cms

A simple yet modern front-end dashboard for managing my blog posts and readers’ comments.

## Features
- Login with JWT storage
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
VITE_API_BASE_URL="http://localhost:3000/api"
```

## License
This is a source-available project. You can use it and modify it for personal, non-commercial purposes, but you may not redistribute it or claim it as your own. See the [LICENSE](./LICENSE) file for full details.