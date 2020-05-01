import React, { useMemo } from 'react'
import PropTypes from 'prop-types'

const KNOWN_PLATFORMS = new Map([
  ['discord', 'Discord'],
  ['discourse', 'Discourse'],
  ['github', 'GitHub'],
  ['metacartel', 'Metacartel'],
  ['twitter', 'Twitter'],
  ['instagram', 'Instagram'],
  ['keybase', 'Keybase']
])

export default function SmartLink ({ url, ...props }) {
  const title = useMemo(() => {
    for (const [platformKey, platform] of KNOWN_PLATFORMS.entries()) {
      if (url.includes(platformKey)) {
        return platform
      }
    }

    return url
  }, [url])

  return <a href={url} rel='noopener noreferrer' target='blank' {...props}>{title}</a>
}

SmartLink.propTypes = {
  url: PropTypes.string
}
