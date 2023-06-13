import {
  component$,
  useSignal,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { NotionRenderer } from "./renderer";
import { ExtendedRecordMap } from "notion-types";
import { NotionAPI } from "notion-client";

export const Test = component$(() => {
  const recordMap = useSignal<ExtendedRecordMap>();
  const pageId = useSignal<string>("067dd719a912471ea9a3ac10710e7fdf");

//   pageId.value = '2fea615a-97a7-401c-81be-486e4eec2e94';

  useTask$(async ({ track }) => {
    const trackPage = track(() => pageId.value);

    const notion = new NotionAPI();

    recordMap.value = await notion.getPage(trackPage);

    console.log(recordMap.value.block);
  });

  if (!recordMap.value) return <div>Loading...</div>;

  return (
    <>
      <NotionRenderer fullPage recordMap={recordMap.value} />
    </>
  );
});
