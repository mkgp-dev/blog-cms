import type { Page, Route } from "@playwright/test";

type MockOptions = {
  emptyPosts?: boolean;
  failPosts?: boolean;
  postListDelayMs?: number;
  postDetailDelayMs?: number;
  commentsDelayMs?: number;
  postCount?: number;
};

async function fulfillJson(route: Route, status: number, body: unknown) {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

async function maybeDelay(delayMs?: number) {
  if (!delayMs) return;
  await new Promise((resolve) => setTimeout(resolve, delayMs));
}

function buildPosts(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const id =
      index === 0
        ? "11111111-1111-4111-8111-111111111111"
        : `${String(index + 1).padStart(8, "0")}-1111-4111-8111-${String(index + 1).padStart(12, "0")}`;
    const title = index === 0 ? "Published Post" : `Published Story ${String(index + 1).padStart(2, "0")}`;
    const createdAt = new Date(Date.UTC(2026, 2, 1 + index, 8, 0, 0)).toISOString();

    return {
      id,
      title,
      content:
        index === 0
          ? "<p>Welcome to the refined public blog experience.</p><h2>Why this matters</h2><p>This post confirms the frontend now reads from the unified blog API.</p>"
          : `<p>Published story ${index + 1} exists to exercise infinite scrolling and list density.</p>`,
      publishedAt: createdAt,
      createdAt,
      updatedAt: createdAt,
    };
  });
}

export async function installBlogApiMocks(page: Page, options: MockOptions = {}) {
  const posts = buildPosts(options.postCount ?? 18);
  const state = {
    comments: [
      {
        id: "33333333-3333-4333-8333-333333333333",
        username: "Guest Reader",
        content: "This is a thoughtful update.",
        createdAt: "2026-03-19T09:00:00.000Z",
        updatedAt: "2026-03-19T09:00:00.000Z",
      },
    ],
  };

  await page.route(/http:\/\/localhost:3000\/v1\/blog\/posts\?.*$/, async (route) => {
    await maybeDelay(options.postListDelayMs);

    if (options.failPosts) {
      await fulfillJson(route, 500, {
        error: {
          code: "request_failed",
          message: "Failed to load posts",
        },
      });
      return;
    }

    const url = new URL(route.request().url());
    const pageValue = Number(url.searchParams.get("page") ?? "1");
    const pageSizeValue = Number(url.searchParams.get("pageSize") ?? "10");
    const sourcePosts = options.emptyPosts ? [] : posts;
    const startIndex = (pageValue - 1) * pageSizeValue;
    const endIndex = startIndex + pageSizeValue;
    const data = sourcePosts.slice(startIndex, endIndex);

    await fulfillJson(route, 200, {
      data,
      meta: {
        page: pageValue,
        pageSize: pageSizeValue,
        total: sourcePosts.length,
      },
    });
  });

  await page.route(
    /http:\/\/localhost:3000\/v1\/blog\/posts\/[^/]+\/comments(?:\?.*)?$/,
    async (route) => {
      const url = new URL(route.request().url());
      const method = route.request().method();

      if (method === "GET") {
        await maybeDelay(options.commentsDelayMs);

        const pageValue = Number(url.searchParams.get("page") ?? "1");
        const pageSizeValue = Number(url.searchParams.get("pageSize") ?? "10");
        const startIndex = (pageValue - 1) * pageSizeValue;
        const endIndex = startIndex + pageSizeValue;

        await fulfillJson(route, 200, {
          data: state.comments.slice(startIndex, endIndex),
          meta: {
            page: pageValue,
            pageSize: pageSizeValue,
            total: state.comments.length,
          },
        });
        return;
      }

      const payload = JSON.parse(route.request().postData() ?? "{}") as {
        username?: string;
        content?: string;
      };

      const nextComment = {
        id: `comment-${state.comments.length + 1}`,
        username: payload.username ?? "Anonymous",
        content: payload.content ?? "",
        createdAt: "2026-03-20T10:00:00.000Z",
        updatedAt: "2026-03-20T10:00:00.000Z",
      };

      state.comments.unshift(nextComment);

      await fulfillJson(route, 201, { data: nextComment });
    }
  );

  await page.route(/http:\/\/localhost:3000\/v1\/blog\/posts\/[^/?]+$/, async (route) => {
    await maybeDelay(options.postDetailDelayMs);

    const url = route.request().url();
    const postId = url.split("/").pop();
    const post = posts.find((item) => item.id === postId);

    if (!post) {
      await fulfillJson(route, 404, {
        error: {
          code: "not_found",
          message: "Post not found",
        },
      });
      return;
    }

    await fulfillJson(route, 200, { data: post });
  });
}
