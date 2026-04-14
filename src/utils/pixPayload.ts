/**
 * Gera o payload de QR Code PIX estático no padrão EMV/BR Code (BACEN).
 */

function tlv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0')
  return `${id}${len}${value}`
}

function crc16ccitt(str: string): string {
  let crc = 0xffff
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

function normalize(str: string, maxLen: number): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .trim()
    .slice(0, maxLen)
}

// amount em reais (ex: 150 = R$150,00)
export function buildPixPayload(pixKey: string, merchantName: string, amount: number): string {
  const name = normalize(merchantName, 25) || 'VENDEDOR'
  const city = 'BRASIL'
  const amountStr = amount.toFixed(2) // ex: "150.00"

  const merchantAccount = tlv('26', tlv('00', 'BR.GOV.BCB.PIX') + tlv('01', pixKey))
  const additionalData = tlv('62', tlv('05', '***'))

  let payload = ''
  payload += tlv('00', '01')       // Payload Format Indicator
  payload += tlv('01', '12')       // Ponto de iniciação: QR estático
  payload += merchantAccount        // Merchant Account Info (chave PIX)
  payload += tlv('52', '0000')     // Merchant Category Code
  payload += tlv('53', '986')      // Moeda: BRL
  payload += tlv('54', amountStr)  // Valor da transação
  payload += tlv('58', 'BR')       // País
  payload += tlv('59', name)       // Nome do recebedor
  payload += tlv('60', city)       // Cidade
  payload += additionalData         // Dados adicionais
  payload += '6304'                 // Prefixo do CRC

  return payload + crc16ccitt(payload)
}
