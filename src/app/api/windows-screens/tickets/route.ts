import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';
import { ensureProfile } from '@/lib/supabase/user';
import { handleError, ApiError } from '@/lib/api-utils';
import { ticketCreateSchema } from '@/lib/validations';

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
      .from('tickets_windows_screens')
      .select('*, designs!inner(author_id, name, team_id, design_metadata)')
      .or(`designs.author_id.eq.${profileId}${teamIds.length ? `,designs.team_id.in.(${teamIds.join(',')})` : ''}`);

    const { data: tickets } = await query.order('created_at', { ascending: false });

    return NextResponse.json((tickets || []).map((t) => ({
      id: t.id,
      designId: t.design_id,
      designName: (t.designs as Record<string, unknown>).name,
      serviceType: t.service_type,
      dimensionsMm: t.exact_dimensions_mm,
      materialType: t.material_type,
      assignedFabricatorId: t.assigned_fabricator_id,
      status: t.status,
      notes: t.notes,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    })));
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new ApiError(401, 'Unauthorized');

    const supabase = createServiceClient();
    await ensureProfile(session.user.email, session.user.name);

    const body = await req.json();
    const parsed = ticketCreateSchema.parse(body);

    const { data: design } = await supabase
      .from('designs')
      .select('id')
      .eq('id', parsed.designId)
      .single();

    if (!design) throw new ApiError(404, 'Design not found');

    const id = crypto.randomUUID();
    const { error } = await supabase.from('tickets_windows_screens').insert({
      id,
      design_id: parsed.designId,
      service_type: parsed.serviceType,
      exact_dimensions_mm: { width: parsed.widthMm, height: parsed.heightMm, depth: parsed.depthMm },
      material_type: parsed.materialType,
      assigned_fabricator_id: parsed.assignedFabricatorId || null,
      status: 'draft',
      notes: parsed.notes || null,
    });

    if (error) throw new ApiError(500, 'Failed to create ticket');

    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
