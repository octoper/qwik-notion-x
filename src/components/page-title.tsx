import { Block, Decoration } from 'notion-types'
import { getBlockTitle } from 'notion-utils'

import { useNotionContext } from '../context'
import { cs } from '../utils'
import { PageIcon } from './page-icon'
import { Text } from './text'
import { component$ } from '@builder.io/qwik'

export const PageTitle = component$<{
    block: Block
    class?: string
    defaultIcon?: string
}>(({ block, class: className, defaultIcon, ...rest }) => {
  const { recordMap } = useNotionContext()

  if (!block) return null

  if (
    block.type === 'collection_view_page' ||
    block.type === 'collection_view'
  ) {
    const title = getBlockTitle(block, recordMap)
    if (!title) {
      return null
    }

    const titleDecoration: Decoration[] = [[title]]

    return (
      <span class={cs('notion-page-title', className)} {...rest}>
        <PageIcon
          block={block}
          defaultIcon={defaultIcon}
          class='notion-page-title-icon'
        />

        <span class='notion-page-title-text'>
          <Text value={titleDecoration} block={block} />
        </span>
      </span>
    )
  }

  if (!block.properties?.title) {
    return null
  }

  return (
    <span class={cs('notion-page-title', className)} {...rest}>
      <PageIcon
        block={block}
        defaultIcon={defaultIcon}
        class='notion-page-title-icon'
      />

      <span class='notion-page-title-text'>
        <Text value={block.properties?.title} block={block} />
      </span>
    </span>
  )
})
