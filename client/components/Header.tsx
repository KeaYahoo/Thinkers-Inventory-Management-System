/**
 * UI Fix: Wired the Radix Sheet state into the header mobile nav and added an account dropdown with profile access.
 */
import { useEffect, useRef, useState, useId } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/Avatar";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/hooks/useUser";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Bars3Icon, ChevronDownIcon } from "@heroicons/react/24/outline";

export default function Header() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { data: user } = useUser();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const accountMenuId = useId();
  const mobileNavId = useId();

  const handleNavClick = () => setMobileMenuOpen(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setAccountMenuOpen(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const closeOnClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnClickOutside);
    return () => document.removeEventListener("mousedown", closeOnClickOutside);
  }, []);

  return (
    <header className="absolute left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-6 lg:px-12">
      <div className="flex items-center">
        <Link to="/" onClick={handleNavClick} aria-label="Trvlsync home">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2Fea961abc0da24d56b7467e50e5f5e782%2F14e852d247674413b1ac42671420b444?format=webp&width=800"
            alt="Trvlsync logo"
            className="h-10 w-auto"
          />
        </Link>
      </div>

      <nav id={mobileNavId} className="hidden items-center space-x-8 md:flex" aria-label="Primary">
        <Link to="/nearby" className="text-white transition-colors hover:text-brown-light">
          Nearby
        </Link>
        <Link to="/destinations" className="text-white transition-colors hover:text-brown-light">
          Destinations
        </Link>
        <Link to="/tours" className="text-white transition-colors hover:text-brown-light">
          AI Planner
        </Link>
        <Link to="/about" className="text-white transition-colors hover:text-brown-light">
          About Us
        </Link>
        {isAdmin && (
          <Link to="/admin" className="text-white transition-colors hover:text-brown-light">
            Admin
          </Link>
        )}
      </nav>

      <div className="hidden items-center gap-4 md:flex">
        {isAuthenticated ? (
          <>
            <div className="relative" ref={accountMenuRef}>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setAccountMenuOpen((prev) => !prev)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setAccountMenuOpen(false);
                  }
                }}
                className="flex items-center gap-2 rounded-full border border-white/50 bg-white/10 px-3 py-1.5 text-white transition-colors hover:bg-white/20 focus-visible:ring-white/80 focus-visible:ring-offset-0"
                aria-haspopup="menu"
                aria-expanded={isAccountMenuOpen}
                aria-controls={accountMenuId}
              >
                <Avatar src={user?.avatar_url ?? null} alt={user?.full_name ?? user?.email ?? "User avatar"} size="sm" className="border border-white/40" />
                <span className="text-sm font-medium">My account</span>
                <ChevronDownIcon className={`h-4 w-4 transition-transform ${isAccountMenuOpen ? "rotate-180" : "rotate-0"}`} aria-hidden />
              </Button>
              {isAccountMenuOpen && (
                <div
                  id={accountMenuId}
                  role="menu"
                  className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 bg-white py-2 text-sm shadow-lg"
                >
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                    onClick={() => setAccountMenuOpen(false)}
                    role="menuitem"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                    onClick={() => setAccountMenuOpen(false)}
                    role="menuitem"
                  >
                    Profile
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                      onClick={() => setAccountMenuOpen(false)}
                      role="menuitem"
                    >
                      Admin dashboard
                    </Link>
                  )}
                </div>
              )}
            </div>
            <Button onClick={logout} className="rounded-full">
              Log out
            </Button>
          </>
        ) : (
          <>
            <Link to="/login">
              <Button variant="ghost" className="rounded-full text-white hover:bg-white/10 hover:text-white">
                Log in
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="rounded-full">Sign up</Button>
            </Link>
          </>
        )}
      </div>

      <div className="md:hidden">
        <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="rounded-full text-white"
              aria-label="Toggle navigation"
              aria-expanded={isMobileMenuOpen}
              aria-controls={`${mobileNavId}-sheet`}
            >
              <Bars3Icon className="h-6 w-6" aria-hidden />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-3/4" aria-labelledby={`${mobileNavId}-sheet-heading`} id={`${mobileNavId}-sheet`}>
            <div className="mt-8 flex flex-col space-y-6">
              <h2 id={`${mobileNavId}-sheet-heading`} className="sr-only">
                Mobile navigation
              </h2>
              <Link to="/nearby" onClick={handleNavClick}>
                Nearby
              </Link>
              <Link to="/destinations" onClick={handleNavClick}>
                Destinations
              </Link>
              <Link to="/tours" onClick={handleNavClick}>
                AI Planner
              </Link>
              <Link to="/about" onClick={handleNavClick}>
                About Us
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" onClick={handleNavClick}>
                    Dashboard
                  </Link>
                  <Link to="/profile" onClick={handleNavClick}>
                    Profile
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={handleNavClick}>
                      Admin
                    </Link>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    className="justify-start px-0 text-left"
                    onClick={() => {
                      handleNavClick();
                      logout();
                    }}
                  >
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={handleNavClick}>
                    Log in
                  </Link>
                  <Link to="/signup" onClick={handleNavClick}>
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
