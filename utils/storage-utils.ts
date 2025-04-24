// Utility functions for localStorage operations

/**
 * Safely store data in localStorage with error handling
 */
export function safelyStoreItem(key: string, value: any): boolean {
  try {
    const serialized = JSON.stringify(value)
    localStorage.setItem(key, serialized)
    return true
  } catch (error) {
    console.error(`Error storing ${key} in localStorage:`, error)
    return false
  }
}

/**
 * Safely retrieve data from localStorage with error handling
 */
export function safelyGetItem<T>(key: string, defaultValue: T): T {
  try {
    const serialized = localStorage.getItem(key)
    if (serialized === null) {
      return defaultValue
    }
    return JSON.parse(serialized) as T
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage:`, error)
    return defaultValue
  }
}

/**
 * Safely remove item from localStorage with error handling
 */
export function safelyRemoveItem(key: string): boolean {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error)
    return false
  }
}

/**
 * Create a debounced function
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(later, wait)
  }
}

/**
 * Compress an image to reduce storage size
 */
export function compressImage(dataUrl: string, maxWidth = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      // Calculate new dimensions
      let width = img.width
      let height = img.height

      if (width > maxWidth) {
        height = Math.round(height * (maxWidth / width))
        width = maxWidth
      }

      // Create canvas and compress
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Could not get canvas context"))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      // Convert to compressed JPEG
      const compressedImage = canvas.toDataURL("image/jpeg", quality)
      resolve(compressedImage)
    }

    img.onerror = () => {
      reject(new Error("Failed to load image"))
    }

    img.src = dataUrl
  })
}
