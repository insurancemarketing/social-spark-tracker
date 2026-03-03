import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { handleAuthCallback } from '@/lib/facebook-oauth-simple'
import { exchangeCodeForToken } from '@/lib/facebook-oauth-supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function FacebookCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for errors in query params or hash
        const queryParams = new URLSearchParams(window.location.search)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))

        const error = queryParams.get('error') || hashParams.get('error')
        const errorDescription = queryParams.get('error_description') || hashParams.get('error_description')
        const errorReason = queryParams.get('error_reason') || hashParams.get('error_reason')

        if (error) {
          const message = errorDescription
            ? decodeURIComponent(errorDescription)
            : errorReason
              ? decodeURIComponent(errorReason)
              : `Facebook returned error: ${error}`
          throw new Error(message)
        }

        // Try implicit flow (access_token in hash)
        const accessToken = hashParams.get('access_token')
        if (accessToken) {
          const result = await handleAuthCallback(accessToken)
          if (result.success) {
            setStatus('success')
            setTimeout(() => navigate('/instagram'), 2000)
            return
          }
          throw new Error(result.error || 'Failed to authenticate')
        }

        // Try authorization code flow (code in query)
        const code = queryParams.get('code')
        if (code) {
          const result = await exchangeCodeForToken(code)
          if (result.success) {
            setStatus('success')
            setTimeout(() => navigate('/instagram'), 2000)
            return
          }
          throw new Error(result.error || 'Failed to exchange authorization code')
        }

        throw new Error('No access token or authorization code received from Facebook. Make sure your app permissions and redirect URI are configured correctly.')
      } catch (error) {
        console.error('Callback error (raw):', error)
        setStatus('error')
        const msg = error instanceof Error
          ? error.message
          : typeof error === 'object'
            ? JSON.stringify(error)
            : String(error)
        setErrorMessage(msg)
      }
    }

    handleCallback()
  }, [navigate])

  const copyError = () => {
    navigator.clipboard.writeText(errorMessage)
  }

  return (
    <div className="container mx-auto py-8 flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
            {status === 'error' && <XCircle className="h-5 w-5 text-red-600" />}
            {status === 'loading' && 'Connecting...'}
            {status === 'success' && 'Connected!'}
            {status === 'error' && 'Connection Failed'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Setting up your Facebook and Instagram connection...'}
            {status === 'success' && 'Successfully connected! Redirecting...'}
            {status === 'error' && 'There was a problem connecting your account.'}
          </CardDescription>
        </CardHeader>
        {status === 'error' && (
          <CardContent className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-900">
              <p className="text-sm text-red-800 dark:text-red-200 break-words whitespace-pre-wrap">{errorMessage}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/settings')}>
                Back to Settings
              </Button>
              <Button variant="outline" onClick={copyError}>
                Copy Error
              </Button>
              <Button onClick={() => navigate('/instagram')}>
                Try Again
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
