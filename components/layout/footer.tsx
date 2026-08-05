export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/60">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-zinc-500 md:flex-row md:items-center">
        <p>© 2026 ModeAlert. Built by Deniz Önen.</p>
        <div className="md:ml-auto flex items-center gap-6">
          <a href="/status" className="hover:text-white">Status</a>
          <a href="#" className="hover:text-white">Privacy</a>
          <a href="#" className="hover:text-white">Terms</a>
          <a href="https://github.com/denizonenn/modealert" target="_blank" className="hover:text-white">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}