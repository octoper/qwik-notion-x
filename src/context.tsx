import { ExtendedRecordMap } from "notion-types";

import {
  MapImageUrlFn,
  MapPageUrlFn,
  NotionComponents,
  SearchNotionFn,
} from "./types";
import { defaultMapImageUrl, defaultMapPageUrl } from "./utils";
import {
    $,
  JSXNode,
  Slot,
  component$,
  createContextId,
  noSerialize,
  useComputed$,
  useContext,
  useContextProvider,
  useStore,
} from "@builder.io/qwik";
import { Header } from "./components/header";

export interface NotionContext {
  recordMap: ExtendedRecordMap;
  components: NotionComponents;

  mapPageUrl: MapPageUrlFn;
  mapImageUrl: MapImageUrlFn;
  searchNotion?: SearchNotionFn;
  isShowingSearch?: boolean;
  onHideSearch?: () => void;

  rootPageId?: string;
  rootDomain?: string;

  fullPage: boolean;
  darkMode: boolean;
  previewImages: boolean;
  forceCustomImages: boolean;
  showCollectionViewDropdown: boolean;
  showTableOfContents: boolean;
  minTableOfContentsItems: number;
  linkTableTitleProperties: boolean;
  isLinkCollectionToUrlProperty: boolean;

  defaultPageIcon?: string;
  defaultPageCover?: string;
  defaultPageCoverPosition?: number;

  zoom: any;
}

export interface PartialNotionContext {
  recordMap?: ExtendedRecordMap;
  components?: Partial<NotionComponents>;

  mapPageUrl?: MapPageUrlFn;
  mapImageUrl?: MapImageUrlFn;
  searchNotion?: SearchNotionFn;
  isShowingSearch?: boolean;
  onHideSearch?: () => void;

  rootPageId?: string;
  rootDomain?: string;

  fullPage?: boolean;
  darkMode?: boolean;
  previewImages?: boolean;
  forceCustomImages?: boolean;
  showCollectionViewDropdown?: boolean;
  linkTableTitleProperties?: boolean;
  isLinkCollectionToUrlProperty?: boolean;

  showTableOfContents?: boolean;
  minTableOfContentsItems?: number;

  defaultPageIcon?: string;
  defaultPageCover?: string;
  defaultPageCoverPosition?: number;

  zoom?: any;
}

const DefaultLink = component$((props: any) => (
  <a target="_blank" rel="noopener noreferrer" {...props}><Slot/></a>
));

const DefaultPageLink = component$((props: any) => {
    return <a {...props}><Slot/></a>;
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const dummyLink = ({ href, rel, target, title, ...rest }: any) => (
  <span {...rest}><Slot/></span>
);

const dummyComponent = (name: string) => {
  console.warn(
    `Warning: using empty component "${name}" (you should override this in NotionRenderer.components)`
  );

  return null;
};

// TODO: should we use React.memo here?
// https://reactjs.org/docs/react-api.html#reactmemo
const dummyOverrideFn = $((_: any, defaultValueFn: () => JSXNode) =>
  defaultValueFn());

const defaultComponents: NotionComponents = {
  Image: null, // disable custom images by default
  Link: DefaultLink,
  PageLink: DefaultPageLink,
  //   Checkbox: DefaultCheckbox,
  Callout: undefined, // use the built-in callout rendering by default

  Code: dummyComponent("Code"),
  Equation: dummyComponent("Equation"),

  Collection: dummyComponent("Collection"),
  Property: undefined, // use the built-in property rendering by default

  propertyTextValue: dummyOverrideFn,
  propertySelectValue: dummyOverrideFn,
  propertyRelationValue: dummyOverrideFn,
  propertyFormulaValue: dummyOverrideFn,
  propertyTitleValue: dummyOverrideFn,
  propertyPersonValue: dummyOverrideFn,
  propertyFileValue: dummyOverrideFn,
  propertyCheckboxValue: dummyOverrideFn,
  propertyUrlValue: dummyOverrideFn,
  propertyEmailValue: dummyOverrideFn,
  propertyPhoneNumberValue: dummyOverrideFn,
  propertyNumberValue: dummyOverrideFn,
  propertyLastEditedTimeValue: dummyOverrideFn,
  propertyCreatedTimeValue: dummyOverrideFn,
  propertyDateValue: dummyOverrideFn,

  Pdf: dummyComponent("Pdf"),
  Tweet: dummyComponent("Tweet"),
  Modal: dummyComponent("Modal"),

  Header: Header,
  Embed: dummyComponent("Embed"),
};

const defaultNotionContext: NotionContext = {
  recordMap: {
    block: {},
    collection: {},
    collection_view: {},
    collection_query: {},
    notion_user: {},
    signed_urls: {},
  },

  components: defaultComponents,

  mapPageUrl: defaultMapPageUrl(),
  mapImageUrl: defaultMapImageUrl,
  searchNotion: undefined,
  isShowingSearch: false,
  onHideSearch: undefined,

  fullPage: false,
  darkMode: false,
  previewImages: false,
  forceCustomImages: false,
  showCollectionViewDropdown: true,
  linkTableTitleProperties: true,
  isLinkCollectionToUrlProperty: false,

  showTableOfContents: false,
  minTableOfContentsItems: 3,

  defaultPageIcon: undefined,
  defaultPageCover: undefined,
  defaultPageCoverPosition: 0.5,

  zoom: null,
};

export const NotionContext = createContextId<NotionContext>("notion-x");

export const NotionContextProvider = component$<PartialNotionContext>(
  ({
    components: themeComponents = {},
    mapPageUrl,
    mapImageUrl,
    rootPageId,
    ...rest
  }) => {
    const theme = noSerialize(themeComponents);

    const wrappedThemeComponents = useComputed$(() => ({
      ...theme,
    }));

    for (const key of Object.keys(wrappedThemeComponents.value)) {
      if (!wrappedThemeComponents.value[key]) {
        delete wrappedThemeComponents.value[key];
      }
    }

    const contextStore = useStore<NotionContext>({
      ...defaultNotionContext,
      ...rest,
      rootPageId,
      mapPageUrl: mapPageUrl ?? defaultMapPageUrl(rootPageId),
      mapImageUrl: mapImageUrl ?? noSerialize(defaultMapImageUrl),
      components: { ...defaultComponents, ...wrappedThemeComponents.value },
    });

    useContextProvider(NotionContext, contextStore);

    return (
      <>
        <Slot></Slot>
      </>
    );
  }
);

export const useNotionContext = (): NotionContext => {
    return useContext(NotionContext)
}
