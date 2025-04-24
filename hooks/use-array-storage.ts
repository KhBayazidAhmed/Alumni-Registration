"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { debounce, safelyGetItem, safelyStoreItem } from "@/utils/storage-utils"

/**
 * Custom hook to handle array data persistence with localStorage
 */
export function useArrayStorage<T>(storageKey: string, initialValue: T[] = [], debounceTime = 500) {
  const [items, setItems] = useState<T[]>(initialValue)
  const [isLoaded, setIsLoaded] = useState(false)
  const skipNextEffect = useRef(true)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedItems = safelyGetItem<T[]>(storageKey, initialValue)
    setItems(savedItems)
    setIsLoaded(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]) // Intentionally omit initialValue from dependencies

  // Save data to localStorage when it changes
  useEffect(() => {
    if (!isLoaded) return

    // Skip the first effect after loading data
    if (skipNextEffect.current) {
      skipNextEffect.current = false
      return
    }

    const debouncedSave = debounce(() => {
      safelyStoreItem(storageKey, items)
    }, debounceTime)

    debouncedSave()

    return () => {
      // Save immediately on unmount to ensure data is saved
      safelyStoreItem(storageKey, items)
    }
  }, [items, storageKey, debounceTime, isLoaded])

  // Add an item to the array
  const addItem = useCallback((item: T) => {
    setItems((prev) => [...prev, item])
  }, [])

  // Remove an item from the array by id
  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item: any) => item.id !== id))
  }, [])

  // Update an item in the array
  const updateItem = useCallback((id: string, field: keyof T, value: any) => {
    setItems((prev) => prev.map((item: any) => (item.id === id ? { ...item, [field]: value } : item)))
  }, [])

  // Clear all items
  const clearItems = useCallback(() => {
    setItems([])
    try {
      localStorage.removeItem(storageKey)
      return true
    } catch (error) {
      console.error(`Error clearing ${storageKey} from localStorage:`, error)
      return false
    }
  }, [storageKey])

  return {
    items,
    setItems,
    addItem,
    removeItem,
    updateItem,
    clearItems,
    isLoaded,
  }
}
