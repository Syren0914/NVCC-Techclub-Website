"use client"

import { useEffect, useRef, useState } from 'react'

interface MermaidGraphProps {
  chart: string
  className?: string
}

export default function MermaidGraph({ chart, className = "" }: MermaidGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isRendered, setIsRendered] = useState(false)

  useEffect(() => {
    const renderMermaid = async () => {
      if (containerRef.current && !isRendered) {
        try {
          // Dynamically import mermaid to avoid SSR issues
          const mermaid = (await import('mermaid')).default
          
          mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            flowchart: {
              useMaxWidth: true,
              htmlLabels: true,
            },
            securityLevel: 'loose',
          })
          
          const { svg } = await mermaid.render('mermaid-graph-' + Date.now(), chart)
          containerRef.current.innerHTML = svg
          setIsRendered(true)
        } catch (error) {
          console.error('Error rendering Mermaid graph:', error)
          // Fallback to simple text display
          if (containerRef.current) {
            containerRef.current.innerHTML = `
              <div class="p-4 text-center text-gray-500">
                <div class="text-lg font-semibold mb-2">Learning Path</div>
                <div class="text-sm">
                  🎯 Start Here → 📚 Arrays & Strings → 📋 Linked Lists → 🌳 Trees & Graphs → 🎉 Advanced Topics
                </div>
              </div>
            `
          }
        }
      }
    }

    renderMermaid()
  }, [chart, isRendered])

  return (
    <div 
      ref={containerRef} 
      className={`mermaid-container ${className}`}
      style={{ 
        backgroundColor: 'white', 
        borderRadius: '8px',
        padding: '16px',
        overflow: 'auto',
        minHeight: '200px'
      }}
    />
  )
} 