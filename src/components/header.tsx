import * as types from 'notion-types'
import { getPageBreadcrumbs } from 'notion-utils'

import { useNotionContext } from '../context'
// import { SearchIcon } from '../icons/search-icon'
// import { SearchNotionFn } from '../types'
import { cs } from '../utils'
import { PageIcon } from './page-icon'
// import { SearchDialog } from './search-dialog'
import { Fragment, component$, useComputed$ } from '@builder.io/qwik'

export const Header = component$<{
    block: types.CollectionViewPageBlock | types.PageBlock
}>(({ block }) => {
  return (
    <header class='notion-header'>
      <div class='notion-nav-header'>
        <Breadcrumbs block={block} />
        {/* <Search block={block} /> */}
      </div>
    </header>
  )
})

export const Breadcrumbs = component$<{
    block: types.Block
    rootOnly?: boolean
}>(({ block, rootOnly = false }) => {
  const { recordMap, mapPageUrl, components } = useNotionContext()

  const breadcrumbs = useComputed$(() => {
    const breadcrumbs = getPageBreadcrumbs(recordMap, block.id)
    if (rootOnly && breadcrumbs) {
      return [breadcrumbs[0]].filter(Boolean)
    }

    return breadcrumbs
  })

  return (
    <div class='breadcrumbs' key='breadcrumbs'>
      {breadcrumbs.value?.map((breadcrumb, index: number) => {
        if (!breadcrumb) {
          return null
        }

        const pageLinkProps: any = {}
        const componentMap = {
          pageLink: components.PageLink
        }

        if (breadcrumb.active) {
          componentMap.pageLink = (props) => <div {...props}/>
        } else {
          pageLinkProps.href = mapPageUrl(breadcrumb.pageId)
        }

        return (
          <Fragment key={breadcrumb.pageId}>
            <componentMap.pageLink
              class={cs('breadcrumb', breadcrumb.active && 'active')}
              {...pageLinkProps}
            >
              {breadcrumb.icon && (
                <PageIcon class='icon' block={breadcrumb.block} />
              )}

              {breadcrumb.title && (
                <span class='title'>{breadcrumb.title}</span>
              )}
            </componentMap.pageLink>

            {breadcrumbs.value && index < breadcrumbs?.value.length - 1 && (
              <span class='spacer'>/</span>
            )}
          </Fragment>
        )
      })}
    </div>
  )
})

// export const Search = component$(({ block, search, title = 'Search' }) => {
//   const { searchNotion, rootPageId, isShowingSearch, onHideSearch } =
//     useNotionContext()
//   const onSearchNotion = search || searchNotion

//   const [isSearchOpen, setIsSearchOpen] = React.useState(isShowingSearch)
//   React.useEffect(() => {
//     setIsSearchOpen(isShowingSearch)
//   }, [isShowingSearch])

//   const onOpenSearch = React.useCallback(() => {
//     setIsSearchOpen(true)
//   }, [])

//   const onCloseSearch = React.useCallback(() => {
//     setIsSearchOpen(false)
//     if (onHideSearch) {
//       onHideSearch()
//     }
//   }, [onHideSearch])

//   useHotkeys('cmd+p', (event) => {
//     onOpenSearch()
//     event.preventDefault()
//     event.stopPropagation()
//   })

//   useHotkeys('cmd+k', (event) => {
//     onOpenSearch()
//     event.preventDefault()
//     event.stopPropagation()
//   })

//   const hasSearch = !!onSearchNotion

//   return (
//     <>
//       {hasSearch && (
//         <div
//           role='button'
//           class={cs('breadcrumb', 'button', 'notion-search-button')}
//           onClick$={onOpenSearch}
//         >
//           <SearchIcon className='searchIcon' />

//           {title && <span class='title'>{title}</span>}
//         </div>
//       )}

//       {isSearchOpen && hasSearch && (
//         <SearchDialog
//           isOpen={isSearchOpen}
//           rootBlockId={rootPageId || block?.id}
//           onClose={onCloseSearch}
//           searchNotion={onSearchNotion}
//         />
//       )}
//     </>
//   )
// });
