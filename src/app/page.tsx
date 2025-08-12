export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8 text-center">
      <div className="max-w-4xl">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl font-headline text-foreground">
          Welcome to SimplePage
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          This is a simple, elegant, and responsive page built with Next.js, Tailwind CSS, and ShadCN UI. 
          It's designed to be a clean starting point for your new application, featuring a calming blue color palette 
          and the modern 'Inter' typeface.
        </p>
      </div>
    </main>
  );
}
