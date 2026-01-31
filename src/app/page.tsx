import Link from "next/link";
import { ArrowRight, Calendar, ChefHat, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
            <ChefHat className="h-6 w-6" />
            <span>CommunityKitchen</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/book"
              className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-105 active:scale-95"
            >
              Book Now
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32">
          {/* Background decorations */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-0 right-1/4 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
          </div>

          <div className="container mx-auto px-4 text-center sm:px-8">
            <h1 className="mx-auto max-w-4xl text-6xl font-extrabold tracking-tight sm:text-8xl mb-6">
              <span className="text-slate-900">
                Book the Kitchen
              </span>
            </h1>
            
            <p className="mx-auto max-w-2xl text-xl text-slate-600 mb-10 leading-relaxed">
              A shared space for cooking, gathering, and creating memories. 
              Open to all residents—simple to book, free to use, and ready for your next meal.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/book"
                className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-lg font-medium text-primary-foreground shadow-xl shadow-primary/25 transition-all hover:bg-primary/90 hover:-translate-y-1"
              >
                Book a Time Slot
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex h-12 items-center justify-center rounded-full bg-white border border-slate-200 px-8 text-lg font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300"
              >
                How it Works
              </a>
            </div>
          </div>
        </section>

        {/* How it Works / About Section */}
        <section id="how-it-works" className="py-24 bg-slate-50">
          <div className="container mx-auto px-4 sm:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">How to Book</h2>
              <p className="mt-4 text-lg text-slate-600">Three simple steps to reserve the kitchen.</p>
            </div>

            <div className="grid grid-cols-1 gap-12 md:grid-cols-3 max-w-5xl mx-auto">
              {/* Step 1 */}
              <div className="relative flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-primary mb-6 text-2xl font-bold">1</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Check Availability</h3>
                <p className="text-slate-600">
                  Visit the booking page to see real-time availability on our calendar.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-primary mb-6 text-2xl font-bold">2</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Select & Reserve</h3>
                <p className="text-slate-600">
                  Click on an open time slot. Enter your name—no account or sign-up needed.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-primary mb-6 text-2xl font-bold">3</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Start Cooking</h3>
                <p className="text-slate-600">
                  Show up at your booked time and enjoy the space!
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="container mx-auto px-4 text-center text-slate-500">
          <p>&copy; {new Date().getFullYear()} Community Kitchen. Made for neighbors.</p>
        </div>
      </footer>
    </div>
  );
}
