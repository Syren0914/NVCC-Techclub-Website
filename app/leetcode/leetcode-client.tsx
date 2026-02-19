"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false })
import {
  Play,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Code,
  BookOpen,
  Target,
  ChevronDown,
  ChevronUp,
  List,
  Sparkles,
  Terminal,
  Trophy,
  Zap,
  Loader2,
  ArrowLeft,
  Hash,
  Medal,
  Flame,
  Crown,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from "lucide-react"

// Typescript fix for Lucide icons in React 19
const PlayIcon = Play as any
const RotateCcwIcon = RotateCcw as any
const CheckCircleIcon = CheckCircle as any
const XCircleIcon = XCircle as any
const ClockIcon = Clock as any
const BarChart3Icon = BarChart3 as any
const CodeIcon = Code as any
const BookOpenIcon = BookOpen as any
const TargetIcon = Target as any
const ChevronDownIcon = ChevronDown as any
const ChevronUpIcon = ChevronUp as any
const ListIcon = List as any
const SparklesIcon = Sparkles as any
const TerminalIcon = Terminal as any
const TrophyIcon = Trophy as any
const ZapIcon = Zap as any
const Loader2Icon = Loader2 as any
const ArrowLeftIcon = ArrowLeft as any
const HashIcon = Hash as any
const MedalIcon = Medal as any
const FlameIcon = Flame as any
const CrownIcon = Crown as any
const UsersIcon = Users as any
const SearchIcon = Search as any
const ChevronLeftIcon = ChevronLeft as any
const ChevronRightIcon = ChevronRight as any
const ExternalLinkIcon = ExternalLink as any

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { PROBLEMS, type Problem } from "@/lib/leetcode-problems"
import { motion, AnimatePresence } from "framer-motion"

const MONACO_LANGUAGE_MAP: Record<string, string> = {
  python: "python",
  javascript: "javascript",
  java: "java",
}

// Unified problem type that works for both curated and API problems
interface UnifiedProblem {
  id: string
  frontendId?: string
  title: string
  titleSlug?: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  category: string
  tags: string[]
  acceptanceRate: number
  source: 'curated' | 'leetcode'
  // Only present when loaded in detail
  description?: string
  examples?: string[]
  constraints?: string[]
  starterCode?: Record<string, string>
  solution?: string
  solutionExplanation?: string
  likes?: number
  dislikes?: number
  // LeetCode-specific fields for execution
  exampleTestcases?: string[]
  expectedOutputs?: string[]
  metaData?: any
}

interface LeaderboardEntry {
  user_id: string
  display_name: string
  problems_solved: number
  total_submissions: number
  solved_problems: string[]
  last_solved_at: string
  best_runtime?: number
}

function getLocalSolved(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem('practice_solved') || '[]')
  } catch { return [] }
}

function addLocalSolved(problemId: string) {
  const solved = getLocalSolved()
  if (!solved.includes(problemId)) {
    solved.push(problemId)
    localStorage.setItem('practice_solved', JSON.stringify(solved))
  }
}

// Convert our curated Problem to UnifiedProblem
function curatedToUnified(p: Problem): UnifiedProblem {
  return {
    id: p.id,
    title: p.title,
    difficulty: p.difficulty,
    category: p.category,
    tags: p.tags,
    acceptanceRate: p.acceptanceRate,
    source: 'curated',
    description: p.description,
    examples: p.examples,
    constraints: p.constraints,
    starterCode: p.starterCode,
    solution: p.solution,
    solutionExplanation: p.solutionExplanation,
    likes: p.likes,
    dislikes: p.dislikes,
  }
}

