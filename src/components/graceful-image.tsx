import { QwikJSX, component$ } from "@builder.io/qwik";
import { isBrowser } from '../utils'

type ImgAttributes = QwikJSX.IntrinsicElements["img"];

export const GracefulImage = component$((props: ImgAttributes) => {
  if (isBrowser) {
    return <img {...props} />
  } else {
    // @ts-expect-error (must use the appropriate subset of props for <img> if using SSR)
    return <img {...props} />
  }
})
