"use client"

import * as React from "react"
import {
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  Toast as ToastPrimitive,
} from "@radix-ui/react-toast"

import { cn } from "@/lib/utils"

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <ToastPrimitive.Root
      ref={ref}
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:fade-in-80 data-[state=open]:slide-in-from-top-full sm:w-[390px]",
        className,
      )}
      {...props}
    >
      <div className="flex flex-col space-y-1">
        <ToastTitle className="text-sm font-semibold">{props.title}</ToastTitle>
        {props.description && <ToastDescription className="text-sm opacity-70">{props.description}</ToastDescription>}
      </div>
      <ToastPrimitive.Action asChild altText="Close">
        <ToastClose className="absolute right-2 top-2 rounded-md p-1 text-gray-400 opacity-0 transition-opacity hover:bg-gray-100 focus:opacity-100 focus:shadow-sm focus-visible:outline-none group-hover:opacity-100">
          <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 13.0607L17.0607 18.1213L18.1213 17.0607L13.0607 12L18.1213 6.93934L17.0607 5.87864L12 10.9393L6.93934 5.87864L5.87864 6.93934L10.9393 12L5.87864 17.0607L6.93934 18.1213L12 13.0607Z"
            />
          </svg>
        </ToastClose>
      </ToastPrimitive.Action>
    </ToastPrimitive.Root>
  )
})
Toast.displayName = ToastPrimitive.Root.displayName

interface ToastProps {
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: "default" | "destructive"
}

type UseToast = (props: ToastProps) => void

function useToast() {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const toast: UseToast = (props) => {
    setToasts([...toasts, props])
  }

  return {
    toasts,
    toast,
  }
}

export { useToast, Toast, ToastProvider, ToastViewport }