export default function LeetCodeClient() {
  const [mounted, setMounted] = useState(false)
  const [view, setView] = useState<"problems" | "editor">("problems")
  const [activeProblem, setActiveProblem] = useState<UnifiedProblem | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState("python")
  const [code, setCode] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("problem")
  const [solvedProblems, setSolvedProblems] = useState<string[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [leaderboardLoading, setLeaderboardLoading] = useState(true)
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  // LeetCode API problem list
  const [lcProblems, setLcProblems] = useState<UnifiedProblem[]>([])
  const [lcTotal, setLcTotal] = useState(0)
  const [lcPage, setLcPage] = useState(0)
  const [lcLoading, setLcLoading] = useState(false)
  const [problemTab, setProblemTab] = useState<"curated" | "leetcode">("curated")
  const [detailLoading, setDetailLoading] = useState(false)

  const PAGE_SIZE = 50

  const { toast } = useToast()

  const fetchLeaderboard = async () => {
    setLeaderboardLoading(true)
    try {
      const res = await fetch('/api/leetcode/leaderboard')
      const data = await res.json()
      if (data.success) setLeaderboard(data.data)
    } catch {}
    setLeaderboardLoading(false)
  }

  const fetchLcProblems = async (page: number, difficulty?: string) => {
    setLcLoading(true)
    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        skip: String(page * PAGE_SIZE),
      })
      if (difficulty && difficulty !== 'all') {
        params.set('difficulty', difficulty.toUpperCase())
      }
      const res = await fetch(`/api/leetcode/problems?${params}`)
      const data = await res.json()
      if (data.success) {
        setLcProblems(data.data.problems.map((p: any) => ({
          ...p,
          source: 'leetcode' as const,
        })))
        setLcTotal(data.data.total)
      }
    } catch {
      toast({ title: "Error", description: "Failed to load LeetCode problems", variant: "destructive" })
    }
    setLcLoading(false)
  }

  useEffect(() => {
    setMounted(true)
    setSolvedProblems(getLocalSolved())
    fetchLeaderboard()
  }, [])

  // When active problem or language changes, update code
  useEffect(() => {
    if (activeProblem?.starterCode) {
      setCode(activeProblem.starterCode[selectedLanguage] || activeProblem.starterCode['python'] || "")
    }
    setTestResults([])
  }, [activeProblem, selectedLanguage])

  // Fetch LC problems when switching to that tab or changing page/filter
  useEffect(() => {
    if (problemTab === 'leetcode') {
      fetchLcProblems(lcPage, difficultyFilter)
    }
  }, [problemTab, lcPage, difficultyFilter])

  if (!mounted) return <div className="min-h-screen bg-[#050505]" />

  const openCuratedProblem = (problem: Problem) => {
    setActiveProblem(curatedToUnified(problem))
    setActiveTab("problem")
    setView("editor")
  }

  const openLcProblem = async (problem: UnifiedProblem) => {
    setDetailLoading(true)
    setView("editor")
    setActiveTab("problem")

    try {
      const res = await fetch(`/api/leetcode/problems?slug=${problem.titleSlug || problem.id}`)
      const data = await res.json()
      if (data.success) {
        const d = data.data
        setActiveProblem({
          id: d.id,
          frontendId: d.frontendId,
          title: d.title,
          titleSlug: d.titleSlug,
          difficulty: d.difficulty,
          category: d.category,
          tags: d.tags,
          acceptanceRate: d.acceptanceRate,
          source: 'leetcode',
          description: d.description,
          starterCode: d.starterCode,
          likes: d.likes,
          dislikes: d.dislikes,
          exampleTestcases: d.exampleTestcases,
          expectedOutputs: d.expectedOutputs,
          metaData: d.metaData,
        })
      } else {
        toast({ title: "Error", description: "Could not load problem details", variant: "destructive" })
        setView("problems")
      }
    } catch {
      toast({ title: "Error", description: "Failed to fetch problem", variant: "destructive" })
      setView("problems")
    }
    setDetailLoading(false)
  }

  const handleRunCode = async () => {
    if (!activeProblem) return
    setIsRunning(true)
    setActiveTab("results")

    try {
      const payload: any = {
        code,
        language: selectedLanguage,
        problemId: activeProblem.id,
      }

      // For LeetCode API problems, pass the test data so the backend can wrap + validate
      if (activeProblem.source === 'leetcode') {
        payload.exampleTestcases = activeProblem.exampleTestcases
        payload.expectedOutputs = activeProblem.expectedOutputs
        payload.metaData = activeProblem.metaData
        payload.source = 'leetcode'
      }

      const response = await fetch('/api/leetcode/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.success) {
        const results = data.data.testCases.map((tc: any) => ({
          testCase: tc.input,
          expected: tc.expected,
          actual: tc.actual,
          passed: tc.passed,
          runtime: tc.runtime,
          error: tc.error
        }))
        setTestResults(results)

        const allPassed = data.data.success
        toast({
          title: allPassed ? "All Tests Passed!" : "Some Tests Failed",
          description: data.data.output,
          variant: allPassed ? "default" : "destructive"
        })

        if (allPassed) {
          addLocalSolved(activeProblem.id)
          setSolvedProblems(getLocalSolved())
          fetch('/api/leetcode/leaderboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: 'local-user',
              displayName: 'Anonymous',
              problemId: activeProblem.id,
              language: selectedLanguage,
              runtime: data.data.runtime,
            })
          }).catch(() => {})
        }
      } else {
        toast({ title: "Execution Error", description: data.error || "Failed to execute code", variant: "destructive" })
      }
    } catch {
      toast({ title: "Execution Error", description: "Failed to execute code. Check your connection.", variant: "destructive" })
    }
    setIsRunning(false)
  }

  const handleResetCode = () => {
    if (activeProblem?.starterCode) {
      setCode(activeProblem.starterCode[selectedLanguage] || activeProblem.starterCode['python'] || "")
    }
    setTestResults([])
  }

  const getDifficultyStyles = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
      case 'Medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
      case 'Hard': return 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]'
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20'
    }
  }

  // Filter curated problems
  const filteredCurated = PROBLEMS.filter(p => {
    if (difficultyFilter !== 'all' && p.difficulty !== difficultyFilter) return false
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  // Filter LC problems by search (difficulty is done server-side)
  const filteredLc = lcProblems.filter(p => {
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const solvedCount = solvedProblems.length
  const easyCount = PROBLEMS.filter(p => p.difficulty === 'Easy' && solvedProblems.includes(p.id)).length
  const mediumCount = PROBLEMS.filter(p => p.difficulty === 'Medium' && solvedProblems.includes(p.id)).length
  const hardCount = PROBLEMS.filter(p => p.difficulty === 'Hard' && solvedProblems.includes(p.id)).length

  // ==================== PROBLEMS LIST VIEW ====================
  if (view === "problems") {
    return (
      <div className="min-h-screen bg-[#050505] text-white selection:bg-white/10">
        <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[150px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-slate-900/10 blur-[150px]" />
        </div>

        <header className="sticky top-[104px] z-50 border-b border-white/5 bg-black/40 backdrop-blur-3xl">
          <div className="container mx-auto flex h-20 items-center justify-between px-8">
            <div className="flex items-center gap-6">
              <div className="size-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-white shadow-2xl">
                <TerminalIcon className="size-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black font-outfit tracking-tight text-white leading-none">Practice</h1>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em] mt-1.5 flex items-center gap-2">
                  <SparklesIcon className="size-3 text-white/40" />
                  Algorithm Forge
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-sm mx-8">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-600" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search problems..."
                className="w-full h-11 bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-white/20 transition-all"
              />
            </div>
          </div>
        </header>

        <main className="container mx-auto px-8 py-12 relative z-10">
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          >
            <div className="bg-[#0a0a0a]/60 backdrop-blur-3xl border border-white/5 rounded-[1.5rem] p-6 text-center hover:bg-white/[0.03] transition-all">
              <p className="text-3xl font-black font-outfit text-white mb-1">{solvedCount}</p>
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Solved</p>
            </div>
            <div className="bg-[#0a0a0a]/60 backdrop-blur-3xl border border-emerald-500/10 rounded-[1.5rem] p-6 text-center hover:bg-emerald-500/[0.03] transition-all">
              <p className="text-3xl font-black font-outfit text-emerald-500 mb-1">{easyCount}</p>
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Easy</p>
            </div>
            <div className="bg-[#0a0a0a]/60 backdrop-blur-3xl border border-amber-500/10 rounded-[1.5rem] p-6 text-center hover:bg-amber-500/[0.03] transition-all">
              <p className="text-3xl font-black font-outfit text-amber-500 mb-1">{mediumCount}</p>
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Medium</p>
            </div>
            <div className="bg-[#0a0a0a]/60 backdrop-blur-3xl border border-rose-500/10 rounded-[1.5rem] p-6 text-center hover:bg-rose-500/[0.03] transition-all">
              <p className="text-3xl font-black font-outfit text-rose-500 mb-1">{hardCount}</p>
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Hard</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                {/* Tab switch + Difficulty filter */}
                <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setProblemTab("curated")}
                      className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        problemTab === 'curated' ? 'bg-white text-black' : 'bg-white/[0.03] border border-white/5 text-slate-500 hover:text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      Curated ({PROBLEMS.length})
                    </button>
                    <button
                      onClick={() => setProblemTab("leetcode")}
                      className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                        problemTab === 'leetcode' ? 'bg-white text-black' : 'bg-white/[0.03] border border-white/5 text-slate-500 hover:text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      LeetCode
                      <ExternalLinkIcon className="size-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {['all', 'Easy', 'Medium', 'Hard'].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => {
                          setDifficultyFilter(filter)
                          if (problemTab === 'leetcode') setLcPage(0)
                        }}
                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                          difficultyFilter === filter
                            ? 'bg-white text-black'
                            : 'bg-white/[0.03] border border-white/5 text-slate-500 hover:text-white hover:bg-white/[0.05]'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Problem Table */}
                <div className="bg-[#0a0a0a]/60 backdrop-blur-3xl border border-white/5 rounded-[2rem] overflow-hidden">
                  <div className="grid grid-cols-12 gap-4 px-8 py-4 border-b border-white/5">
                    <div className="col-span-1 text-[9px] font-black text-slate-700 uppercase tracking-widest">#</div>
                    <div className="col-span-5 text-[9px] font-black text-slate-700 uppercase tracking-widest">Title</div>
                    <div className="col-span-2 text-[9px] font-black text-slate-700 uppercase tracking-widest">Category</div>
                    <div className="col-span-2 text-[9px] font-black text-slate-700 uppercase tracking-widest">Difficulty</div>
                    <div className="col-span-2 text-[9px] font-black text-slate-700 uppercase tracking-widest text-right">Acceptance</div>
                  </div>

                  {problemTab === 'curated' ? (
                    // Curated problems
                    filteredCurated.length > 0 ? filteredCurated.map((problem, index) => {
                      const isSolved = solvedProblems.includes(problem.id)
                      return (
                        <motion.button
                          key={problem.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          onClick={() => openCuratedProblem(problem)}
                          className={`w-full grid grid-cols-12 gap-4 px-8 py-5 border-b border-white/[0.03] transition-all duration-300 text-left group ${
                            isSolved ? 'bg-emerald-500/[0.02]' : 'hover:bg-white/[0.02]'
                          }`}
                        >
                          <div className="col-span-1 flex items-center">
                            {isSolved ? (
                              <div className="size-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                <CheckCircleIcon className="size-3.5 text-emerald-500" />
                              </div>
                            ) : (
                              <div className="size-6 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center">
                                <div className="size-1.5 rounded-full bg-slate-700" />
                              </div>
                            )}
                          </div>
                          <div className="col-span-5 flex items-center">
                            <span className="font-bold text-sm font-outfit text-white group-hover:translate-x-1 transition-transform duration-300">
                              {problem.title}
                            </span>
                            <Badge className="ml-2 text-[8px] font-bold bg-emerald-500/10 text-emerald-500 border-0 px-1.5 py-0">
                              Tested
                            </Badge>
                          </div>
                          <div className="col-span-2 flex items-center">
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{problem.category}</span>
                          </div>
                          <div className="col-span-2 flex items-center">
                            <Badge className={`text-[9px] font-black uppercase tracking-widest rounded-lg px-2.5 py-0.5 border-0 ${getDifficultyStyles(problem.difficulty)}`}>
                              {problem.difficulty}
                            </Badge>
                          </div>
                          <div className="col-span-2 flex items-center justify-end">
                            <span className="text-xs font-bold text-slate-500">{problem.acceptanceRate}%</span>
                          </div>
                        </motion.button>
                      )
                    }) : (
                      <div className="p-12 text-center text-slate-600 text-sm">No problems match your filter</div>
                    )
                  ) : (
                    // LeetCode API problems
                    lcLoading ? (
                      <div className="p-16 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/10 border-t-white mx-auto mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Fetching from LeetCode</p>
                      </div>
                    ) : filteredLc.length > 0 ? filteredLc.map((problem, index) => {
                      const isSolved = solvedProblems.includes(problem.id)
                      return (
                        <motion.button
                          key={problem.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.02 }}
                          onClick={() => openLcProblem(problem)}
                          className={`w-full grid grid-cols-12 gap-4 px-8 py-5 border-b border-white/[0.03] transition-all duration-300 text-left group ${
                            isSolved ? 'bg-emerald-500/[0.02]' : 'hover:bg-white/[0.02]'
                          }`}
                        >
                          <div className="col-span-1 flex items-center">
                            <span className="text-[10px] font-bold text-slate-600">{problem.frontendId}</span>
                          </div>
                          <div className="col-span-5 flex items-center">
                            <span className="font-bold text-sm font-outfit text-white group-hover:translate-x-1 transition-transform duration-300">
                              {problem.title}
                            </span>
                          </div>
                          <div className="col-span-2 flex items-center">
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{problem.category}</span>
                          </div>
                          <div className="col-span-2 flex items-center">
                            <Badge className={`text-[9px] font-black uppercase tracking-widest rounded-lg px-2.5 py-0.5 border-0 ${getDifficultyStyles(problem.difficulty)}`}>
                              {problem.difficulty}
                            </Badge>
                          </div>
                          <div className="col-span-2 flex items-center justify-end">
                            <span className="text-xs font-bold text-slate-500">{problem.acceptanceRate}%</span>
                          </div>
                        </motion.button>
                      )
                    }) : (
                      <div className="p-12 text-center text-slate-600 text-sm">
                        {searchQuery ? 'No problems match your search' : 'Could not load LeetCode problems. Try again.'}
                      </div>
                    )
                  )}
                </div>

                {/* Pagination for LeetCode tab */}
                {problemTab === 'leetcode' && !lcLoading && lcTotal > 0 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      Showing {lcPage * PAGE_SIZE + 1}-{Math.min((lcPage + 1) * PAGE_SIZE, lcTotal)} of {lcTotal} problems
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={lcPage === 0}
                        onClick={() => setLcPage(p => p - 1)}
                        className="h-9 px-3 bg-white/[0.03] border-white/10 rounded-xl hover:bg-white hover:text-black"
                      >
                        <ChevronLeftIcon className="size-4" />
                      </Button>
                      <span className="text-[10px] font-black text-slate-500 px-2">
                        Page {lcPage + 1} / {Math.ceil(lcTotal / PAGE_SIZE)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={(lcPage + 1) * PAGE_SIZE >= lcTotal}
                        onClick={() => setLcPage(p => p + 1)}
                        className="h-9 px-3 bg-white/[0.03] border-white/10 rounded-xl hover:bg-white hover:text-black"
                      >
                        <ChevronRightIcon className="size-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Leaderboard */}
            <div className="lg:col-span-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] flex items-center gap-2 mb-6">
                  <TrophyIcon className="size-3.5 text-white/30" />
                  Leaderboard
                </h2>

                <div className="bg-[#0a0a0a]/60 backdrop-blur-3xl border border-white/5 rounded-[2rem] overflow-hidden">
                  {leaderboardLoading ? (
                    <div className="p-12 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/10 border-t-white mx-auto mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Loading ranks</p>
                    </div>
                  ) : leaderboard.length > 0 ? (
                    <div>
                      {leaderboard.map((entry, index) => (
                        <div key={entry.user_id} className="flex items-center gap-4 px-6 py-4 border-b border-white/[0.03] hover:bg-white/[0.02] transition-all">
                          <div className="shrink-0">
                            {index === 0 ? (
                              <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center"><CrownIcon className="size-5 text-amber-500" /></div>
                            ) : index === 1 ? (
                              <div className="size-10 rounded-xl bg-slate-300/10 flex items-center justify-center"><MedalIcon className="size-5 text-slate-300" /></div>
                            ) : index === 2 ? (
                              <div className="size-10 rounded-xl bg-amber-700/10 flex items-center justify-center"><MedalIcon className="size-5 text-amber-700" /></div>
                            ) : (
                              <div className="size-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                                <span className="text-xs font-black text-slate-500">{index + 1}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-white truncate">{entry.display_name}</p>
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{entry.problems_solved} solved</p>
                          </div>
                          <p className="text-lg font-black text-white shrink-0">{entry.problems_solved}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <div className="size-16 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center mx-auto mb-6">
                        <UsersIcon className="size-7 text-slate-800" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-2">No Rankings Yet</p>
                      <p className="text-[10px] text-slate-700 max-w-[200px] mx-auto leading-relaxed">Solve problems to appear on the leaderboard</p>
                    </div>
                  )}
                </div>

                {/* Progress Card */}
                <div className="mt-6 bg-[#0a0a0a]/60 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-8">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
                    <FlameIcon className="size-3.5 text-white/30" />
                    Your Progress
                  </h3>
                  <div className="space-y-4">
                    {(['Easy', 'Medium', 'Hard'] as const).map((diff, i) => {
                      const total = PROBLEMS.filter(p => p.difficulty === diff).length
                      const solved = PROBLEMS.filter(p => p.difficulty === diff && solvedProblems.includes(p.id)).length
                      const color = diff === 'Easy' ? 'emerald' : diff === 'Medium' ? 'amber' : 'rose'
                      return (
                        <div key={diff}>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-[9px] font-black text-${color}-500 uppercase tracking-widest`}>{diff}</span>
                            <span className="text-[9px] font-black text-slate-600">{solved}/{total}</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(solved / Math.max(total, 1)) * 100}%` }}
                              transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                              className={`h-full bg-${color}-500 rounded-full`}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // ==================== EDITOR VIEW ====================
  if (!activeProblem) return null

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white/10">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-slate-900/10 blur-[150px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-3xl">
        <div className="container mx-auto flex h-20 items-center justify-between px-8">
          <div className="flex items-center gap-6">
            <Button
              variant="outline"
              onClick={() => setView("problems")}
              className="h-11 px-5 bg-white/[0.03] border-white/10 rounded-xl hover:bg-white hover:text-black transition-all flex items-center gap-3 group"
            >
              <ArrowLeftIcon className="size-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              <span className="text-[10px] font-black uppercase tracking-widest">Problems</span>
            </Button>
            <div>
              <h1 className="text-xl font-black font-outfit tracking-tight text-white leading-none flex items-center gap-3">
                {activeProblem.frontendId && <span className="text-slate-500">#{activeProblem.frontendId}</span>}
                {activeProblem.title}
              </h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em] mt-1 flex items-center gap-2">
                <CodeIcon className="size-3 text-white/40" />
                {activeProblem.category}
                {activeProblem.source === 'leetcode' && (
                  <span className="text-blue-400 ml-1">via LeetCode</span>
                )}
              </p>
            </div>
          </div>
          <Badge className={`text-[9px] font-black uppercase tracking-widest rounded-lg px-3 py-1 border-0 ${getDifficultyStyles(activeProblem.difficulty)}`}>
            {activeProblem.difficulty}
          </Badge>
        </div>
      </header>

      {detailLoading ? (
        <div className="flex items-center justify-center py-40">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/10 border-t-white mx-auto mb-6" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Loading problem data</p>
          </div>
        </div>
      ) : (
        <main className="container mx-auto px-8 py-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Problem Description */}
            <div className="lg:col-span-4 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0a0a0a]/60 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 shadow-3xl overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-4 mb-10">
                  <div className="bg-white/[0.03] border border-white/5 rounded-[1.25rem] p-6 text-center">
                    <p className="text-2xl font-black font-outfit text-white mb-1">{activeProblem.acceptanceRate}%</p>
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Acceptance</p>
                  </div>
                  <div className="bg-white/[0.03] border border-white/5 rounded-[1.25rem] p-6 text-center">
                    <p className="text-2xl font-black font-outfit text-white mb-1">{activeProblem.likes || 0}</p>
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Likes</p>
                  </div>
                </div>

                <div className="space-y-10 custom-scrollbar max-h-[50vh] pr-4 overflow-y-auto">
                  {activeProblem.source === 'leetcode' ? (
                    <div
                      className="leetcode-content text-sm text-slate-300 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: activeProblem.description || '' }}
                    />
                  ) : (
                    <>
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                          <BookOpenIcon className="size-3.5 text-white/30" /> Description
                        </h3>
                        <p className="text-sm font-medium text-slate-400 leading-relaxed whitespace-pre-line tracking-wide">
                          {activeProblem.description || 'Loading...'}
                        </p>
                      </div>

                      {activeProblem.examples && activeProblem.examples.length > 0 && (
                        <div className="space-y-6">
                          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <SparklesIcon className="size-3.5 text-white/30" /> Examples
                          </h3>
                          <div className="space-y-4">
                            {activeProblem.examples.map((ex, i) => (
                              <div key={i} className="rounded-2xl bg-black/40 border border-white/10 p-5">
                                <p className="text-xs font-mono text-slate-300 whitespace-pre-line leading-relaxed">{ex}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeProblem.constraints && activeProblem.constraints.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <TargetIcon className="size-3.5 text-white/30" /> Constraints
                          </h3>
                          <ul className="space-y-3">
                            {activeProblem.constraints.map((c, i) => (
                              <li key={i} className="flex items-center gap-3">
                                <div className="size-1.5 rounded-full bg-white opacity-20" />
                                <span className="text-xs font-medium text-slate-500">{c}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}

                  <div className="pt-4 flex flex-wrap gap-2">
                    {activeProblem.tags.map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-white/[0.03] border-white/5 rounded-lg px-3 py-1">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* IDE */}
            <div className="lg:col-span-8 space-y-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex items-center justify-between mb-8">
                  <TabsList className="bg-white/[0.03] border border-white/10 p-1.5 h-14 rounded-2xl flex-1 max-w-md">
                    <TabsTrigger value="problem" className="flex-1 rounded-xl h-full text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-black transition-all duration-300">
                      <CodeIcon className="size-4 mr-2" /> Workspace
                    </TabsTrigger>
                    <TabsTrigger value="results" className="flex-1 rounded-xl h-full text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-black transition-all duration-300 relative">
                      <BarChart3Icon className="size-4 mr-2" /> Results
                      {testResults.length > 0 && (
                        <span className="absolute -top-1 -right-1 size-5 rounded-full bg-emerald-500 text-[8px] flex items-center justify-center text-white border-2 border-[#050505]">
                          {testResults.filter(r => r.passed).length}
                        </span>
                      )}
                    </TabsTrigger>
                    {activeProblem.solution && (
                      <TabsTrigger value="solution" className="flex-1 rounded-xl h-full text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-black transition-all duration-300">
                        <TrophyIcon className="size-4 mr-2" /> Solution
                      </TabsTrigger>
                    )}
                  </TabsList>

                  <div className="flex items-center gap-3">
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="h-14 bg-white/[0.03] border border-white/10 rounded-2xl px-6 text-[10px] font-black uppercase tracking-widest text-slate-300 focus:outline-none focus:border-white/20 transition-all appearance-none text-center cursor-pointer min-w-[140px]"
                    >
                      <option value="python">Python</option>
                      <option value="javascript">JavaScript</option>
                      <option value="java">Java</option>
                    </select>
                    <Button
                      variant="outline"
                      onClick={handleResetCode}
                      className="size-14 rounded-2xl bg-white/[0.03] border-white/10 hover:bg-rose-500 hover:text-white transition-all group"
                    >
                      <RotateCcwIcon className="size-5 opacity-40 group-hover:opacity-100 transition-opacity" />
                    </Button>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <TabsContent value="problem" key="workspace" className="m-0 focus-visible:outline-none">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-[#0a0a0a]/60 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-1.5 shadow-3xl overflow-hidden"
                    >
                      <div className="bg-black/40 rounded-[2.25rem] overflow-hidden border border-white/5 relative">
                        <Editor
                          height="550px"
                          theme="vs-dark"
                          language={MONACO_LANGUAGE_MAP[selectedLanguage] || "python"}
                          value={code}
                          onChange={(value) => setCode(value || "")}
                          loading={
                            <div className="h-full flex flex-col items-center justify-center space-y-4">
                              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/10 border-t-white" />
                              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Initializing Editor</p>
                            </div>
                          }
                          options={{
                            minimap: { enabled: false },
                            fontSize: 16,
                            lineNumbers: "on",
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            tabSize: 4,
                            wordWrap: "on",
                            padding: { top: 32, bottom: 32 },
                            fontFamily: "'JetBrains Mono', monospace",
                            cursorSmoothCaretAnimation: "on",
                            smoothScrolling: true,
                            roundedSelection: true,
                            contextmenu: true,
                            renderLineHighlight: "all",
                            scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8, useShadows: false }
                          }}
                        />
                      </div>

                      <div className="p-10 flex items-center justify-between">
                        <div className="flex items-center gap-8">
                          <div className="flex items-center gap-3">
                            <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ready</span>
                          </div>
                          {solvedProblems.includes(activeProblem.id) && (
                            <div className="flex items-center gap-3">
                              <CheckCircleIcon className="size-4 text-emerald-500" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Solved</span>
                            </div>
                          )}
                          {activeProblem.source === 'leetcode' && (
                            <span className="text-[10px] font-bold text-blue-400/60 uppercase tracking-widest">Tests from examples</span>
                          )}
                        </div>

                        <Button
                          onClick={handleRunCode}
                          disabled={isRunning}
                          className="h-16 px-12 bg-white text-black rounded-[1.25rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 group"
                        >
                          {isRunning ? (
                            <><Loader2Icon className="size-5 animate-spin mr-3" /> Executing...</>
                          ) : (
                            <><PlayIcon className="size-5 mr-3 group-hover:text-emerald-500 transition-colors" /> Run Code</>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="results" key="results" className="m-0 focus-visible:outline-none">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                      {testResults.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6">
                          {testResults.map((result, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className={`p-8 bg-[#0a0a0a]/60 backdrop-blur-3xl border rounded-[2rem] transition-all ${
                                result.passed ? 'border-emerald-500/10' : 'border-rose-500/10'
                              }`}
                            >
                              <div className="flex items-start gap-6">
                                <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 ${
                                  result.passed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                                }`}>
                                  {result.passed ? <CheckCircleIcon className="size-6" /> : <XCircleIcon className="size-6" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Test Case {index + 1}</h4>
                                    {result.runtime && (
                                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
                                        <ClockIcon className="size-3 text-slate-500" />
                                        <span className="text-[10px] font-black text-slate-400">{result.runtime}ms</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                      <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Input</span>
                                      <pre className="text-xs font-mono text-slate-300 bg-black/40 p-4 rounded-xl border border-white/5 min-h-[4rem] overflow-auto">{result.testCase}</pre>
                                    </div>
                                    <div className="space-y-2">
                                      <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Expected</span>
                                      <pre className="text-xs font-mono text-slate-300 bg-black/40 p-4 rounded-xl border border-white/5 min-h-[4rem] overflow-auto">{result.expected}</pre>
                                    </div>
                                    <div className="space-y-2">
                                      <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Actual</span>
                                      <pre className={`text-xs font-mono p-4 rounded-xl border min-h-[4rem] overflow-auto ${
                                        result.passed ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' : 'bg-rose-500/5 border-rose-500/10 text-rose-400'
                                      }`}>{result.actual}</pre>
                                    </div>
                                  </div>
                                  {result.error && (
                                    <div className="mt-6 p-6 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
                                      <p className="text-[9px] font-black text-rose-500/60 uppercase tracking-widest mb-3">Error</p>
                                      <pre className="text-[11px] font-mono text-rose-400/80 whitespace-pre-wrap">{result.error}</pre>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-40 bg-[#0a0a0a]/60 border border-dashed border-white/5 rounded-[3rem]">
                          <div className="size-24 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center mx-auto mb-8">
                            <BarChart3Icon className="size-10 text-slate-800" />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Run your code to see results</p>
                        </div>
                      )}
                    </motion.div>
                  </TabsContent>

                  {activeProblem.solution && (
                    <TabsContent value="solution" key="solution" className="m-0 focus-visible:outline-none">
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-[#0a0a0a]/60 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 space-y-10"
                      >
                        <div className="bg-black/40 rounded-[2rem] overflow-hidden border border-white/10">
                          <Editor
                            height="350px"
                            theme="vs-dark"
                            language="python"
                            value={activeProblem.solution}
                            options={{ readOnly: true, minimap: { enabled: false }, fontSize: 15, lineNumbers: "on", scrollBeyondLastLine: false, automaticLayout: true, padding: { top: 32, bottom: 32 }, fontFamily: "'JetBrains Mono', monospace" }}
                          />
                        </div>
                        {activeProblem.solutionExplanation && (
                          <div className="p-8 bg-white/[0.03] border border-white/5 rounded-[2rem]">
                            <p className="text-sm font-medium text-slate-400 leading-relaxed italic">{activeProblem.solutionExplanation}</p>
                          </div>
                        )}
                      </motion.div>
                    </TabsContent>
                  )}
                </AnimatePresence>
              </Tabs>
            </div>
          </div>
        </main>
      )}
    </div>
  )
}
