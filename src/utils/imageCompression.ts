const ATTEMPTS = [
  { quality: 0.85, scale: 1.00 },
  { quality: 0.75, scale: 1.00 },
  { quality: 0.65, scale: 0.90 },
  { quality: 0.55, scale: 0.80 },
  { quality: 0.45, scale: 0.70 },
  { quality: 0.35, scale: 0.60 },
]

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Falha ao carregar imagem')) }
    img.src = url
  })
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('Falha ao gerar imagem comprimida')),
      'image/jpeg',
      quality,
    )
  })
}

/**
 * Compresses a File using Canvas. Tries progressively lower quality and scale
 * until the result fits within maxSizeBytes.
 * Returns the original file if it's already within the limit.
 * Throws if no attempt succeeds.
 */
export async function compressImage(file: File, maxSizeBytes: number): Promise<File> {
  if (file.size <= maxSizeBytes) return file

  const img = await loadImage(file)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas não suportado neste navegador')

  const baseName = file.name.replace(/\.[^.]+$/, '')

  for (const { quality, scale } of ATTEMPTS) {
    canvas.width  = Math.round(img.naturalWidth  * scale)
    canvas.height = Math.round(img.naturalHeight * scale)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    const blob = await canvasToBlob(canvas, quality)
    if (blob.size <= maxSizeBytes) {
      return new File([blob], `${baseName}.jpg`, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      })
    }
  }

  throw new Error('Não foi possível comprimir a imagem para menos de 5 MB. Tente uma imagem menor.')
}
