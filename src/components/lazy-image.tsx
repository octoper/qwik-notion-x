import { component$ } from "@builder.io/qwik";

/**
 * Progressive, lazy images modeled after Medium's LQIP technique.
 */
export const LazyImage = component$<{
  src?: string;
  alt?: string;
  class?: string;
  style?: any;
  height?: number;
  zoomable?: boolean;
  priority?: boolean;
}>(({ src, alt, class: className, style, height, ...rest }) => {
  return (
    <img
      class={className}
      style={style}
      src={src}
      alt={alt}
      height={height}
      loading="lazy"
      decoding="async"
      {...rest}
    />
  );
});
