export function parseFormattedNumber(value: string): number {
  const cleanValue = value.replace(/,|\s/g, '').toUpperCase()
  
  if (cleanValue.endsWith('K')) {
    return parseFloat(cleanValue.slice(0, -1)) * 1000
  }
  if (cleanValue.endsWith('M')) {
    return parseFloat(cleanValue.slice(0, -1)) * 1000000
  }
  if (cleanValue.endsWith('B')) {
    return parseFloat(cleanValue.slice(0, -1)) * 1000000000
  }
  
  return parseFloat(cleanValue)
}

export function formatPremium(value: number | undefined | null): string {
  if (value === undefined || value === null) {
    return 'N/A';
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M ⭐`
  } else if (value >= 500000) {
    return `${(value / 1000).toFixed(2)}k ⭐`
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}k`
  }
  return value.toFixed(2)
}

export function formatStrike(strike: number | string | undefined): string {
  if (typeof strike === 'undefined') {
    return 'N/A';
  }
  const numericStrike = typeof strike === 'string' ? parseFloat(strike) : strike;
  if (isNaN(numericStrike)) {
    return 'N/A';
  }
  return Number(numericStrike) % 1 === 0 ? numericStrike.toFixed(0) : numericStrike.toFixed(2);
}

export function calculateDTE(expiration: string): string {
  const expirationDate = new Date(expiration)
  const currentDate = new Date()
  const timeDifference = expirationDate.getTime() - currentDate.getTime()
  const days = Math.ceil(timeDifference / (1000 * 60 * 60 * 24))
  return `${days}d`
}

