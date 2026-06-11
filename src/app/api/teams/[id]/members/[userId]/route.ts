import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';
import { ensureProfile } from '@/lib/supabase/user';
import { handleError, ApiError } from '@/lib/api-utils';
import { memberUpdateSchema } from '@/lib/validations';

export async function DELETE(_req: Request, { params }: { params: { id: string; userId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new ApiError(401, 'Unauthorized');

    const supabase = createServiceClient();
    const profileId = await ensureProfile(session.user.email);

    const { data: adminMember } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', params.id)
      .eq('user_id', profileId)
      .single();

    if (adminMember?.role !== 'admin') throw new ApiError(403, 'Forbidden');

    const { data: team } = await supabase.from('teams').select('owner_id').eq('id', params.id).single();
    if (!team) throw new ApiError(404, 'Not found');
    if (team.owner_id === params.userId) throw new ApiError(400, 'Cannot remove owner');

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', params.id)
      .eq('user_id', params.userId);

    if (error) throw new ApiError(500, 'Failed to remove member');

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string; userId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new ApiError(401, 'Unauthorized');

    const supabase = createServiceClient();
    const profileId = await ensureProfile(session.user.email);

    const { data: adminMember } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', params.id)
      .eq('user_id', profileId)
      .single();

    if (adminMember?.role !== 'admin') throw new ApiError(403, 'Forbidden');

    const body = await req.json();
    const parsed = memberUpdateSchema.parse(body);

    const { data: existing } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', params.id)
      .eq('user_id', params.userId)
      .single();

    if (!existing) throw new ApiError(404, 'Member not found');

    const { error } = await supabase
      .from('team_members')
      .update({ role: parsed.role })
      .eq('team_id', params.id)
      .eq('user_id', params.userId);

    if (error) throw new ApiError(500, 'Failed to update role');

    return NextResponse.json({
      userId: existing.user_id,
      email: existing.user_id,
      role: parsed.role,
      joinedAt: new Date(existing.created_at).getTime(),
    });
  } catch (error) {
    return handleError(error);
  }
}
