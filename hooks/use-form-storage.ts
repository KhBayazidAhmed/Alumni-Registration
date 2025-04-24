"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import { debounce, safelyGetItem, safelyStoreItem } from "@/utils/storage-utils"

/**
 * Custom hook to handle form data persistence with localStorage
 */
export function useFormStorage<T extends Record<string, any>>(
  form: UseFormReturn<T>,
  storageKey: string,
  debounceTime = 500,
) {
  const [isLoaded, setIsLoaded] = useState(false)
  const isInitialLoad = useRef(true)

  // Load form data from localStorage on mount
  useEffect(() => {
    const savedData = safelyGetItem<T | null>(storageKey, null)
    if (savedData) {
      form.reset(savedData)
    }
    setIsLoaded(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]) // Intentionally omit form from dependencies to prevent re-runs

  // Save form data to localStorage when it changes
  useEffect(() => {
    if (!isLoaded) return

    // Skip the first watch trigger after loading data
    if (isInitialLoad.current) {
      isInitialLoad.current = false
      return
    }

    const debouncedSave = debounce((value: T) => {
      safelyStoreItem(storageKey, value)
    }, debounceTime)

    const subscription = form.watch((value) => {
      debouncedSave(value as T)
    })

    return () => subscription.unsubscribe()
  }, [form, storageKey, debounceTime, isLoaded])

  // Clear form data from localStorage
  const clearStorage = useCallback(() => {
    try {
      localStorage.removeItem(storageKey)
      return true
    } catch (error) {
      console.error(`Error clearing ${storageKey} from localStorage:`, error)
      return false
    }
  }, [storageKey])

  return {
    isLoaded,
    clearStorage,
  }
}
