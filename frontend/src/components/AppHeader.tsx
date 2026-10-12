import { PlaneIcon } from "./icons";

export default function AppHeader() {
  return (
    <header className="border-b border-hairline py-6 sm:py-8">
      <div className="flex items-center gap-3">
        <PlaneIcon className="size-7 shrink-0 text-decorative" />
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Cheapest-Day-to-Fly Finder
          </h1>
          <p className="mt-0.5 text-sm text-ink/70">
            Find the lowest-fare departure dates for any route.
          </p>
        </div>
      </div>
    </header>
  );
}
