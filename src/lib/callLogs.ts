import { supabase } from './supabase';

export interface CallLog {
  id: string;
  user_email: string;
  name: string;
  phone: string;
  type: 'incoming' | 'outgoing' | 'missed';
  duration: string;
  recorded: boolean;
  created_at: string;
}

export async function saveCallLog(
  userEmail: string,
  record: Omit<CallLog, 'id' | 'user_email' | 'created_at'>
): Promise<CallLog | null> {
  try {
    const { data, error } = await supabase
      .from('call_logs')
      .insert({
        user_email: userEmail,
        name: record.name,
        phone: record.phone,
        type: record.type,
        duration: record.duration,
        recorded: record.recorded,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to save call log:', error);
      return null;
    }
    return data as CallLog;
  } catch (err) {
    console.error('saveCallLog error:', err);
    return null;
  }
}

export async function fetchCallLogs(userEmail: string): Promise<CallLog[]> {
  try {
    const { data, error } = await supabase
      .from('call_logs')
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Failed to fetch call logs:', error);
      return [];
    }
    return (data as CallLog[]) ?? [];
  } catch (err) {
    console.error('fetchCallLogs error:', err);
    return [];
  }
}

export async function deleteAllCallLogs(userEmail: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('call_logs')
      .delete()
      .eq('user_email', userEmail);

    if (error) {
      console.error('Failed to delete call logs:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('deleteAllCallLogs error:', err);
    return false;
  }
}
