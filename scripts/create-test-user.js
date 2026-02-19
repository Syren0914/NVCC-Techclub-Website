// Simple script to create a test user
// Run this with: node scripts/create-test-user.js

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Replace with your Supabase URL and anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Supabase credentials not found in env!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createTestUser() {
  try {
    console.log('Creating test user...')
    
    const { data, error } = await supabase.auth.signUp({
      email: 'test@techclub.com',
      password: 'testpassword123',
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User',
          major: 'Computer Science',
          year_of_study: 'Junior',
          technical_experience_level: 'Intermediate'
        }
      }
    })

    if (error) {
      if (error.message.includes('already registered')) {
        console.log('ℹ️ Test user already exists.')
      } else {
        console.error('Error creating user:', error.message)
      }
      return
    }

    console.log('✅ Test user created successfully!')
    console.log('Email: test@techclub.com')
    console.log('Password: testpassword123')
    console.log('User ID:', data.user?.id)
    
    // Create profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          first_name: 'Test',
          last_name: 'User',
          email: 'test@techclub.com',
          major: 'Computer Science',
          year_of_study: 'Junior',
          technical_experience_level: 'Intermediate',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (profileError) {
        console.error('Error creating profile:', profileError.message)
      } else {
        console.log('✅ User profile created successfully!')
      }
    }

  } catch (error) {
    console.error('Error:', error.message)
  }
}

createTestUser() 
