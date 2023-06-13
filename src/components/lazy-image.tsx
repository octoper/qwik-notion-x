import { normalizeUrl } from "notion-utils";
import { useNotionContext } from "../context";
import { Image } from "@unpic/qwik";
import {
  $,
  component$,
  noSerialize,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import mediumZoom from "@fisch0920/medium-zoom";
import { getMediumZoomMargin } from "../renderer";

/**
 * Progressive, lazy images modeled after Medium's LQIP technique.
 */
export const LazyImage = component$<{
  src?: string;
  alt?: string;
  className?: string;
  style?: any;
  height?: number;
  zoomable?: boolean;
  priority?: boolean;
}>(
  ({
    src,
    alt,
    className,
    style,
    zoomable = false,
    priority = false,
    height,
    ...rest
  }) => {
    const { recordMap, zoom, previewImages, forceCustomImages, components } =
      useNotionContext();

    if (!src) return null;
    console.log(src)

    const zoomRef = useSignal(null);

    useVisibleTask$(
      () => {
        console.log(zoom.value);
        zoomRef.value = zoom.value ? zoom.value.clone() : null;
      },
      {
        strategy: "document-ready",
      }
    );

    const previewImage = previewImages
      ? recordMap?.preview_images?.[src] ??
        recordMap?.preview_images?.[normalizeUrl(src)]
      : null;

    const onLoad = $((e: any) => {
      if (zoomable && (e.target.src || e.target.srcset)) {
        if (zoomRef.value) {
          (zoomRef.value as any).attach(e.target);
        }
      }
    });

    const attachZoom = $((image: any) => {
      if (zoomRef.value && image) {
        (zoomRef.value as any).attach(image);
      }
    });

    const attachZoomRef = useSignal(zoomable ? attachZoom : undefined);

    if (previewImage) {
      const aspectRatio =
        previewImage.originalHeight / previewImage.originalWidth;

      if (components.Image) {
        // TODO: could try using next/image onLoadComplete to replace LazyImageFull
        // while retaining our blur implementation
        return (
          <components.Image
            src={src}
            alt={alt}
            style={style}
            class={className}
            width={previewImage.originalWidth}
            height={previewImage.originalHeight}
            blurDataURL={previewImage.dataURIBase64}
            placeholder="blur"
            priority={priority}
            onLoad$={onLoad}
          />
        );
      }

      return (
        <Image
          src={src}
          aspectRatio={aspectRatio}
          ref={zoomRef}
          layout="fullWidth"
          loading="lazy"
          {...rest}
        ></Image>
      );
    } else {
      // TODO: GracefulImage doesn't seem to support refs, but we'd like to prevent
      // invalid images from loading as error states

      /*
      NOTE: Using next/image without a pre-defined width/height is a huge pain in
      the ass. If we have a preview image, then this works fine since we know the
      dimensions ahead of time, but if we don't, then next/image won't display
      anything.

      Since next/image is the most common use case for using custom images, and this
      is likely to trip people up, we're disabling non-preview custom images for now.

      If you have a use case that is affected by this, please open an issue on github.
    */
      if (components.Image && forceCustomImages) {
        return (
          <components.Image
            src={src}
            alt={alt}
            class={className}
            style={style}
            width={null}
            height={height || null}
            priority={priority}
            onLoad={onLoad}
          />
        );
      }

      // Default image element
      return (
        <img
          class={className}
          style={style}
          src={src}
          alt={alt}
          ref={attachZoomRef}
          loading="lazy"
          decoding="async"
          {...rest}
        />
      );
    }
  }
);
