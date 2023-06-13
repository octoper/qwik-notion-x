import * as types from "notion-types";
import {
  getBlockCollectionId,
  getBlockIcon,
  getBlockParentPage,
  getPageTableOfContents,
  getTextContent,
  uuidToId,
} from "notion-utils";

import { AssetWrapper } from "./components/asset-wrapper";
import { Audio } from "./components/audio";
import { EOI } from "./components/eoi";
import { File } from "./components/file";
import { GoogleDrive } from "./components/google-drive";
// import { LazyImage } from './components/lazy-image'
import { PageAside } from "./components/page-aside";
// import { PageIcon } from './components/page-icon'
// import { PageTitle } from './components/page-title'
// import { SyncPointerBlock } from './components/sync-pointer-block'
import { useNotionContext } from "./context";
import { LinkIcon } from "./icons/link-icon";
import { cs, getListNumber, isUrl } from "./utils";
import { Slot, component$, useSignal } from "@builder.io/qwik";
import { Text } from "./components/text";
import { PageIcon } from "./components/page-icon";
import { PageTitle } from "./components/page-title";
import { Checkbox } from "./components/checkbox";

interface BlockProps {
  block: types.Block;
  level: number;

  className?: string;
  bodyclass?: string;

  header?: any;
  footer?: any;
  pageHeader?: any;
  pageFooter?: any;
  pageTitle?: any;
  pageAside?: any;
  pageCover?: any;

  hideBlockId?: boolean;
  disableHeader?: boolean;
}

// TODO: use react state instead of a global for this
const tocIndentLevelCache: {
  [blockId: string]: number;
} = {};

const pageCoverStyleCache: Record<string, object> = {};

