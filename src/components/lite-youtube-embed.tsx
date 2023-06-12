
import { cs } from '../utils'
import { $, component$, useSignal } from '@builder.io/qwik'

const qs = (params: Record<string, string>) => {
  return Object.keys(params)
    .map(
      (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
    )
    .join('&')
}

export const LiteYouTubeEmbed = component$<{
    id: string
    defaultPlay?: boolean
    mute?: boolean
    lazyImage?: boolean
    iframeTitle?: string
    alt?: string
    params?: Record<string, string>
    adLinksPreconnect?: boolean
    style?: any
    class?: string
}>(({
  id,
  defaultPlay = false,
  mute = false,
  lazyImage = false,
  iframeTitle = 'YouTube video',
  alt = 'Video preview',
  params = {},
  adLinksPreconnect = true,
  style,
  class: className,
}) => {
  const muteParam = mute || defaultPlay ? '1' : '0' // Default play must be muted
  const queryString = qs({ autoplay: '1', mute: muteParam, ...params })
  // const mobileResolution = 'hqdefault'
  // const desktopResolution = 'maxresdefault'
  const resolution = 'hqdefault'
  const posterUrl = `https://i.ytimg.com/vi/${id}/${resolution}.jpg`
  const ytUrl = 'https://www.youtube-nocookie.com'
  const iframeSrc = `${ytUrl}/embed/${id}?${queryString}`

  const isPreconnected = useSignal(false)
  const iframeInitialized = useSignal(defaultPlay)
  const isIframeLoaded = useSignal(false)

  const warmConnections = $(() => {
    if (isPreconnected.value) return
    isPreconnected.value = true
  })

  const onLoadIframe = $(() => {
    if (iframeInitialized.value) return
    iframeInitialized.value = true
  })

  const onIframeLoaded = $(() => {
    isIframeLoaded.value = true
  })

  return (
    <>
      <link rel='preload' href={posterUrl} as='image' />

      {isPreconnected.value && (
        <>
          {/* The iframe document and most of its subresources come from youtube.com */}
          <link rel='preconnect' href={ytUrl} />

          {/* The botguard script is fetched off from google.com */}
          <link rel='preconnect' href='https://www.google.com' />
        </>
      )}

      {isPreconnected.value && adLinksPreconnect && (
        <>
          {/* Not certain if these ad related domains are in the critical path. Could verify with domain-specific throttling. */}
          <link rel='preconnect' href='https://static.doubleclick.net' />
          <link rel='preconnect' href='https://googleads.g.doubleclick.net' />
        </>
      )}

      <div
        onClick$={onLoadIframe}
        onPointerOver$={warmConnections}
        class={cs(
          'notion-yt-lite',
          isIframeLoaded && 'notion-yt-loaded',
          iframeInitialized && 'notion-yt-initialized',
          className
        )}
        style={style}
      >
        {/* eslint-disable-next-line qwik/jsx-img */}
        <img
          src={posterUrl}
          class='notion-yt-thumbnail'
          loading={lazyImage ? 'lazy' : undefined}
          alt={alt}
        />

        <div class='notion-yt-playbtn' />

        {iframeInitialized.value && (
          <iframe
            width='560'
            height='315'
            frame-border='0'
            allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture'
            allowFullScreen
            title={iframeTitle}
            src={iframeSrc}
            onLoad$={onIframeLoaded}
          />
        )}
      </div>
    </>
  )
});
