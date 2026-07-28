import Link from 'next/link';

export const metadata = {
  title: '404 — Page not found',
};

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground px-6 py-16">
      <div className="w-full max-w-xl border border-border rounded-[4px] overflow-hidden font-mono">
        {/* title bar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border text-sm text-muted-foreground">
          <span aria-hidden className="inline-flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="w-3 h-3 rounded-full bg-green-500" />
          </span>
          <span className="ml-1">~ 404</span>
        </div>
        {/* body */}
        <div className="p-6 space-y-3 text-sm leading-relaxed">
          <p>
            <span className="text-muted-foreground">$ </span>cd requested-page
          </p>
          <p className="text-muted-foreground">bash: cd: requested-page: No such file or directory</p>
          <h1 className="text-2xl font-bold pt-3">
            <span aria-hidden className="text-muted-foreground mr-2">[x]</span>
            404 — Page not found
          </h1>
          <p className="text-muted-foreground">
            The page you requested doesn&apos;t exist or has moved.
            <br />
            La pagina richiesta non esiste o è stata spostata.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-2 text-foreground underline underline-offset-4 hover:opacity-70 focus-visible:outline focus-visible:outline-1 focus-visible:outline-ring"
          >
            <span aria-hidden className="font-bold">←</span> cd ~
          </Link>
        </div>
      </div>
    </main>
  );
}
