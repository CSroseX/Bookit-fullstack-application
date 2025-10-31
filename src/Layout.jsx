import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Menu, X, MapPin, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const navLinks = [
    { name: "Home", path: createPageUrl("Home") },
    { name: "Experiences", path: createPageUrl("Home") },
    { name: "Contact", path: "#contact" }
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <style>{`
        :root {
          --color-primary: #FFD166;
          --color-secondary: #FFAD33;
          --color-bg: #FAFAFA;
          --color-text-primary: #222222;
          --color-text-secondary: #6B7280;
          --color-card-bg: #FFFFFF;
          --color-border: #E5E7EB;
          --color-error: #EF4444;
          --color-success: #10B981;
        }
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
      `}</style>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FFD166] to-[#FFAD33] rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-[#222222]" />
              </div>
              <span className="text-2xl font-bold text-[#222222]">BookIt</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-base font-medium transition-colors ${
                    isActive(link.path)
                      ? "text-[#222222]"
                      : "text-[#6B7280] hover:text-[#222222]"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                      <Avatar className="w-9 h-9 border-2 border-[#FFD166]">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-[#FFD166] text-[#222222] font-semibold">
                          {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-[#222222]">{user.full_name || "User"}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl("Profile")} className="cursor-pointer">
                        <User className="w-4 h-4 mr-2" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-[#EF4444]">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  onClick={() => base44.auth.redirectToLogin()}
                  className="bg-[#FFD166] hover:bg-[#FFAD33] text-[#222222] font-semibold px-6 py-3 rounded-xl transition-all hover:shadow-lg"
                >
                  Sign In
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-[#222222]" />
              ) : (
                <Menu className="w-6 h-6 text-[#222222]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E5E7EB] bg-white">
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`block py-2 text-base font-medium ${
                    isActive(link.path)
                      ? "text-[#222222]"
                      : "text-[#6B7280]"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              
              {user ? (
                <>
                  <Link 
                    to={createPageUrl("Profile")} 
                    className="block py-2 text-base font-medium text-[#6B7280]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left py-2 text-base font-medium text-[#EF4444]"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Button 
                  onClick={() => base44.auth.redirectToLogin()}
                  className="w-full bg-[#FFD166] hover:bg-[#FFAD33] text-[#222222] font-semibold py-3 rounded-xl"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E5E7EB] mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-[#6B7280]">
            © 2025 BookIt. Experience the world, one adventure at a time.
          </div>
        </div>
      </footer>
    </div>
  );
}