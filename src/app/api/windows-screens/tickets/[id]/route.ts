import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';
import { ensureProfile } from '@/lib/supabase/user';
import { handleError, ApiError } from '@/lib/api-utils';
import { ticketUpdateSchema } from '@/lib/validations';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new ApiError(401, 'Unauthorized');

    const supabase = createServiceClient();
    const { data: ticket } = await supabase
      .from('tickets_windows_screens')
      .select('*, designs!inner(author_id, name, team_id, design_metadata)')
      .eq('id', params.id)
      .single();

    if (!ticket) throw new ApiError(404, 'Not found');

    const profileId = await ensureProfile(session.user.email);
    const design = ticket.designs as { author_id: string; name: string; team_id: string | null };
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

    return NextResponse.json({
      id: ticket.id,
      designId: ticket.design_id,
      designName: design.name,
      serviceType: ticket.service_type,
      dimensionsMm: ticket.exact_dimensions_mm,
      materialType: ticket.material_type,
      assignedFabricatorId: ticket.assigned_fabricator_id,
      status: ticket.status,
      notes: ticket.notes,
      createdAt: ticket.created_at,
      updatedAt: ticket.updated_at,
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new ApiError(401, 'Unauthorized');

    const supabase = createServiceClient();
    const profileId = await ensureProfile(session.user.email);

    const { data: ticket } = await supabase
      .from('tickets_windows_screens')
      .select('*, designs!inner(author_id)')
      .eq('id', params.id)
      .single();

    if (!ticket) throw new ApiError(404, 'Not found');

    const design = ticket.designs as { author_id: string };
    if (design.author_id !== profileId) throw new ApiError(403, 'Forbidden');

    const body = await req.json();
    const parsed = ticketUpdateSchema.parse(body);

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (parsed.serviceType) updateData.service_type = parsed.serviceType;
    if (parsed.widthMm || parsed.heightMm || parsed.depthMm) {
      const current = ticket.exact_dimensions_mm as Record<string, number> || {};
      updateData.exact_dimensions_mm = {
        width: parsed.widthMm ?? current.width ?? 0,
        height: parsed.heightMm ?? current.height ?? 0,
        depth: parsed.depthMm ?? current.depth ?? 0,
      };
    }
    if (parsed.materialType) updateData.material_type = parsed.materialType;
    if (parsed.assignedFabricatorId !== undefined) updateData.assigned_fabricator_id = parsed.assignedFabricatorId;
    if (parsed.status) updateData.status = parsed.status;
    if (parsed.notes !== undefined) updateData.notes = parsed.notes;

    const { error } = await supabase
      .from('tickets_windows_screens')
      .update(updateData as never)
      .eq('id', params.id);

    if (error) throw new ApiError(500, 'Failed to update ticket');

    return NextResponse.json({ success: true });
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

    const { data: ticket } = await supabase
      .from('tickets_windows_screens')
      .select('*, designs!inner(author_id)')
      .eq('id', params.id)
      .single();

    if (!ticket) throw new ApiError(404, 'Not found');

    const design = ticket.designs as { author_id: string };
    if (design.author_id !== profileId) throw new ApiError(403, 'Forbidden');

    const { error } = await supabase.from('tickets_windows_screens').delete().eq('id', params.id);
    if (error) throw new ApiError(500, 'Failed to delete ticket');

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
