/**
 * Phones only: a row of section links that sticks under the 56 px header, so a
 * long page (Lab, CV) never needs a scroll back to the top. Plain anchors, no JS;
 * it is a <nav>, so print drops it with the rest of the chrome.
 */
export function JumpChips({ label, items }: { label: string; items: { id: string; text: string }[] }) {
  return (
    <nav
      aria-label={label}
      className="sticky top-14 z-30 flex gap-2 overflow-x-auto border-b border-border bg-background px-4 py-1.5 [scrollbar-width:none] sm:hidden"
    >
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="flex min-h-10 shrink-0 items-center rounded-full border border-border px-4 text-[14px] text-muted-foreground"
        >
          {item.text}
        </a>
      ))}
    </nav>
  );
}
