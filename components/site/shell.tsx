/** Standard inner-page frame: clears the fixed nav, sets the width, adds the footer HUD. */
export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-[1320px] px-4 pb-20 pt-24 sm:px-8 sm:pt-28">
      {children}
      <footer className="hud mt-16 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-5">
        <span>commReach</span>
        <span>n = 1,000 responses · sample data</span>
        <span className="sm:ml-auto">Press / or ⌘K to jump anywhere</span>
      </footer>
    </main>
  );
}
