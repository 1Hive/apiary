const SI_SYMBOLS = [
  '',
  'K',
  'M',
  'G',
  'T',
  'P',
  'E'
]

export function formatNumber (num, decimals = 0, cutoff = 10000) {
  const options = [
    undefined,
    {
      minimumFractionDigits: decimals,
      maximumFractionDigits: 2
    }
  ]

  if (num < cutoff) {
    return num.toLocaleString(...options)
  }

  const abs = Math.abs(num)
  const tier = Math.log10(abs) / 3 | 0

  if (tier === 0) {
    return num.toLocaleString(...options)
  }

  const suffix = SI_SYMBOLS[tier]
  const scale = Math.pow(10, tier * 3)

  const scaled = abs / scale

  return (Math.sign(num) * scaled).toLocaleString(...options) + suffix
}
