import { useState } from 'react'
import { submitMembershipApplication } from '@/lib/database'

interface MembershipFormData {
  first_name: string
  last_name: string
  email: string
  major: string
  areas_of_interest: string
}

export function useMembership() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const submitApplication = async (formData: MembershipFormData) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const result = await submitMembershipApplication(formData)
      
      if (result.success) {
        setSubmitStatus('success')
      } else {
        setSubmitStatus('error')
        setErrorMessage(result.error || 'Failed to submit application')
      }
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetStatus = () => {
    setSubmitStatus('idle')
    setErrorMessage('')
  }

  return {
    isSubmitting,
    submitStatus,
    errorMessage,
    submitApplication,
    resetStatus
  }
} 