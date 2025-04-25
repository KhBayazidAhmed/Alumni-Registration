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
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/60 flex flex-col justify-center p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">Madhupur Shahid Smrity Alumni Association</h1>
            <p className="text-xl opacity-90 mb-4">Higher Secondary School and College Alumni Registration</p>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-auto">
              <div>
                <p className="text-sm opacity-80">Golden Jubilee 2023 | Established 2015</p>
              </div>
              <div>
                <p className="text-sm opacity-80">Join our alumni community today</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RegistrationForm />
    </main>
  )
}
