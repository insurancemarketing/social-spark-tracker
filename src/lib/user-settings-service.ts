import { supabase } from './supabase'

export interface UserSettings {
  youtube_api_key: string | null
  youtube_channel_id: string | null
  meta_access_token: string | null
  instagram_account_id: string | null
  facebook_page_id: string | null
}

const EMPTY_SETTINGS: UserSettings = {
  youtube_api_key: null,
  youtube_channel_id: null,
  meta_access_token: null,
  instagram_account_id: null,
  facebook_page_id: null,
}

// In-memory cache
let cachedSettings: UserSettings | null = null
let cachedUserId: string | null = null

export async function getUserSettings(): Promise<UserSettings> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return EMPTY_SETTINGS

  // Return cache if same user
  if (cachedSettings && cachedUserId === user.id) return cachedSettings

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    console.error('Error fetching user settings:', error)
    return EMPTY_SETTINGS
  }

  cachedSettings = data ? {
    youtube_api_key: data.youtube_api_key,
    youtube_channel_id: data.youtube_channel_id,
    meta_access_token: data.meta_access_token,
    instagram_account_id: data.instagram_account_id,
    facebook_page_id: data.facebook_page_id,
  } : EMPTY_SETTINGS
  cachedUserId = user.id

  return cachedSettings
}

export async function saveUserSettings(settings: Partial<UserSettings>): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('user_settings')
    .upsert({
      user_id: user.id,
      ...settings,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

  if (error) throw error

  // Invalidate cache
  cachedSettings = null
  cachedUserId = null
}

export function clearSettingsCache() {
  cachedSettings = null
  cachedUserId = null
}