export const Block = component$<BlockProps>((props) => {
  const ctx = useNotionContext();
  const {
    components,
    fullPage,
    darkMode,
    recordMap,
    mapPageUrl,
    mapImageUrl,
    showTableOfContents,
    minTableOfContentsItems,
    defaultPageIcon,
    defaultPageCover,
    defaultPageCoverPosition,
  } = ctx;

  const activeSession = useSignal<any>(null);

  const {
    block,
    level,
    className,
    bodyclass,
    header,
    footer,
    pageHeader,
    pageFooter,
    pageTitle,
    pageAside,
    pageCover,
    hideBlockId,
    disableHeader,
  } = props;

  if (!block) {
    return null;
  }

  // ugly hack to make viewing raw collection views work properly
  // e.g., 6d886ca87ab94c21a16e3b82b43a57fb
  if (level === 0 && block.type === "collection_view") {
    (block as any).type = "collection_view_page";
  }

  const blockId = hideBlockId
    ? "notion-block"
    : `notion-block-${uuidToId(block.id)}`;

  switch (block.type) {
    case "collection_view_page":
    // fallthrough
    case "page":
      if (level === 0) {
        const {
          page_icon = defaultPageIcon,
          page_cover = defaultPageCover,
          page_cover_position = defaultPageCoverPosition,
          page_full_width,
          page_small_text,
        } = block.format || {};

        if (fullPage) {
          const properties =
            block.type === "page"
              ? block.properties
              : {
                  title:
                    recordMap.collection[getBlockCollectionId(block, recordMap)]
                      ?.value?.name,
                };

          const coverPosition = (1 - (page_cover_position || 0.5)) * 100;
          const pageCoverObjectPosition = `center ${coverPosition}%`;
          let pageCoverStyle = pageCoverStyleCache[pageCoverObjectPosition];
          if (!pageCoverStyle) {
            pageCoverStyle = pageCoverStyleCache[pageCoverObjectPosition] = {
              objectPosition: pageCoverObjectPosition,
            };
          }

          const pageIcon = getBlockIcon(block, recordMap) ?? defaultPageIcon;
          const isPageIconUrl = pageIcon && isUrl(pageIcon);

          const toc = getPageTableOfContents(
            block as types.PageBlock,
            recordMap
          );

          const hasToc =
            showTableOfContents && toc.length >= minTableOfContentsItems;
          const hasAside = (hasToc || pageAside) && !page_full_width;
          const hasPageCover = pageCover || page_cover;

          return (
            <div
              class={cs(
                "notion",
                "notion-app",
                darkMode ? "dark-mode" : "light-mode",
                blockId,
                className
              )}
            >
              <div class="notion-viewport" />

              <div class="notion-frame">
                {!disableHeader && <components.Header block={block} />}
                {header}

                <div class="notion-page-scroller">
                  {hasPageCover &&
                    (pageCover ? (
                      pageCover
                    ) : (
                      <div class="notion-page-cover-wrapper">
                        {/* eslint-disable-next-line qwik/jsx-img */}
                        <img
                          src={mapImageUrl(page_cover, block)}
                          alt={getTextContent(properties?.title)}
                          priority={true}
                          class="notion-page-cover"
                          style={pageCoverStyle}
                        />
                      </div>
                    ))}

                  <main
                    class={cs(
                      "notion-page",
                      hasPageCover
                        ? "notion-page-has-cover"
                        : "notion-page-no-cover",
                      page_icon
                        ? "notion-page-has-icon"
                        : "notion-page-no-icon",
                      isPageIconUrl
                        ? "notion-page-has-image-icon"
                        : "notion-page-has-text-icon",
                      "notion-full-page",
                      page_full_width && "notion-full-width",
                      page_small_text && "notion-small-text",
                      bodyclass
                    )}
                  >
                    {page_icon && (
                      <PageIcon
                        block={block}
                        defaultIcon={defaultPageIcon}
                        inline={false}
                      />
                    )}

                    {pageHeader}

                    <h1 class="notion-title">
                      {pageTitle ?? (
                        <Text value={properties?.title} block={block} />
                      )}
                    </h1>

                    {(block.type === "collection_view_page" ||
                      (block.type === "page" &&
                        block.parent_table === "collection")) && (
                      <components.Collection block={block} ctx={ctx} />
                    )}

                    {block.type !== "collection_view_page" && (
                      <div
                        class={cs(
                          "notion-page-content",
                          hasAside && "notion-page-content-has-aside",
                          hasToc && "notion-page-content-has-toc"
                        )}
                      >
                        <article class="notion-page-content-inner">
                          <Slot />
                        </article>

                        {hasAside && (
                          <PageAside
                            toc={toc}
                            activeSection={activeSession.value}
                            setActiveSection={(val) =>
                              (activeSession.value = val)
                            }
                            hasToc={hasToc}
                            hasAside={hasAside}
                            pageAside={pageAside}
                          />
                        )}
                      </div>
                    )}

                    {pageFooter}
                  </main>

                  {footer}
                </div>
              </div>
            </div>
          );
        } else {
          return (
            <main
              class={cs(
                "notion",
                darkMode ? "dark-mode" : "light-mode",
                "notion-page",
                page_full_width && "notion-full-width",
                page_small_text && "notion-small-text",
                blockId,
                className,
                bodyclass
              )}
            >
              <div class="notion-viewport" />

              {pageHeader}

              {(block.type === "collection_view_page" ||
                (block.type === "page" &&
                  block.parent_table === "collection")) && (
                <components.Collection block={block} ctx={ctx} />
              )}

              {block.type !== "collection_view_page" && <Slot></Slot>}

              {pageFooter}
            </main>
          );
        }
      } else {
        const blockColor = block.format?.block_color;

        return (
          <components.PageLink
            class={cs(
              "notion-page-link",
              blockColor && `notion-${blockColor}`,
              blockId
            )}
            href={block.id}
          >
            <PageTitle block={block}>Hello</PageTitle>
          </components.PageLink>
        );
      }

    case "header":
    // fallthrough
    case "sub_header":
    // fallthrough
    case "sub_sub_header": {
      if (!block.properties) return null;

      const blockColor = block.format?.block_color;
      const id = uuidToId(block.id);
      const title =
        getTextContent(block.properties.title) || `Notion Header ${id}`;

      // we use a cache here because constructing the ToC is non-trivial
      let indentLevel = tocIndentLevelCache[block.id];
      let indentLevelClass: string;

      if (indentLevel === undefined) {
        const page = getBlockParentPage(block, recordMap);

        if (page) {
          const toc = getPageTableOfContents(page, recordMap);
          const tocItem = toc.find((tocItem) => tocItem.id === block.id);

          if (tocItem) {
            indentLevel = tocItem.indentLevel;
            tocIndentLevelCache[block.id] = indentLevel;
          }
        }
      }

      if (indentLevel !== undefined) {
        indentLevelClass = `notion-h-indent-${indentLevel}`;
      }

      const isH1 = block.type === "header";
      const isH2 = block.type === "sub_header";
      const isH3 = block.type === "sub_sub_header";

      const classNameStr = cs(
        isH1 && "notion-h notion-h1",
        isH2 && "notion-h notion-h2",
        isH3 && "notion-h notion-h3",
        blockColor && `notion-${blockColor}`,
        indentLevelClass!,
        blockId
      );

      const innerHeader = (
        <span>
          <div id={id} class="notion-header-anchor" />
          {!block.format?.toggleable && (
            <a class="notion-hash-link" href={`#${id}`} title={title}>
              <LinkIcon />
            </a>
          )}

          <span class="notion-h-title">
            <Text value={block.properties.title} block={block} />
          </span>
        </span>
      );
      let headerBlock = null;

      //page title takes the h1 so all header blocks are greater
      if (isH1) {
        headerBlock = (
          <h2 class={classNameStr} data-id={id}>
            {innerHeader}
          </h2>
        );
      } else if (isH2) {
        headerBlock = (
          <h3 class={classNameStr} data-id={id}>
            {innerHeader}
          </h3>
        );
      } else {
        headerBlock = (
          <h4 class={classNameStr} data-id={id}>
            {innerHeader}
          </h4>
        );
      }

      if (block.format?.toggleable) {
        return (
          <details class={cs("notion-toggle", blockId)}>
            <summary>{headerBlock}</summary>
            <div>
              <Slot></Slot>
            </div>
          </details>
        );
      } else {
        return headerBlock;
      }
    }

    case "divider":
      return <hr class={cs("notion-hr", blockId)} />;

    case "text": {
      if (!block.properties && !block.content?.length) {
        return <div class={cs("notion-blank", blockId)}>&nbsp;</div>;
      }

      const blockColor = block.format?.block_color;

      return (
        <div
          class={cs(
            "notion-text",
            blockColor && `notion-${blockColor}`,
            blockId
          )}
        >
          {block.properties?.title && (
            <Text value={block.properties.title} block={block} />
          )}

          <div class="notion-text-children">
            <Slot></Slot>
          </div>
        </div>
      );
    }

    case "bulleted_list":
    // fallthrough
    case "numbered_list": {
      const wrapList = (SLOT: any, start?: number) =>
        block.type === "bulleted_list" ? (
          <ul class={cs("notion-list", "notion-list-disc", blockId)}>
            <Slot></Slot>
          </ul>
        ) : (
          <ol
            start={start}
            class={cs("notion-list", "notion-list-numbered", blockId)}
          >
            <Slot />
          </ol>
        );

      let output = null;

      if (block.content) {
        output = (
          <>
            {block.properties && (
              <li>
                <Text value={block.properties.title} block={block} />
              </li>
            )}
            {wrapList(Slot)}
          </>
        );
      } else {
        output = block.properties ? (
          <li>
            <Text value={block.properties.title} block={block} />
          </li>
        ) : null;
      }

      const isTopLevel =
        block.type !== recordMap.block[block.parent_id]?.value?.type;
      const start = getListNumber(block.id, recordMap.block);

      return isTopLevel ? wrapList(output, start) : output;
    }

    case "embed":
      return <components.Embed blockId={blockId} block={block} />;
    case "tweet":
    // fallthrough
    case "maps":
    // fallthrough
    case "pdf":
    // fallthrough
    case "figma":
    // fallthrough
    case "typeform":
    // fallthrough
    case "codepen":
    // fallthrough
    case "excalidraw":
    // fallthrough
    case "image":
    // fallthrough
    case "gist":
    // fallthrough
    case "video":
      return <AssetWrapper blockId={blockId} block={block} />;

    case "drive": {
      const properties = block.format?.drive_properties;
      if (!properties) {
        //check if this drive actually needs to be embeded ex. google sheets.
        if (block.format?.display_source) {
          return <AssetWrapper blockId={blockId} block={block} />;
        }
      }

      return (
        <GoogleDrive block={block as types.GoogleDriveBlock} class={blockId} />
      );
    }

    case "audio":
      return <Audio block={block as types.AudioBlock} class={blockId} />;

    case "file":
      return <File block={block as types.FileBlock} class={blockId} />;

    case "equation":
      return (
        <components.Equation
          block={block as types.EquationBlock}
          inline={false}
          class={blockId}
        />
      );

    case "code":
      return <components.Code block={block as types.CodeBlock} />;

    case "column_list":
      return (
        <div class={cs("notion-row", blockId)}>
          <Slot />
        </div>
      );

    case "column": {
      // note: notion uses 46px
      const spacerWidth = `min(32px, 4vw)`;
      const ratio = block.format?.column_ratio || 0.5;
      const parent = recordMap.block[block.parent_id]?.value;
      const columns =
        parent?.content?.length || Math.max(2, Math.ceil(1.0 / ratio));

      const width = `calc((100% - (${
        columns - 1
      } * ${spacerWidth})) * ${ratio})`;
      const style = { width };

      return (
        <>
          <div class={cs("notion-column", blockId)} style={style}>
            <Slot />
          </div>

          <div class="notion-spacer" />
        </>
      );
    }

    case "quote": {
      if (!block.properties) return null;

      const blockColor = block.format?.block_color;

      return (
        <blockquote
          class={cs(
            "notion-quote",
            blockColor && `notion-${blockColor}`,
            blockId
          )}
        >
          <div>
            <Text value={block.properties.title} block={block} />
          </div>
          <Slot />
        </blockquote>
      );
    }

    case "collection_view":
      return <components.Collection block={block} class={blockId} ctx={ctx} />;

    case "callout":
      if (components.Callout) {
        return <components.Callout block={block} class={blockId} />;
      } else {
        return (
          <div
            class={cs(
              "notion-callout",
              block.format?.block_color &&
                `notion-${block.format?.block_color}_co`,
              blockId
            )}
          >
            <PageIcon block={block} />

            <div class="notion-callout-text">
              <Text value={block.properties?.title} block={block} />
              <Slot />
            </div>
          </div>
        );
      }

    case "bookmark": {
      if (!block.properties) return null;

      const link = block.properties.link;
      if (!link || !link[0]?.[0]) return null;

      let title = getTextContent(block.properties.title);
      if (!title) {
        title = getTextContent(link);
      }

      if (title) {
        if (title.startsWith("http")) {
          try {
            const url = new URL(title);
            title = url.hostname;
          } catch (err) {
            // ignore invalid links
          }
        }
      }

      return (
        <div class="notion-row">
          <components.Link
            target="_blank"
            rel="noopener noreferrer"
            class={cs(
              "notion-bookmark",
              block.format?.block_color && `notion-${block.format.block_color}`,
              blockId
            )}
            href={link[0][0]}
          >
            <div>
              {title && (
                <div class="notion-bookmark-title">
                  <Text value={[[title]]} block={block} />
                </div>
              )}

              {block.properties?.description && (
                <div class="notion-bookmark-description">
                  <Text value={block.properties?.description} block={block} />
                </div>
              )}

              <div class="notion-bookmark-link">
                {block.format?.bookmark_icon && (
                  <div class="notion-bookmark-link-icon">
                    {/* eslint-disable-next-line qwik/jsx-img */}
                    <img
                      src={mapImageUrl(block.format?.bookmark_icon, block)}
                      alt={title}
                    />
                  </div>
                )}

                <div class="notion-bookmark-link-text">
                  <Text value={link} block={block} />
                </div>
              </div>
            </div>

            {block.format?.bookmark_cover && (
              <div class="notion-bookmark-image">
                {/* eslint-disable-next-line qwik/jsx-img */}
                <img
                  src={mapImageUrl(block.format?.bookmark_cover, block)}
                  alt={getTextContent(block.properties?.title)}
                  style={{
                    objectFit: "cover",
                  }}
                />
              </div>
            )}
          </components.Link>
        </div>
      );
    }

    case "toggle":
      return (
        <details class={cs("notion-toggle", blockId)}>
          <summary>
            <Text value={block.properties?.title} block={block} />
          </summary>

          <div>
            <Slot />
          </div>
        </details>
      );

    case "table_of_contents": {
      const page = getBlockParentPage(block, recordMap);
      if (!page) return null;

      const toc = getPageTableOfContents(page, recordMap);
      const blockColor = block.format?.block_color;

      return (
        <div
          class={cs(
            "notion-table-of-contents",
            blockColor && `notion-${blockColor}`,
            blockId
          )}
        >
          {toc.map((tocItem) => (
            <a
              key={tocItem.id}
              href={`#${uuidToId(tocItem.id)}`}
              class="notion-table-of-contents-item"
            >
              <span
                class="notion-table-of-contents-item-body"
                style={{
                  display: "inline-block",
                  marginLeft: tocItem.indentLevel * 24,
                }}
              >
                {tocItem.text}
              </span>
            </a>
          ))}
        </div>
      );
    }

    case "to_do": {
      const isChecked = block.properties?.checked?.[0]?.[0] === "Yes";

      return (
        <div class={cs("notion-to-do", blockId)}>
          <div class="notion-to-do-item">
            <Checkbox blockId={blockId} isChecked={isChecked} />

            <div
              class={cs(
                "notion-to-do-body",
                isChecked && `notion-to-do-checked`
              )}
            >
              <Text value={block.properties?.title} block={block} />
            </div>
          </div>

          <div class="notion-to-do-children">
            <Slot></Slot>
          </div>
        </div>
      );
    }

    case "transclusion_container":
      return (
        <div class={cs("notion-sync-block", blockId)}>
          <Slot></Slot>
        </div>
      );

    case "transclusion_reference":
      return null;
    //   return <SyncPointerBlock block={block} level={level + 1} {...props} />;

    case "alias": {
      const blockPointerId = block?.format?.alias_pointer?.id;
      const linkedBlock = recordMap.block[blockPointerId]?.value;
      if (!linkedBlock) {
        console.log('"alias" missing block', blockPointerId);
        return null;
      }

      return (
        <components.PageLink
          class={cs("notion-page-link", blockPointerId)}
          href={mapPageUrl(blockPointerId)}
        >
          Hello
          <PageTitle block={linkedBlock}>
            <Slot />
          </PageTitle>
        </components.PageLink>
      );
    }

    case "table":
      return (
        <table class={cs("notion-simple-table", blockId)}>
          <tbody>
            <Slot></Slot>
          </tbody>
        </table>
      );

    case "table_row": {
      const tableBlock = recordMap.block[block.parent_id]
        ?.value as types.TableBlock;
      const order = tableBlock.format?.table_block_column_order;
      const formatMap = tableBlock.format?.table_block_column_format;
      const backgroundColor = block.format?.block_color;

      if (!tableBlock || !order) {
        return null;
      }

      return (
        <tr
          class={cs(
            "notion-simple-table-row",
            backgroundColor && `notion-${backgroundColor}`,
            blockId
          )}
        >
          {order.map((column) => {
            const color = formatMap?.[column]?.color;

            return (
              <td
                key={column}
                class={color ? `notion-${color}` : ""}
                style={{
                  width: formatMap?.[column]?.width || 120,
                }}
              >
                <div class="notion-simple-table-cell">
                  <Text
                    value={block.properties?.[column] || [["ㅤ"]]}
                    block={block}
                  />
                </div>
              </td>
            );
          })}
        </tr>
      );
    }

    case "external_object_instance":
      return <EOI block={block} class={blockId} />;

    default:
      console.log(
        "Unsupported type " + (block as any).type,
        JSON.stringify(block, null, 2)
      );

      return <div />;
  }

  return null;
});
