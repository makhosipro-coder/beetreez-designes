import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';
import { ensureProfile } from '@/lib/supabase/user';
import { Json } from '@/lib/supabase/types';
import { handleError, ApiError } from '@/lib/api-utils';
import { designCreateSchema } from '@/lib/validations';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    if (!userEmail) return NextResponse.json([]);

    const supabase = createServiceClient();
    const profileId = await ensureProfile(userEmail);

    const { data: memberships } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', profileId);

    const teamIds = (memberships || []).map((m) => m.team_id);

    const query = supabase
      .from('designs')
      .select('id, name, thumbnail, design_metadata, updated_at, author_id')
      .or(`author_id.eq.${profileId}${teamIds.length ? `,team_id.in.(${teamIds.join(',')})` : ''}`);

    const { data: designs } = await query.order('updated_at', { ascending: false });

    return NextResponse.json(
      (designs || []).map((d) => ({
        id: d.id,
        name: d.name,
        thumbnail: d.thumbnail || '',
        updatedAt: new Date(d.updated_at).getTime(),
      })),
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new ApiError(401, 'Unauthorized');

    const supabase = createServiceClient();
    const profileId = await ensureProfile(session.user.email, session.user.name);

    const body = await req.json();
    const parsed = designCreateSchema.parse(body);

    const insertData = {
      id: parsed.id,
      author_id: profileId,
      name: parsed.name,
      layer_state: (parsed.layerState || (parsed.layers ? { layers: parsed.layers, rootIds: parsed.rootIds || [] } : {})) as Json,
      design_metadata: {
        width: parsed.width || 1920,
        height: parsed.height || 1080,
        ...(parsed.metadata || {}),
        authorId: session.user.email,
      } as Json,
      team_id: parsed.teamId || null,
    };

    const { error } = await supabase.from('designs').insert(insertData);
    if (error) throw new ApiError(500, 'Failed to save design');

    return NextResponse.json(body, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
