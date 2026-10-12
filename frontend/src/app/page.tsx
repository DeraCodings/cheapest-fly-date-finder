import AppHeader from "@/components/AppHeader";
import CheapestDayFinder from "@/components/CheapestDayFinder";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-16 sm:px-6 lg:px-8">
      <AppHeader />
      <div className="mt-6 sm:mt-8">
        <CheapestDayFinder />
      </div>
      <footer className="mt-10 border-t border-hairline pt-4 text-xs text-ink/50">
        <p>
          &copy; {new Date().getFullYear()} Cheapest Flight Checker. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
