import { supabase } from './supabase'

export interface AutomatedDM {
  id: string
  user_id: string
  platform: 'instagram' | 'facebook'
  sender_username: string
  sender_name: string | null
  message_text: string
  message_id: string | null
  conversation_id: string | null
  timestamp: string
  status: 'new' | 'responded' | 'archived'
  tags: string[] | null
  notes: string | null
  created_at: string
  updated_at: string
}

export async function fetchAutomatedDMs(limit = 50): Promise<AutomatedDM[]> {
  try {
    const { data, error } = await supabase
      .from('automated_dms')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching automated DMs:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching automated DMs:', error)
    return []
  }
}

export async function updateDMStatus(
  id: string,
  status: 'new' | 'responded' | 'archived'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('automated_dms')
      .update({ status })
      .eq('id', id)

    if (error) {
      console.error('Error updating DM status:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating DM status:', error)
    return false
  }
}

export async function addDMNotes(id: string, notes: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('automated_dms')
      .update({ notes })
      .eq('id', id)

    if (error) {
      console.error('Error adding DM notes:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error adding DM notes:', error)
    return false
  }
}

export async function addDMTags(id: string, tags: string[]): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('automated_dms')
      .update({ tags })
      .eq('id', id)

    if (error) {
      console.error('Error adding DM tags:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error adding DM tags:', error)
    return false
  }
}

export async function deleteDM(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('automated_dms')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting DM:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting DM:', error)
    return false
  }
}

// Get DM stats
export async function getDMStats() {
  try {
    const { data, error } = await supabase
      .from('automated_dms')
      .select('status, platform')

    if (error) {
      console.error('Error fetching DM stats:', error)
      return { total: 0, new: 0, responded: 0, archived: 0 }
    }

    const stats = {
      total: data.length,
      new: data.filter(dm => dm.status === 'new').length,
      responded: data.filter(dm => dm.status === 'responded').length,
      archived: data.filter(dm => dm.status === 'archived').length,
      instagram: data.filter(dm => dm.platform === 'instagram').length,
      facebook: data.filter(dm => dm.platform === 'facebook').length,
    }

    return stats
  } catch (error) {
    console.error('Error fetching DM stats:', error)
    return { total: 0, new: 0, responded: 0, archived: 0, instagram: 0, facebook: 0 }
  }
}
