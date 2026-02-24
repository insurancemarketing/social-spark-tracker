import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  initiateFacebookAuth,
  isAuthenticated,
  disconnectFacebook,
  getPageInfo
} from '@/lib/facebook-oauth-simple'
import { Loader2, CheckCircle } from 'lucide-react'

export function ConnectFacebookButton() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [pageInfo, setPageInfo] = useState<{ pageName: string; hasInstagram: boolean } | null>(null)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    setIsLoading(true)
    const connected = await isAuthenticated()
    setIsConnected(connected)

    if (connected) {
      const info = await getPageInfo()
      setPageInfo(info)
    }

    setIsLoading(false)
  }

  const handleConnect = () => {
    initiateFacebookAuth()
  }

  const handleDisconnect = async () => {
    if (confirm('Are you sure you want to disconnect Facebook and Instagram?')) {
      const success = await disconnectFacebook()
      if (success) {
        setIsConnected(false)
        setPageInfo(null)
      }
    }
  }

  if (isLoading) {
    return (
      <Button disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    )
  }

  if (isConnected && pageInfo) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" className="gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          {pageInfo.pageName}
          {pageInfo.hasInstagram && ' + Instagram'}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleDisconnect}>
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <Button onClick={handleConnect}>
      Connect Facebook & Instagram
    </Button>
  )
}
