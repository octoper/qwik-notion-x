import { Block, CalloutBlock, PageBlock } from "notion-types";
import { getBlockIcon, getBlockTitle } from "notion-utils";

import { useNotionContext } from "../context";
import { DefaultPageIcon } from "../icons/default-page-icon";
import { cs, isUrl } from "../utils";
import { LazyImage } from "./lazy-image";
import { component$ } from "@builder.io/qwik";

const isIconBlock = (value: Block): value is PageBlock | CalloutBlock => {
  return (
    value.type === "page" ||
    value.type === "callout" ||
    value.type === "collection_view" ||
    value.type === "collection_view_page"
  );
};

export const PageIcon = component$<{
  block: Block;
  class?: string;
  inline?: boolean;
  hideDefaultIcon?: boolean;
  defaultIcon?: string;
}>(
  ({
    block,
    class: className,
    inline = true,
    hideDefaultIcon = false,
    defaultIcon,
  }) => {
    const { mapImageUrl, recordMap, darkMode } = useNotionContext();
    let isImage = false;
    let content: any = null;

    if (isIconBlock(block)) {
      const icon = getBlockIcon(block, recordMap)?.trim() || defaultIcon;
      const title = getBlockTitle(block, recordMap);

      if (icon && isUrl(icon)) {
        const url = mapImageUrl(icon, block);
        isImage = true;

        content = (
          <LazyImage
            src={url}
            alt={title || "page icon"}
            class={cs(className, "notion-page-icon")}
          />
        );
      } else if (icon && icon.startsWith("/icons/")) {
        const url =
          "https://www.notion.so" +
          icon +
          "?mode=" +
          (darkMode ? "dark" : "light");

        content = (
          <LazyImage
            src={url}
            alt={title || "page icon"}
            class={cs(className, "notion-page-icon")}
          />
        );
      } else if (!icon) {
        if (!hideDefaultIcon) {
          isImage = true;
          content = (
            <DefaultPageIcon
              class={cs(className, "notion-page-icon")}
              alt={title ? title : "page icon"}
            />
          );
        }
      } else {
        isImage = false;
        content = (
          <span
            class={cs(className, "notion-page-icon")}
            role="img"
            aria-label={icon}
          >
            {icon}
          </span>
        );
      }
    }

    if (!content) {
      return null;
    }

    return (
      <div
        class={cs(
          inline ? "notion-page-icon-inline" : "notion-page-icon-hero",
          isImage ? "notion-page-icon-image" : "notion-page-icon-span"
        )}
      >
        {content}
      </div>
    );
  }
);
