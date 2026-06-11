import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';
import { ensureProfile } from '@/lib/supabase/user';
import { handleError, ApiError } from '@/lib/api-utils';
import { teamUpdateSchema } from '@/lib/validations';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new ApiError(401, 'Unauthorized');

    const supabase = createServiceClient();
    const profileId = await ensureProfile(session.user.email);

    const { data: team } = await supabase.from('teams').select('*').eq('id', params.id).single();
    if (!team) throw new ApiError(404, 'Not found');

    const { data: members } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', params.id);

    const isMember = members?.some((m) => m.user_id === profileId);
    if (!isMember && team.owner_id !== profileId) throw new ApiError(403, 'Forbidden');

    return NextResponse.json({
      id: team.id,
      name: team.name,
      ownerId: team.owner_id,
      members: (members || []).map((m) => ({
        userId: m.user_id,
        email: m.user_id,
        name: m.user_id,
        role: m.role,
        joinedAt: new Date(m.created_at).getTime(),
      })),
      createdAt: new Date(team.created_at).getTime(),
      updatedAt: new Date(team.created_at).getTime(),
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new ApiError(401, 'Unauthorized');

    const supabase = createServiceClient();
    const profileId = await ensureProfile(session.user.email);

    const { data: team } = await supabase.from('teams').select('*').eq('id', params.id).single();
    if (!team) throw new ApiError(404, 'Not found');

    const { data: member } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', params.id)
      .eq('user_id', profileId)
      .single();

    if (member?.role !== 'admin') throw new ApiError(403, 'Forbidden');

    const body = await req.json();
    const parsed = teamUpdateSchema.parse(body);

    const updateData: Record<string, unknown> = {};
    if (parsed.name) updateData.name = parsed.name.trim();

    const { error } = await supabase
      .from('teams')
      .update(updateData as never)
      .eq('id', params.id);

    if (error) throw new ApiError(500, 'Failed to update');

    return NextResponse.json({
      id: team.id,
      name: updateData.name || team.name,
      ownerId: team.owner_id,
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new ApiError(401, 'Unauthorized');

    const supabase = createServiceClient();
    const profileId = await ensureProfile(session.user.email);

    const { data: team } = await supabase.from('teams').select('owner_id').eq('id', params.id).single();
    if (!team) throw new ApiError(404, 'Not found');
    if (team.owner_id !== profileId) throw new ApiError(403, 'Forbidden');

    await supabase.from('team_members').delete().eq('team_id', params.id);
    await supabase.from('teams').delete().eq('id', params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
