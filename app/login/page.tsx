"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, ArrowRight, Check, Sparkles } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { motion, AnimatePresence } from "framer-motion"

const CheckIcon = Check as any
const SparklesIcon = Sparkles as any

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await signIn(email, password)
      setIsSuccess(true)
      
      // Delay redirect to show the "Access Granted" state
      setTimeout(() => {
        router.push("/admin")
      }, 2000)
    } catch (error: any) {
      setError(error.message || "Failed to sign in")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center p-4 bg-black">
      {/* Muted Background Depth */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[130px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] rounded-full bg-slate-900/20 blur-[130px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm z-10"
      >
        <div className="relative">
          {/* High-Contrast Dark Card */}
          <div className="bg-[#0a0a0a]/60 backdrop-blur-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[2.5rem] p-10 overflow-hidden">
            <div className="mb-10 text-center">
              <motion.div
                initial={{ scale: 0.96 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white mb-6"
              >
                <span className="text-sm font-black text-black tracking-tighter">TC</span>
              </motion.div>
              <h1 className="text-xl font-bold text-white tracking-tight">Welcome Back</h1>
              <p className="text-slate-500 mt-2 text-xs font-medium tracking-wide">Enter your details to continue</p>
            </div>

            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.form 
                  key="login-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onSubmit={handleSubmit} 
                  className="space-y-6"
                >
                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                      >
                        <Alert className="bg-red-500/10 border-red-500/20 text-red-500 rounded-2xl py-2.5 border-0">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs font-bold leading-none">{error}</AlertDescription>
                        </Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="space-y-2.5">
                    <Label htmlFor="email" className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] ml-1">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@vccs.edu"
                      className="bg-white/[0.03] border-white/10 text-white placeholder:text-slate-600 h-11 rounded-2xl font-medium focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all duration-200 px-4 border-0 border-b-[1px] rounded-none bg-transparent hover:border-white/30"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center px-1">
                      <Label htmlFor="password" className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                        Password
                      </Label>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="bg-white/[0.03] border-white/10 text-white placeholder:text-slate-600 h-11 rounded-2xl font-medium focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all duration-200 px-4 border-0 border-b-[1px] rounded-none bg-transparent hover:border-white/30"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      className="w-full bg-white hover:bg-slate-200 text-black font-black text-xs uppercase tracking-[0.15em] h-12 rounded-2xl shadow-xl active:scale-[0.98] transition-all duration-200 disabled:opacity-50" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          Sign In
                        </span>
                      )}
                    </Button>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="success-message"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", damping: 20, stiffness: 100 }}
                  className="py-8 text-center space-y-6"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", damping: 15, stiffness: 200 }}
                    className="size-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto"
                  >
                    <CheckIcon className="size-10 text-emerald-500" />
                  </motion.div>
                  
                  <div className="space-y-2">
                    <motion.h2 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-2xl font-black text-white tracking-widest uppercase italic"
                    >
                      Access Granted
                    </motion.h2>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="flex items-center justify-center gap-2 text-emerald-500/70 text-[10px] font-black uppercase tracking-[0.3em]"
                    >
                      <SparklesIcon className="size-3" />
                      Enlistment Verified
                    </motion.div>
                  </div>
                  
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.8, duration: 1.2 }}
                    className="h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent mx-auto rounded-full max-w-[200px]"
                  />
                  
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="text-slate-500 text-[10px] font-medium uppercase tracking-widest"
                  >
                    Transitioning to Admin Hub...
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="mt-10 text-center">
              <button 
                onClick={() => router.push("/register")}
                className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all"
              >
                Create Account
              </button>
            </div>
          </div>

          <p className="text-center mt-8 text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">
            &copy; {new Date().getFullYear()} TechClub
          </p>
        </div>
      </motion.div>
    </div>
  )
}
