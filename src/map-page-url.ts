import { $ } from "@builder.io/qwik";

export const defaultMapPageUrl = (rootPageId?: string) => $((pageId: string) => {
  pageId = (pageId || "").replace(/-/g, "");

  if (rootPageId && pageId === rootPageId) {
    return "/";
  } else {
    return `/${pageId}`;
  }
});
