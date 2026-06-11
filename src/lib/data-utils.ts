import { createServiceClient } from '@/lib/supabase/server';
import { ensureProfile } from '@/lib/supabase/user';
import type { Database } from '@/lib/supabase/types';

type DesignRow = Database['public']['Tables']['designs']['Row'];
type TeamRow = Database['public']['Tables']['teams']['Row'];
type TeamMemberRow = Database['public']['Tables']['team_members']['Row'];

export async function getProfileByEmail(email: string) {
  const supabase = createServiceClient();
  const { data } = await supabase.from('profiles').select('*').eq('email', email).single();
  return data;
}

export async function ensureDesignAccess(docId: string, userEmail: string): Promise<boolean> {
  const supabase = createServiceClient();
  const profileId = await ensureProfile(userEmail);

  const { data: design } = await supabase.from('designs').select('author_id, team_id').eq('id', docId).single();
  if (!design) return false;
  if (design.author_id === profileId) return true;
  if (design.team_id) {
    const { count } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', design.team_id)
      .eq('user_id', profileId);
    return (count ?? 0) > 0;
  }
  return false;
}

export async function ensureDesignEditAccess(docId: string, userEmail: string): Promise<boolean> {
  const supabase = createServiceClient();
  const profileId = await ensureProfile(userEmail);

  const { data: design } = await supabase.from('designs').select('author_id, team_id').eq('id', docId).single();
  if (!design) return false;
  if (design.author_id === profileId) return true;
  if (design.team_id) {
    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', design.team_id)
      .eq('user_id', profileId)
      .single();
    return membership?.role === 'admin' || membership?.role === 'editor';
  }
  return false;
}

export async function getTeamOrNull(id: string) {
  const supabase = createServiceClient();
  const { data } = await supabase.from('teams').select('*').eq('id', id).single();
  return data;
}

export async function getTeamMembers(teamId: string) {
  const supabase = createServiceClient();
  const { data } = await supabase.from('team_members').select('*').eq('team_id', teamId);
  return data || [];
}

export async function isTeamMember(teamId: string, userEmail: string): Promise<boolean> {
  const supabase = createServiceClient();
  const profileId = await ensureProfile(userEmail);
  const { count } = await supabase
    .from('team_members')
    .select('*', { count: 'exact', head: true })
    .eq('team_id', teamId)
    .eq('user_id', profileId);
  return (count ?? 0) > 0;
}

export async function isTeamAdmin(teamId: string, userEmail: string): Promise<boolean> {
  const supabase = createServiceClient();
  const profileId = await ensureProfile(userEmail);
  const { data } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', teamId)
    .eq('user_id', profileId)
    .single();
  return data?.role === 'admin';
}

export { ensureProfile };
