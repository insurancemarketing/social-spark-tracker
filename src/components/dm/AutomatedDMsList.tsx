import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  fetchAutomatedDMs,
  updateDMStatus,
  AutomatedDM,
  getDMStats
} from '@/lib/automated-dms-service'
import { Instagram, Facebook, CheckCircle, Archive, MailOpen } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export function AutomatedDMsList() {
  const [dms, setDMs] = useState<AutomatedDM[]>([])
  const [stats, setStats] = useState({ total: 0, new: 0, responded: 0, archived: 0, instagram: 0, facebook: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'new' | 'responded' | 'archived'>('all')

  useEffect(() => {
    loadDMs()
    loadStats()
  }, [])

  const loadDMs = async () => {
    setIsLoading(true)
    const data = await fetchAutomatedDMs(100)
    setDMs(data)
    setIsLoading(false)
  }

  const loadStats = async () => {
    const data = await getDMStats()
    setStats(data)
  }

  const handleStatusChange = async (id: string, status: 'new' | 'responded' | 'archived') => {
    const success = await updateDMStatus(id, status)
    if (success) {
      await loadDMs()
      await loadStats()
    }
  }

  const filteredDMs = filter === 'all'
    ? dms
    : dms.filter(dm => dm.status === filter)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading automated DMs...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total DMs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
            <p className="text-xs text-muted-foreground">New</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.responded}</div>
            <p className="text-xs text-muted-foreground">Responded</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-600">{stats.archived}</div>
            <p className="text-xs text-muted-foreground">Archived</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({stats.total})
        </Button>
        <Button
          variant={filter === 'new' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('new')}
        >
          New ({stats.new})
        </Button>
        <Button
          variant={filter === 'responded' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('responded')}
        >
          Responded ({stats.responded})
        </Button>
        <Button
          variant={filter === 'archived' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('archived')}
        >
          Archived ({stats.archived})
        </Button>
      </div>

      {/* DM List */}
      <Card>
        <CardHeader>
          <CardTitle>Automated DMs from Make.com</CardTitle>
          <CardDescription>
            DMs automatically captured from Instagram and Facebook
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredDMs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MailOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No DMs yet. Connect Make.com to start tracking!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDMs.map(dm => (
                <div
                  key={dm.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {dm.platform === 'instagram' ? (
                        <Instagram className="h-4 w-4 text-instagram" />
                      ) : (
                        <Facebook className="h-4 w-4 text-facebook" />
                      )}
                      <div>
                        <div className="font-semibold">{dm.sender_name || dm.sender_username}</div>
                        <div className="text-sm text-muted-foreground">@{dm.sender_username}</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(dm.timestamp), { addSuffix: true })}
                    </div>
                  </div>

                  <div className="text-sm bg-muted p-3 rounded">
                    {dm.message_text}
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant={
                      dm.status === 'new' ? 'default' :
                      dm.status === 'responded' ? 'secondary' :
                      'outline'
                    }>
                      {dm.status}
                    </Badge>

                    <div className="flex gap-2">
                      {dm.status !== 'responded' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(dm.id, 'responded')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Responded
                        </Button>
                      )}
                      {dm.status !== 'archived' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatusChange(dm.id, 'archived')}
                        >
                          <Archive className="h-4 w-4 mr-1" />
                          Archive
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
