import RegistrationForm from "@/components/registration-form"

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4">
      {/* Header with image */}
      <div className="rounded-lg overflow-hidden mb-8 shadow-md">
        <div className="relative">
          <img
            src="/placeholder.svg?height=200&width=1200"
            alt="Madhupur Shahid Smrity Alumni Association"
            className="w-full h-[200px] object-cover"
          />
         
        </div>
      </div>

      <RegistrationForm />
    </main>
  )
}
