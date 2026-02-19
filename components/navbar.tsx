"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Code as LucideCode, 
  Menu as LucideMenu, 
  X as LucideX, 
  User as LucideUser, 
  LogOut as LucideLogOut 
} from "lucide-react"

const Code = LucideCode as any
const Menu = LucideMenu as any
const X = LucideX as any
const User = LucideUser as any
const LogOut = LucideLogOut as any
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/hooks/use-auth"

export default function Navbar() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, signOut, isLoading } = useAuth()
  const isHiddenPath = pathname === '/' || pathname?.startsWith('/admin')
  if (isHiddenPath) return null

  const navigation = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Events", href: "/events" },
    { name: "Projects", href: "/projects" },
    { name: "Resources", href: "/resources" },
    { name: "Team", href: "/team" },
    { name: "Practice", href: "/leetcode" },
    { name: "Community", href: "/community" },
  ]

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <nav className="fixed top-6 left-0 right-0 z-[100] flex justify-center px-6">
      <div className="w-full max-w-6xl bg-black/40 backdrop-blur-xl border border-white/5 rounded-[2rem] px-5 md:px-8 h-20 flex items-center justify-between shadow-2xl transition-all duration-500">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2 md:gap-3 shrink-0">
          <div className="size-9 md:size-10 rounded-xl bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 flex items-center justify-center text-white transition-all duration-300 group-hover:border-white/20 group-hover:scale-105">
            <Code className="size-4 md:size-5" />
          </div>
          <span className="font-bold text-lg md:text-xl font-outfit tracking-tight text-white transition-all duration-300 group-hover:tracking-normal">
            TechClub
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-2 rounded-xl transition-all duration-300 hover:text-white ${
                pathname === item.href 
                  ? "text-white bg-white/5" 
                  : "text-slate-500 hover:bg-white/5"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2 lg:gap-4 shrink-0">
          <ThemeToggle />
          
          {!isLoading && user ? (
            <div className="flex items-center gap-2 lg:gap-3">
              <Button asChild variant="outline" className="bg-white/5 border-white/10 text-white font-bold text-[10px] uppercase tracking-widest rounded-xl px-4 lg:px-6 h-11 hover:bg-white hover:text-black transition-all">
                <Link href="/admin">
                  <User className="size-4 mr-2 hidden lg:inline-block" />
                  Dashboard
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="size-11 rounded-xl hover:bg-red-500/10 hover:text-red-500 text-slate-500 transition-all">
                <LogOut className="size-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 lg:gap-3">
              <Button asChild variant="ghost" className="text-white font-bold text-[10px] uppercase tracking-widest px-4 h-11 hover:bg-white/5 rounded-xl transition-all">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild className="bg-white text-black font-bold text-[10px] uppercase tracking-widest rounded-xl px-6 lg:px-8 h-11 hover:bg-slate-200 transition-all shadow-lg shadow-white/5">
                <Link href="/join">Join Us</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden size-11 rounded-xl bg-white/5 border border-white/5 hover:bg-white hover:text-black transition-all"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {/* Mobile Navigation Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-[104px] z-40 md:hidden flex justify-center px-6">
          <div className="w-full max-w-6xl bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 shadow-3xl animate-in slide-in-from-top-4 duration-300">
            <div className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-6 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${
                    pathname === item.href 
                      ? "text-white bg-white/5" 
                      : "text-slate-500 hover:text-white hover:bg-white/5"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="pt-6 mt-6 border-t border-white/5 space-y-4">
                {!isLoading && user ? (
                  <>
                    <Button asChild variant="outline" className="w-full bg-white/5 border-white/10 text-white font-bold text-[10px] uppercase tracking-widest rounded-2xl h-14" onClick={() => setIsMenuOpen(false)}>
                      <Link href="/admin">
                        <User className="size-4 mr-2" />
                        Dashboard Logic
                      </Link>
                    </Button>
                    <Button variant="ghost" onClick={handleSignOut} className="w-full rounded-2xl h-14 text-red-500 hover:bg-red-500/10 font-bold text-[10px] uppercase tracking-widest">
                      <LogOut className="size-4 mr-2" />
                      Deauthorize Terminally
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="outline" className="w-full bg-white/5 border-white/10 text-white font-bold text-[10px] uppercase tracking-widest rounded-2xl h-14" onClick={() => setIsMenuOpen(false)}>
                      <Link href="/login">Initialize Session</Link>
                    </Button>
                    <Button asChild className="w-full bg-white text-black font-bold text-[10px] uppercase tracking-widest rounded-2xl h-14" onClick={() => setIsMenuOpen(false)}>
                      <Link href="/join">Enlist Pipeline</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

