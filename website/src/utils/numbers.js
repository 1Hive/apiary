const SI_SYMBOLS = [
  '',
  'K',
  'M',
  'G',
  'T',
  'P',
  'E'
]

export function formatNumber (num, cutoff = 10000) {
  if (num < cutoff) {
    return num.toLocaleString()
  }

  const abs = Math.abs(num)
  const tier = Math.log10(abs) / 3 | 0

  if (tier === 0) {
    return num.toLocaleString()
  }

  const suffix = SI_SYMBOLS[tier]
  const scale = Math.pow(10, tier * 3)

  const scaled = abs / scale

  return (Math.sign(num) * scaled.toFixed(2)).toLocaleString() + suffix
}
