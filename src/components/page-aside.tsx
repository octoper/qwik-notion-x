import throttle from "lodash.throttle";
import { TableOfContentsEntry, uuidToId } from "notion-utils";

import { cs } from "../utils";
import {
  Component,
  component$,
  useComputed$,
  useTask$,
} from "@builder.io/qwik";

export const PageAside = component$<{
  toc: Array<TableOfContentsEntry>;
  activeSection: string | null;
  setActiveSection: (activeSection: string | null) => unknown;
  hasToc: boolean;
  hasAside: boolean;
  pageAside?: Component<any>;
  className?: string;
}>(
  ({
    toc,
    activeSection,
    setActiveSection,
    pageAside,
    hasToc,
    hasAside,
    className,
  }) => {
    const throttleMs = 100;
    const actionSectionScrollSpy = useComputed$(() =>
      throttle(() => {
        const sections = document.getElementsByClassName("notion-h");

        let prevBBox = null;
        let currentSectionId = activeSection;

        for (let i = 0; i < sections.length; ++i) {
          const section = sections[i];
          if (!section || !(section instanceof Element)) continue;

          if (!currentSectionId) {
            currentSectionId = section.getAttribute("data-id");
          }

          const bbox = section.getBoundingClientRect();
          const prevHeight = prevBBox ? bbox.top - prevBBox.bottom : 0;
          const offset = Math.max(150, prevHeight / 4);

          // GetBoundingClientRect returns values relative to the viewport
          if (bbox.top - offset < 0) {
            currentSectionId = section.getAttribute("data-id");

            prevBBox = bbox;
            continue;
          }

          // No need to continue loop, if last element has been detected
          break;
        }

        setActiveSection(currentSectionId);
      }, throttleMs)
    );

    useTask$(() => {
      if (!hasToc) {
        return;
      }

      window.addEventListener("scroll", actionSectionScrollSpy.value);

      actionSectionScrollSpy.value();

      return () => {
        window.removeEventListener("scroll", actionSectionScrollSpy.value);
      };
    });

    if (!hasAside) {
      return null;
    }

    return (
      <aside class={cs("notion-aside", className)}>
        {hasToc && (
          <div class="notion-aside-table-of-contents">
            <div class="notion-aside-table-of-contents-header">
              Table of Contents
            </div>

            <nav class="notion-table-of-contents">
              {toc.map((tocItem) => {
                const id = uuidToId(tocItem.id);

                return (
                  <a
                    key={id}
                    href={`#${id}`}
                    class={cs(
                      "notion-table-of-contents-item",
                      `notion-table-of-contents-item-indent-level-${tocItem.indentLevel}`,
                      activeSection === id &&
                        "notion-table-of-contents-active-item"
                    )}
                  >
                    <span
                      class="notion-table-of-contents-item-body"
                      style={{
                        display: "inline-block",
                        marginLeft: tocItem.indentLevel * 16,
                      }}
                    >
                      {tocItem.text}
                    </span>
                  </a>
                );
              })}
            </nav>
          </div>
        )}

        {pageAside}
      </aside>
    );
  }
);
