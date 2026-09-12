import QRCode from 'qrcode'

export async function genererQRCode(token: string): Promise<string> {
  const url = `https://rvd967-bere.com/verify/${token}`
  const dataUrl = await QRCode.toDataURL(url, {
    width: 300,
    margin: 3,
    color: { dark: '#000000', light: '#FFFFFF' },
    errorCorrectionLevel: 'H'  // Haute correction pour impression
  })
  return dataUrl
}

export async function telechargerQRCode(token: string, nom: string): Promise<void> {
  const dataUrl = await genererQRCode(token)
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = `QR-LP-${nom.replace(/\s+/g, '-')}-${token.substring(0,8)}.png`
  a.click()
}
