import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';
import { ensureProfile } from '@/lib/supabase/user';
import { handleError, ApiError } from '@/lib/api-utils';
import { designUpdateSchema } from '@/lib/validations';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new ApiError(401, 'Unauthorized');

    const supabase = createServiceClient();
    const profileId = await ensureProfile(session.user.email);

    const { data: design } = await supabase
      .from('designs').select('*').eq('id', params.id).single();

    if (!design) throw new ApiError(404, 'Not found');

    const isAuthor = design.author_id === profileId;
    let isTeamMember = false;
    if (design.team_id) {
      const { count } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', design.team_id)
        .eq('user_id', profileId);
      isTeamMember = (count ?? 0) > 0;
    }

    if (!isAuthor && !isTeamMember) throw new ApiError(403, 'Forbidden');

    const ls = design.layer_state as { layers?: unknown[]; rootIds?: string[] } | null;
    const meta = design.design_metadata as Record<string, unknown>;

    return NextResponse.json({
      id: design.id,
      name: design.name,
      width: (meta?.width as number) || 1920,
      height: (meta?.height as number) || 1080,
      layers: ls?.layers || [],
      rootIds: ls?.rootIds || [],
      teamId: design.team_id,
      metadata: { ...meta, updatedAt: new Date(design.updated_at).getTime() },
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new ApiError(401, 'Unauthorized');

    const supabase = createServiceClient();
    const profileId = await ensureProfile(session.user.email);

    const { data: existing } = await supabase
      .from('designs').select('*').eq('id', params.id).single();

    if (!existing) throw new ApiError(404, 'Not found');

    const isAuthor = existing.author_id === profileId;
    let canEdit = isAuthor;
    if (!canEdit && existing.team_id) {
      const { data: membership } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', existing.team_id)
        .eq('user_id', profileId)
        .single();
      canEdit = membership?.role === 'admin' || membership?.role === 'editor';
    }

    if (!canEdit) throw new ApiError(403, 'Forbidden');

    const body = await req.json();
    const parsed = designUpdateSchema.parse(body);

    const updateData: Record<string, unknown> = {
      name: parsed.name || existing.name,
      updated_at: new Date().toISOString(),
    };

    if (parsed.layers || parsed.layerState) {
      updateData.layer_state = {
        layers: parsed.layers || [],
        rootIds: parsed.rootIds || [],
      };
    }

    if (parsed.metadata) {
      updateData.design_metadata = {
        ...((existing.design_metadata || {}) as Record<string, unknown>),
        ...parsed.metadata,
        updatedAt: Date.now(),
      };
    }

    if (parsed.teamId !== undefined) updateData.team_id = parsed.teamId;

    const { error } = await supabase
      .from('designs')
      .update(updateData as never)
      .eq('id', params.id);

    if (error) throw new ApiError(500, 'Failed to update');

    return NextResponse.json(body);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new ApiError(401, 'Unauthorized');

    const supabase = createServiceClient();
    const profileId = await ensureProfile(session.user.email);

    const { data: existing } = await supabase
      .from('designs').select('author_id').eq('id', params.id).single();

    if (!existing) throw new ApiError(404, 'Not found');
    if (existing.author_id !== profileId) throw new ApiError(403, 'Forbidden');

    const { error } = await supabase.from('designs').delete().eq('id', params.id);
    if (error) throw new ApiError(500, 'Failed to delete');

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
