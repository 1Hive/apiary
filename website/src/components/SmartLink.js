import React, { useMemo } from 'react'

const KNOWN_PLATFORMS = new Map([
  ['discord', 'Discord'],
  ['discourse', 'Discourse'],
  ['github', 'Github'],
  ['metacartel', 'Metacartel'],
  ['twitter', 'Twitter'],
  ['instagram', 'Instagram']
])

export default function SmartLink ({ url }) {
  const title = useMemo(() => {
    for (const [platformKey, platform] of KNOWN_PLATFORMS.entries()) {
      if (url.includes(platformKey)) {
        return platform
      }
    }

    return url
  }, [url])
  
  return <a href={url} css={`padding-left: 8px;`} >{title}</a>
}