"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"

// Use dynamic import for the form component to reduce initial load time
const RegistrationForm = dynamic(() => import("@/components/registration-form"), {
  loading: () => (
    <div className="space-y-6">
      <div className="animate-pulse space-y-6">
        <div className="h-64 bg-muted rounded-lg"></div>
        <div className="h-48 bg-muted rounded-lg"></div>
        <div className="h-48 bg-muted rounded-lg"></div>
      </div>
    </div>
  ),
  ssr: false, // This is now in a client component, so it's allowed
})

export default function ClientPage() {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-6">
          <div className="h-64 bg-muted rounded-lg"></div>
          <div className="h-48 bg-muted rounded-lg"></div>
          <div className="h-48 bg-muted rounded-lg"></div>
        </div>
      }
    >
      <RegistrationForm />
    </Suspense>
  )
}
