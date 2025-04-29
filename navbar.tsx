import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { FaExchangeAlt } from "react-icons/fa";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, BellIcon, LogOut, User, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NavItemProps {
  href: string;
  label: string;
  active: boolean;
}

function NavItem({ href, label, active }: NavItemProps) {
  return (
    <Link href={href}>
      <div
        className={`px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
          active
            ? "text-primary-700 bg-primary-50"
            : "text-slate-700 hover:text-primary-700 hover:bg-primary-50"
        }`}
      >
        {label}
      </div>
    </Link>
  );
}

export function Navbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/explore", label: "Explore Skills" },
    { href: "/skills", label: "My Skills" },
    { href: "/messages", label: "Messages" },
  ];

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <div className="flex items-center cursor-pointer">
                  <FaExchangeAlt className="text-primary text-2xl mr-2" />
                  <span className="font-heading font-bold text-xl text-primary-700">
                    SkillSwap
                  </span>
                </div>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    active={location === item.href}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <Button
                variant="ghost"
                size="icon"
                className="relative p-1 rounded-full text-slate-400 hover:text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <BellIcon className="h-6 w-6" />
                <span className="absolute top-0 right-0 block w-2 h-2 bg-amber-500 rounded-full"></span>
              </Button>

              <div className="ml-3 relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center max-w-xs rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      <span className="sr-only">Open user menu</span>
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user.profileImage || undefined}
                          alt="User profile"
                        />
                        <AvatarFallback>
                          {user.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="ml-2 text-sm font-medium text-slate-700">
                        {user.fullName}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <Link href="/">
                      <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/skills">
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                >
                  <span className="sr-only">Open main menu</span>
                  <Menu className="h-6 w-6" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="py-4">
                  <div className="flex items-center mb-8">
                    <FaExchangeAlt className="text-primary text-xl mr-2" />
                    <span className="font-heading font-bold text-lg text-primary-700">
                      SkillSwap
                    </span>
                  </div>
                  
                  <div className="flex items-center mb-6 pb-4 border-b">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={user.profileImage || undefined}
                        alt="User profile"
                      />
                      <AvatarFallback>
                        {user.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-slate-700">{user.fullName}</p>
                      <p className="text-xs text-slate-500">{user.username}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    {navItems.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <div
                          className={`block px-3 py-2 rounded-md text-base font-medium cursor-pointer ${
                            location === item.href
                              ? "text-primary-700 bg-primary-50"
                              : "text-slate-700 hover:text-primary-700 hover:bg-primary-50"
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.label}
                        </div>
                      </Link>
                    ))}
                    <Button
                      variant="ghost"
                      className="w-full justify-start px-3 py-2 text-base font-medium text-slate-700 hover:text-primary-700 hover:bg-primary-50"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
