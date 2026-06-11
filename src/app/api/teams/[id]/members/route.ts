import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';
import { ensureProfile } from '@/lib/supabase/user';
import { handleError, ApiError } from '@/lib/api-utils';
import { memberAddSchema } from '@/lib/validations';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new ApiError(401, 'Unauthorized');

    const supabase = createServiceClient();
    const profileId = await ensureProfile(session.user.email);

    const { data: members } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', params.id);

    const isMember = members?.some((m) => m.user_id === profileId);
    if (!isMember) throw new ApiError(403, 'Forbidden');

    return NextResponse.json({
      items: (members || []).map((m) => ({
        userId: m.user_id,
        email: m.user_id,
        name: m.user_id,
        role: m.role,
        joinedAt: new Date(m.created_at).getTime(),
      })),
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
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
    const parsed = memberAddSchema.parse(body);

    const email = parsed.email.toLowerCase().trim();
    const newProfileId = await ensureProfile(email, parsed.name);

    const { data: existing } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', params.id)
      .eq('user_id', newProfileId)
      .single();

    if (existing) throw new ApiError(409, 'Already a member');

    const { error } = await supabase.from('team_members').insert({
      team_id: params.id,
      user_id: newProfileId,
      role: parsed.role,
    });

    if (error) throw new ApiError(500, 'Failed to add member');

    return NextResponse.json({
      userId: newProfileId,
      email,
      name: parsed.name || email,
      role: parsed.role,
      joinedAt: Date.now(),
    }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
