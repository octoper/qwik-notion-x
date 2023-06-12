import { AudioBlock } from 'notion-types'

import { useNotionContext } from '../context'
import { cs } from '../utils'
import { component$ } from '@builder.io/qwik'

export const Audio = component$<{
    block: AudioBlock
    class?: string
}>(({ block, class: className }) => {
  const { recordMap } = useNotionContext()
  const source =
    recordMap.signed_urls[block.id] || block.properties?.source?.[0]?.[0]

  return (
    <div class={cs('notion-audio', className)}>
      <audio controls preload='none' src={source} />
    </div>
  )
})
