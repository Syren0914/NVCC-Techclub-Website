"use client"

import Link from "next/link"
import { BookOpen, ArrowRight, CheckCircle, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface LearningStep {
  id: string
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  status: 'completed' | 'in-progress' | 'not-started'
  problems: string[]
}

const learningPath: LearningStep[] = [
  {
    id: 'arrays',
    title: 'Arrays & Strings',
    difficulty: 'Easy',
    status: 'completed',
    problems: ['Two Sum', 'Valid Parentheses', 'Maximum Subarray']
  },
  {
    id: 'linked-lists',
    title: 'Linked Lists',
    difficulty: 'Easy',
    status: 'in-progress',
    problems: ['Reverse Linked List', 'Merge Two Lists']
  },
  {
    id: 'trees',
    title: 'Trees & Graphs',
    difficulty: 'Medium',
    status: 'not-started',
    problems: ['Binary Tree Traversal', 'Graph Traversal']
  },
  {
    id: 'advanced',
    title: 'Advanced Topics',
    difficulty: 'Hard',
    status: 'not-started',
    problems: ['Dynamic Programming', 'Backtracking', 'Greedy Algorithms']
  }
]

export default function LearningPath() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="size-4 text-green-500" />
      case 'in-progress':
        return <Circle className="size-4 text-yellow-500" />
      default:
        return <Circle className="size-4 text-gray-300" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Hard':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-4">
      {/* Visual Learning Path */}
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Learning Path Flow</h3>
          <Badge variant="outline" className="text-xs">Beginner Friendly</Badge>
        </div>
        
        <div className="space-y-3">
          {learningPath.map((step, index) => (
            <div key={step.id} className="relative">
              {/* Connection Line */}
              {index < learningPath.length - 1 && (
                <div className="absolute left-6 top-8 bottom-0 w-px bg-gray-300"></div>
              )}
              
              <div className="flex items-start gap-3 p-3 bg-white rounded-lg border shadow-sm">
                {/* Status Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(step.status)}
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-900">{step.title}</h4>
                    <Badge variant="outline" className={`text-xs ${getDifficultyColor(step.difficulty)}`}>
                      {step.difficulty}
                    </Badge>
                  </div>
                  
                  {/* Problems */}
                  <div className="space-y-1">
                    {step.problems.map((problem, problemIndex) => (
                      <div key={problemIndex} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <span>{problem}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Arrow */}
                {index < learningPath.length - 1 && (
                  <ArrowRight className="size-4 text-gray-400 flex-shrink-0 mt-1" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center p-2 bg-green-100 rounded">
          <div className="font-bold text-green-800">3</div>
          <div className="text-green-600">Foundation</div>
        </div>
        <div className="text-center p-2 bg-yellow-100 rounded">
          <div className="font-bold text-yellow-800">2</div>
          <div className="text-yellow-600">Linked Lists</div>
        </div>
        <div className="text-center p-2 bg-purple-100 rounded">
          <div className="font-bold text-purple-800">2</div>
          <div className="text-purple-600">Trees</div>
        </div>
      </div>
      
      <Button className="w-full" variant="outline" asChild>
        <Link href="/leetcode">
          <BookOpen className="size-4 mr-2" />
          Start Learning Path
        </Link>
      </Button>
    </div>
  )
} 