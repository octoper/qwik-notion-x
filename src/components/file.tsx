import { FileBlock } from 'notion-types'

import { useNotionContext } from '../context'
import { FileIcon } from '../icons/file-icon'
import { cs } from '../utils'
import { Text } from './text'
import { component$ } from '@builder.io/qwik'

export const File= component$<{
    block: FileBlock
    class?: string
}>(({ block, class: className }) => {
  const { components, recordMap } = useNotionContext()
  const source =
    recordMap.signed_urls[block.id] || block.properties?.source?.[0]?.[0]

  return (
    <div class={cs('notion-file', className)}>
      <components.Link
        class='notion-file-link'
        href={source}
        target='_blank'
        rel='noopener noreferrer'
      >
        <FileIcon class='notion-file-icon' />

        <div class='notion-file-info'>
          <div class='notion-file-title'>
            <Text value={block.properties?.title || [['File']]} block={block} />
          </div>

          {block.properties?.size && (
            <div class='notion-file-size'>
              <Text value={block.properties.size} block={block} />
            </div>
          )}
        </div>
      </components.Link>
    </div>
  )
});
