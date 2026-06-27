/**
 * Comprime una imagen y la convierte a base64.
 * Target: máximo 1024px de ancho, calidad JPEG 0.8
 */
export function compressImage(file, maxSizeMB = 1) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img
        const maxDimension = 1024

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        const mimeType = 'image/jpeg'
        let quality = 0.8
        let base64 = canvas.toDataURL(mimeType, quality).split(',')[1]

        // Si sigue siendo muy grande, reducir calidad
        while (base64.length > maxSizeMB * 1024 * 1024 * 1.37 && quality > 0.2) {
          quality -= 0.1
          base64 = canvas.toDataURL(mimeType, quality).split(',')[1]
        }

        resolve({ base64, mimeType, width, height })
      }
      img.onerror = () => reject(new Error('Error al cargar la imagen'))
      img.src = e.target.result
    }
    reader.onerror = () => reject(new Error('Error al leer el archivo'))
    reader.readAsDataURL(file)
  })
}

/**
 * Crea una URL temporal para preview de imagen
 */
export function createPreviewURL(file) {
  return URL.createObjectURL(file)
}
