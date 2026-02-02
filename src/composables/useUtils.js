export function useUtils() {
  const formatBytes = (bytes, decimals = 1) => {
    if (!+bytes) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
  }

  const formatBase64Size = (base64String) => {
    if (!base64String) return '0 KB'
    const stringLength = base64String.length - (base64String.indexOf(',') + 1)
    const sizeInBytes = 4 * Math.ceil((stringLength / 3)) * 0.5624896334383812
    return formatBytes(sizeInBytes)
  }

  const getBrandImage = (val) => {
    if (!val) return ''
    const map = {
      'MASTERCARD': 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg',
      'VISA': 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg',
      'ELO': 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Elo_logo.png',
      'AMEX': 'https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg',
      'HIPERCARD': 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Hipercard_logo.svg'
    }
    return map[val] || 'https://cdn-icons-png.flaticon.com/512/3596/3596091.png'
  }

  const getCategoryObj = (id, allCategories) => {
    return allCategories.find(c => c.id === id) || { icon: 'help', color: '#ccc', name: 'N/A' }
  }

  return {
    formatBytes,
    formatBase64Size,
    getBrandImage,
    getCategoryObj
  }
}