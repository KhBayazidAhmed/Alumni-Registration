import ClientPage from "./client-page"

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Madhupur Shahid Smrity Alumni Association</h1>
        <p className="text-lg text-muted-foreground">Higher Secondary School and College Alumni Registration</p>
        <div className="mt-4 max-w-2xl mx-auto">
          <p className="text-sm text-muted-foreground">
            Join our alumni network to reconnect with classmates, participate in events, and contribute to the
            development of our institution. Complete this registration form to become an official member of our alumni
            community.
          </p>
        </div>
      </div>

      <ClientPage />
    </main>
  )
}
