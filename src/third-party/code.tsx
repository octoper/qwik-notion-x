import copyToClipboard from "clipboard-copy";
import { CodeBlock } from "notion-types";
import { getBlockTitle } from "notion-utils";
import { highlightElement } from "prismjs";
import "prismjs/components/prism-clike.min.js";
import "prismjs/components/prism-css-extras.min.js";
import "prismjs/components/prism-css.min.js";
import "prismjs/components/prism-javascript.min.js";
import "prismjs/components/prism-js-extras.min.js";
import "prismjs/components/prism-json.min.js";
import "prismjs/components/prism-jsx.min.js";
import "prismjs/components/prism-tsx.min.js";
import "prismjs/components/prism-typescript.min.js";

import { Text } from "../components/text";
import { useNotionContext } from "../context";
import CopyIcon from "../icons/copy";
import { cs } from "../utils";
import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";

export const Code = component$<{
  block: CodeBlock;
  defaultLanguage?: string;
  class?: string;
}>(({ block, defaultLanguage = "typescript", class: className }) => {
  const isCopied = useSignal(false);
  const copyTimeout = useSignal<number|null>(null);
  const { recordMap } = useNotionContext();
  const content = getBlockTitle(block, recordMap);
  const language = (
    block.properties?.language?.[0]?.[0] || defaultLanguage
  ).toLowerCase();
  const caption = block.properties.caption;

  const codeRef = useSignal<any>();

  useVisibleTask$(() => {
    if (codeRef.value) {
      try {
        highlightElement(codeRef.value);
      } catch (err) {
        console.warn("prismjs highlight error", err);
      }
    }
  });

  const onClickCopyToClipboard = $(() => {
    copyToClipboard(content);
    isCopied.value = true;

    if (copyTimeout.value) {
      clearTimeout(copyTimeout.value);
      copyTimeout.value = null;
    }

    copyTimeout.value = setTimeout(() => {
      isCopied.value = false;
    }, 1200) as unknown as number;
  });

  const copyButton = (
    <div class="notion-code-copy-button" onClick$={onClickCopyToClipboard}>
      <CopyIcon />
    </div>
  );

  return (
    <>
      <pre class={cs("notion-code", className)}>
        <div class="notion-code-copy">
          {copyButton}

          {isCopied && (
            <div class="notion-code-copy-tooltip">
              <div>{isCopied ? "Copied" : "Copy"}</div>
            </div>
          )}
        </div>

        <code class={`language-${language}`} ref={codeRef}>
          {content}
        </code>
      </pre>

      {caption && (
        <figcaption class="notion-asset-caption">
          <Text value={caption} block={block} />
        </figcaption>
      )}
    </>
  );
});
