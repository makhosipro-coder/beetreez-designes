import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';
import { ensureProfile } from '@/lib/supabase/user';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();
  const profileId = await ensureProfile(session.user.email);

  const { data: original } = await supabase
    .from('designs')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!original) {
    return NextResponse.json({ error: 'Design not found' }, { status: 404 });
  }

  const isAuthor = original.author_id === profileId;
  let canAccess = isAuthor;
  if (!canAccess && original.team_id) {
    const { count } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', original.team_id)
      .eq('user_id', profileId);
    canAccess = (count ?? 0) > 0;
  }

  if (!canAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const newId = crypto.randomUUID();
  const insertData = {
    id: newId,
    author_id: profileId,
    name: (original.name || 'Untitled') + ' (copy)',
    team_id: null,
    layer_state: original.layer_state,
    design_metadata: {
      ...(original.design_metadata as Record<string, unknown>),
      authorId: session.user.email,
    },
  };

  const { error } = await supabase.from('designs').insert(insertData);
  if (error) {
    return NextResponse.json({ error: 'Failed to duplicate' }, { status: 500 });
  }

  return NextResponse.json({
    id: newId,
    name: insertData.name,
    layers: ((original.layer_state as Record<string, unknown>)?.layers as unknown[]) || [],
    rootIds: ((original.layer_state as Record<string, unknown>)?.rootIds as string[]) || [],
    metadata: {
      authorId: session.user.email,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  }, { status: 201 });
}
