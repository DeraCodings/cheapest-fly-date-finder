/** Row-shaped skeleton used while a search is in flight. */
export default function FareRowSkeleton() {
  return (
    <li
      aria-hidden="true"
      className="animate-pulse rounded-row border border-hairline bg-surface px-4 py-3 sm:px-5"
    >
      <div className="flex items-center gap-3">
        <div className="h-5 w-12 rounded-full bg-ink/10" />
        <div className="h-4 w-28 rounded bg-ink/10" />
        <div className="ml-auto h-6 w-16 rounded bg-ink/10" />
      </div>
      <div className="mt-2.5 h-3.5 w-52 rounded bg-ink/10" />
    </li>
  );
}
