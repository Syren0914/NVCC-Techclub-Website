import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Try fetching from Supabase practice_leaderboard table
    const { data, error } = await supabase
      .from('practice_leaderboard')
      .select('*')
      .order('problems_solved', { ascending: false })
      .limit(50)

    if (error) {
      // Table might not exist yet - return empty leaderboard
      console.warn('Leaderboard table not found or error:', error.message)
      return NextResponse.json({
        success: true,
        data: [],
        note: 'Leaderboard table not set up yet. Create the practice_leaderboard table in Supabase.'
      })
    }

    return NextResponse.json({
      success: true,
      data: data || []
    })
  } catch (error) {
    console.error('Leaderboard fetch error:', error)
    return NextResponse.json({
      success: true,
      data: [],
      note: 'Could not fetch leaderboard'
    })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, displayName, problemId, language, runtime } = body

    if (!userId || !displayName || !problemId) {
      return NextResponse.json({
        success: false,
        error: 'userId, displayName, and problemId are required'
      })
    }

    // Try to upsert the user's leaderboard entry
    // First, check if user already exists
    const { data: existing } = await supabase
      .from('practice_leaderboard')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (existing) {
      // Parse solved_problems - it's stored as a JSON array
      const solvedProblems: string[] = existing.solved_problems || []
      const isNewProblem = !solvedProblems.includes(problemId)

      const { error } = await supabase
        .from('practice_leaderboard')
        .update({
          display_name: displayName,
          problems_solved: isNewProblem ? existing.problems_solved + 1 : existing.problems_solved,
          total_submissions: existing.total_submissions + 1,
          solved_problems: isNewProblem ? [...solvedProblems, problemId] : solvedProblems,
          last_solved_at: new Date().toISOString(),
          best_runtime: runtime && (!existing.best_runtime || runtime < existing.best_runtime)
            ? runtime : existing.best_runtime,
        })
        .eq('user_id', userId)

      if (error) {
        console.warn('Leaderboard update error:', error.message)
        return NextResponse.json({ success: false, error: error.message })
      }
    } else {
      // Create new entry
      const { error } = await supabase
        .from('practice_leaderboard')
        .insert({
          user_id: userId,
          display_name: displayName,
          problems_solved: 1,
          total_submissions: 1,
          solved_problems: [problemId],
          last_solved_at: new Date().toISOString(),
          best_runtime: runtime || null,
        })

      if (error) {
        console.warn('Leaderboard insert error:', error.message)
        return NextResponse.json({ success: false, error: error.message })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Leaderboard POST error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update leaderboard'
    })
  }
}
