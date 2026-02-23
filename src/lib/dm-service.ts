import { supabase, ensureAuth, DMEntry as DBDMEntry } from './supabase'
import { DMEntry, DMStats } from './types'

// Convert database format to app format
function dbToApp(dbEntry: DBDMEntry): DMEntry {
  return {
    id: dbEntry.id,
    date: dbEntry.date,
    day: dbEntry.day,
    platform: dbEntry.platform,
    chatsStarted: dbEntry.chats_started,
    activeChats: dbEntry.active_chats,
    triageBooked: dbEntry.triage_booked,
    triageShowUp: dbEntry.triage_show_up,
    strategyBooked: dbEntry.strategy_booked,
    strategyShowUp: dbEntry.strategy_show_up,
    wins: dbEntry.wins,
    nurture: dbEntry.nurture,
    connectStage: dbEntry.connect_stage,
    qualifyStage: dbEntry.qualify_stage,
    convertStage: dbEntry.convert_stage,
  }
}

// Convert app format to database format
function appToDb(entry: Omit<DMEntry, 'id'>, userId: string): Omit<DBDMEntry, 'id' | 'created_at'> {
  return {
    user_id: userId,
    date: entry.date,
    day: entry.day,
    platform: entry.platform,
    chats_started: entry.chatsStarted,
    active_chats: entry.activeChats,
    triage_booked: entry.triageBooked,
    triage_show_up: entry.triageShowUp,
    strategy_booked: entry.strategyBooked,
    strategy_show_up: entry.strategyShowUp,
    wins: entry.wins,
    nurture: entry.nurture,
    connect_stage: entry.connectStage,
    qualify_stage: entry.qualifyStage,
    convert_stage: entry.convertStage,
  }
}

export async function fetchDMEntries(): Promise<DMEntry[]> {
  await ensureAuth()

  const { data, error } = await supabase
    .from('dm_entries')
    .select('*')
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching DM entries:', error)
    throw error
  }

  return (data || []).map(dbToApp)
}

export async function addDMEntry(entry: Omit<DMEntry, 'id'>): Promise<DMEntry> {
  const user = await ensureAuth()

  const dbEntry = appToDb(entry, user.id)

  const { data, error } = await supabase
    .from('dm_entries')
    .insert(dbEntry)
    .select()
    .single()

  if (error) {
    console.error('Error adding DM entry:', error)
    throw error
  }

  return dbToApp(data)
}

export async function updateDMEntry(id: string, updates: Partial<DMEntry>): Promise<DMEntry> {
  await ensureAuth()

  const dbUpdates: any = {}
  if (updates.chatsStarted !== undefined) dbUpdates.chats_started = updates.chatsStarted
  if (updates.activeChats !== undefined) dbUpdates.active_chats = updates.activeChats
  if (updates.triageBooked !== undefined) dbUpdates.triage_booked = updates.triageBooked
  if (updates.triageShowUp !== undefined) dbUpdates.triage_show_up = updates.triageShowUp
  if (updates.strategyBooked !== undefined) dbUpdates.strategy_booked = updates.strategyBooked
  if (updates.strategyShowUp !== undefined) dbUpdates.strategy_show_up = updates.strategyShowUp
  if (updates.wins !== undefined) dbUpdates.wins = updates.wins
  if (updates.nurture !== undefined) dbUpdates.nurture = updates.nurture
  if (updates.connectStage !== undefined) dbUpdates.connect_stage = updates.connectStage
  if (updates.qualifyStage !== undefined) dbUpdates.qualify_stage = updates.qualifyStage
  if (updates.convertStage !== undefined) dbUpdates.convert_stage = updates.convertStage

  const { data, error } = await supabase
    .from('dm_entries')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating DM entry:', error)
    throw error
  }

  return dbToApp(data)
}

export async function deleteDMEntry(id: string): Promise<void> {
  await ensureAuth()

  const { error } = await supabase
    .from('dm_entries')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting DM entry:', error)
    throw error
  }
}

export async function calculateDMStats(): Promise<DMStats[]> {
  const entries = await fetchDMEntries()

  const statsByPlatform = entries.reduce((acc, entry) => {
    if (!acc[entry.platform]) {
      acc[entry.platform] = {
        platform: entry.platform,
        totalChatsStarted: 0,
        totalActiveChats: 0,
        totalTriageBooked: 0,
        totalTriageShowUp: 0,
        totalStrategyBooked: 0,
        totalStrategyShowUp: 0,
        totalWins: 0,
        totalNurture: 0,
        conversionRate: 0,
        triageShowRate: 0,
        strategyShowRate: 0,
      }
    }

    const stats = acc[entry.platform]
    stats.totalChatsStarted += entry.chatsStarted
    stats.totalActiveChats += entry.activeChats
    stats.totalTriageBooked += entry.triageBooked
    stats.totalTriageShowUp += entry.triageShowUp
    stats.totalStrategyBooked += entry.strategyBooked
    stats.totalStrategyShowUp += entry.strategyShowUp
    stats.totalWins += entry.wins
    stats.totalNurture += entry.nurture

    return acc
  }, {} as Record<string, DMStats>)

  // Calculate rates
  Object.values(statsByPlatform).forEach(stats => {
    stats.conversionRate = stats.totalChatsStarted > 0
      ? (stats.totalWins / stats.totalChatsStarted) * 100
      : 0
    stats.triageShowRate = stats.totalTriageBooked > 0
      ? (stats.totalTriageShowUp / stats.totalTriageBooked) * 100
      : 0
    stats.strategyShowRate = stats.totalStrategyBooked > 0
      ? (stats.totalStrategyShowUp / stats.totalStrategyBooked) * 100
      : 0
  })

  return Object.values(statsByPlatform)
}
