"use client"

import { useCallback } from "react"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive"
  title?: string
  description?: string
  onClose?: () => void
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = "default", title, description, onClose, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
          variant === "destructive"
            ? "border-red-200 bg-red-50 text-red-900"
            : "border-gray-200 bg-white text-gray-900",
          className,
        )}
        {...props}
      >
        <div className="flex flex-col gap-1">
          {title && <div className="text-sm font-medium">{title}</div>}
          {description && <div className="text-sm opacity-90">{description}</div>}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-2 top-2 rounded-md p-1 text-gray-500 opacity-0 transition-opacity hover:text-gray-900 group-hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  },
)
Toast.displayName = "Toast"

export interface ToasterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Toaster({ className, ...props }: ToasterProps) {
  const { toasts } = useToaster()

  return (
    <div
      className={cn(
        "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
        className,
      )}
      {...props}
    >
      {toasts.map(({ id, title, description, variant, onClose }) => (
        <Toast key={id} title={title} description={description} variant={variant} onClose={onClose} />
      ))}
    </div>
  )
}

// Context to manage toasts
type ToasterToast = {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive"
  onClose: () => void
}

const ToasterContext = React.createContext<{
  toasts: ToasterToast[]
  addToast: (toast: Omit<ToasterToast, "id" | "onClose">) => void
  removeToast: (id: string) => void
}>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
})

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([])

  const addToast = useCallback((toast: Omit<ToasterToast, "id" | "onClose">) => {
    const id = Math.random().toString(36).substring(2, 9)

    setToasts((prev) => [
      ...prev,
      {
        id,
        ...toast,
        onClose: () => removeToast(id),
      },
    ])

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      removeToast(id)
    }, 5000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToasterContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <Toaster />
    </ToasterContext.Provider>
  )
}

export const useToaster = () => React.useContext(ToasterContext)
