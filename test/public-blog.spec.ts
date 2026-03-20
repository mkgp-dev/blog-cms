import { expect, test } from "@playwright/test";
import { installBlogApiMocks } from "./helpers/mockBlogApi";

test("admin routes still require auth and redirect to login", async ({ page }) => {
  await page.goto("/admin/posts");

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
});

test("fixed glass navigation renders and the feed loads the first 9 posts", async ({ page }) => {
  await installBlogApiMocks(page, { postCount: 18 });

  await page.goto("/");

  await expect(page.getByTestId("public-nav-shell")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Published posts" })).toBeVisible();
  await expect(page.getByText("Published Post", { exact: true })).toBeVisible();
  await expect(page.getByTestId("post-card")).toHaveCount(9);
  await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
  expect(
    await page.getByTestId("public-nav-shell").evaluate((element) => getComputedStyle(element).position),
  ).toBe("fixed");
});

test("scroll threshold automatically loads the next 9 posts", async ({ page }) => {
  await installBlogApiMocks(page, { postCount: 18 });

  await page.goto("/");

  await expect(page.getByTestId("post-card")).toHaveCount(9);

  await page.getByTestId("post-feed-sentinel").scrollIntoViewIfNeeded();

  await expect(page.getByTestId("post-card")).toHaveCount(18);
});

test("fallback load more button works when auto loading is unavailable", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "IntersectionObserver", {
      configurable: true,
      value: undefined,
    });
  });
  await installBlogApiMocks(page, { postCount: 18 });

  await page.goto("/");

  await expect(page.getByTestId("post-card")).toHaveCount(9);
  await page.getByTestId("load-more-posts").click();
  await expect(page.getByTestId("post-card")).toHaveCount(18);
});

test("post detail renders the full article content and unified comments flow", async ({ page }) => {
  await installBlogApiMocks(page, { postCount: 18 });

  await page.goto("/content/11111111-1111-4111-8111-111111111111");

  await expect(page.getByRole("heading", { name: "Published Post" })).toBeVisible();
  await expect(page.getByText("Why this matters")).toBeVisible();
  await expect(
    page.getByText("This post confirms the frontend now reads from the unified blog API."),
  ).toBeVisible();
  await expect(page.getByText("Guest Reader")).toBeVisible();

  const formBox = await page.getByTestId("comment-form").boundingBox();
  const listBox = await page.getByTestId("comment-list").boundingBox();
  expect(formBox?.y ?? 0).toBeLessThan(listBox?.y ?? 0);

  await page.getByLabel("Name").fill("New Reader");
  await page.getByLabel("Comment").fill("Looking forward to more posts.");
  await page.getByRole("button", { name: "Submit comment" }).click();

  await expect(page.getByText("Comment submitted.")).toBeVisible();
  await expect(page.getByText("New Reader")).toBeVisible();
  await expect(page.getByText("Looking forward to more posts.")).toBeVisible();
});

test("skeleton loading states render for post lists and comments", async ({ page }) => {
  await installBlogApiMocks(page, {
    postCount: 18,
    postListDelayMs: 1500,
    postDetailDelayMs: 1500,
    commentsDelayMs: 1500,
  });

  await page.goto("/");
  await expect(page.getByTestId("post-list-skeleton")).toBeVisible();
  await expect(page.getByTestId("post-card").first()).toBeVisible();

  await page.goto("/content/11111111-1111-4111-8111-111111111111");
  await expect(page.getByTestId("post-detail-skeleton")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Published Post" })).toBeVisible();
  await expect(page.getByTestId("comments-skeleton")).toBeVisible();
  await expect(page.getByText("Guest Reader")).toBeVisible();
});

test("mock mode renders a richer dataset without backend access", async ({ page }) => {
  await page.addInitScript(() => {
    (
      window as Window & {
        __BLOG_PUBLIC_DATA_SOURCE__?: "mock" | "real";
      }
    ).__BLOG_PUBLIC_DATA_SOURCE__ = "mock";
  });
  await page.route("http://localhost:3000/**", async (route) => {
    await route.abort();
  });

  await page.goto("/");

  await expect(page.getByText("Mock Chronicle 01")).toBeVisible();
  await expect(page.getByTestId("post-card")).toHaveCount(9);
  await page.getByTestId("load-more-posts").click();
  await expect(page.getByText("Mock Chronicle 18")).toBeVisible();
});

test("landing page handles empty states", async ({ page }) => {
  await installBlogApiMocks(page, { emptyPosts: true });

  await page.goto("/");

  await expect(page.getByText("No published posts are available yet.")).toBeVisible();
});

test("landing page handles API error states", async ({ page }) => {
  await installBlogApiMocks(page, { failPosts: true });

  await page.goto("/");

  await expect(page.getByText("Failed to load posts")).toBeVisible();
});
