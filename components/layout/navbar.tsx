import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-6">
        <div className="flex items-center gap-2 font-semibold">
          <div className="rounded-lg bg-white p-2 text-black">
            <Bell className="h-4 w-4" />
          </div>
          <span className="text-lg">ModeAlert</span>
        </div>

        <nav className="ml-10 hidden items-center gap-6 text-sm text-zinc-400 md:flex">
          <a href="#features" className="hover:text-white">
            Features
          </a>
          <a href="#games" className="hover:text-white">
            Games
          </a>
          <a href="#faq" className="hover:text-white">
            FAQ
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <Button variant="ghost" className="text-white hover:bg-white/10">
            Sign in
          </Button>
          <Button className="bg-white text-black hover:bg-zinc-200">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
}