import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';
import { ensureProfile } from '@/lib/supabase/user';
import { handleError, ApiError } from '@/lib/api-utils';
import { teamCreateSchema } from '@/lib/validations';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new ApiError(401, 'Unauthorized');

    const supabase = createServiceClient();
    const profileId = await ensureProfile(session.user.email);

    const { data: memberships } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', profileId);

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({ items: [] });
    }

    const teamIds = memberships.map((m) => m.team_id);
    const { data: teams } = await supabase
      .from('teams')
      .select('*')
      .in('id', teamIds);

    const result = await Promise.all(
      (teams || []).map(async (team) => {
        const { data: members } = await supabase
          .from('team_members')
          .select('*')
          .eq('team_id', team.id);
        return {
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
        };
      }),
    );

    return NextResponse.json({ items: result });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new ApiError(401, 'Unauthorized');

    const body = await req.json();
    const parsed = teamCreateSchema.parse(body);

    const supabase = createServiceClient();
    const profileId = await ensureProfile(session.user.email, session.user.name);

    const teamId = crypto.randomUUID();
    const now = new Date().toISOString();

    const { error: teamError } = await supabase.from('teams').insert({
      id: teamId,
      name: parsed.name.trim(),
      owner_id: profileId,
    });

    if (teamError) throw new ApiError(500, 'Failed to create team');

    const { error: memberError } = await supabase.from('team_members').insert({
      team_id: teamId,
      user_id: profileId,
      role: 'admin',
    });

    if (memberError) {
      await supabase.from('teams').delete().eq('id', teamId);
      throw new ApiError(500, 'Failed to create team');
    }

    return NextResponse.json({
      id: teamId,
      name: parsed.name.trim(),
      ownerId: profileId,
      members: [{
        userId: profileId,
        email: session.user.email,
        name: session.user.name || session.user.email,
        role: 'admin',
        joinedAt: Date.now(),
      }],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
