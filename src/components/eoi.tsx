import { Block } from "notion-types";

import { useNotionContext } from "../context";
import SvgTypeGitHub from "../icons/type-github";
import { cs, formatNotionDateTime } from "../utils";
import { component$ } from "@builder.io/qwik";

// External Object Instance
export const EOI = component$<{
  block: Block;
  inline?: boolean;
  class?: string;
}>(({ block, inline, class: className }) => {
  const { components } = useNotionContext();
  const { original_url, attributes, domain } = block?.format || {};
  if (!original_url || !attributes) {
    return null;
  }

  const title = attributes.find((attr) => attr.id === "title")?.values[0];
  let owner = attributes.find((attr) => attr.id === "owner")?.values[0];
  const lastUpdatedAt = attributes.find((attr) => attr.id === "updated_at")
    ?.values[0];
  const lastUpdated = lastUpdatedAt
    ? formatNotionDateTime(lastUpdatedAt)
    : null;
  let externalImage;

  switch (domain) {
    case "github.com":
      externalImage = <SvgTypeGitHub />;
      if (owner) {
        const parts = owner.split("/");
        owner = parts[parts.length - 1];
      }
      break;

    default:
      console.log(
        `Unsupported external_object_instance domain "${domain}"`,
        JSON.stringify(block, null, 2)
      );

      return null;
  }

  return (
    <components.Link
      target="_blank"
      rel="noopener noreferrer"
      href={original_url}
      class={cs(
        "notion-external",
        inline ? "notion-external-mention" : "notion-external-block notion-row",
        className
      )}
    >
      {externalImage && (
        <div class="notion-external-image">{externalImage}</div>
      )}

      <div class="notion-external-description">
        <div class="notion-external-title">{title}</div>

        {(owner || lastUpdated) && (
          <div class="notion-external-subtitle">
            {owner && <span>{owner}</span>}
            {owner && lastUpdated && <span> • </span>}
            {lastUpdated && <span>Updated {lastUpdated}</span>}
          </div>
        )}
      </div>
    </components.Link>
  );
});
