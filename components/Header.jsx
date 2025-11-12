import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "./ui/button";
import { LayoutDashboard, PenBox } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md border-b z-50">
      <nav className="container mx-auto flex items-center justify-between px-[7%] py-3 md:py-4">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-sky-600 hover:text-sky-700 transition-colors"
        >
          FinSight
        </Link>

        <div className="flex items-center gap-3 md:gap-4">
          <SignedIn>
            <div className="flex items-center gap-2 md:gap-3">
              <Link href="/dashboard">
                <Button variant="outline" className="flex items-center gap-2">
                  <LayoutDashboard size={18} />
                  <span className="hidden md:inline">Dashboard</span>
                </Button>
              </Link>

              <Link href="/transaction/create">
                <Button className="flex items-center gap-2">
                  <PenBox size={18} />
                  <span className="hidden md:inline">Add Transaction</span>
                </Button>
              </Link>
            </div>
          </SignedIn>

          <SignedOut>
            <SignInButton forceRedirectUrl="/dashboard">
              <Button variant="outline">Login</Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
};

export default Header;
