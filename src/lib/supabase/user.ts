import { createServiceClient } from './server';

export async function ensureProfile(email: string, name?: string | null): Promise<string> {
  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  if (existing) return existing.id;

  const id = crypto.randomUUID();
  await supabase.from('profiles').insert({
    id,
    email,
    name: name || email.split('@')[0] || 'User',
  });
  return id;
}
