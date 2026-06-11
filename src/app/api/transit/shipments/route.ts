import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';
import { ensureProfile } from '@/lib/supabase/user';
import { handleError, ApiError } from '@/lib/api-utils';
import { shipmentCreateSchema } from '@/lib/validations';

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
      .from('transit_shipments')
      .select('*, designs!inner(author_id, name, team_id, design_metadata)')
      .or(`designs.author_id.eq.${profileId}${teamIds.length ? `,designs.team_id.in.(${teamIds.join(',')})` : ''}`);

    const { data: shipments } = await query.order('created_at', { ascending: false });

    return NextResponse.json((shipments || []).map((s) => ({
      id: s.id,
      designId: s.design_id,
      designName: (s.designs as Record<string, unknown>).name,
      carrierId: s.carrier_id,
      carrierName: s.carrier_name,
      trackingNumber: s.tracking_number,
      packageWeightKg: s.package_weight_kg,
      cargoStatus: s.cargo_status,
      currentEta: s.current_eta,
      origin: s.origin,
      destination: s.destination,
      notes: s.notes,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
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
    const parsed = shipmentCreateSchema.parse(body);

    const { data: design } = await supabase
      .from('designs')
      .select('id')
      .eq('id', parsed.designId)
      .single();

    if (!design) throw new ApiError(404, 'Design not found');

    const id = crypto.randomUUID();
    const { error } = await supabase.from('transit_shipments').insert({
      id,
      design_id: parsed.designId,
      carrier_id: parsed.carrierId,
      carrier_name: parsed.carrierName,
      tracking_number: parsed.trackingNumber || null,
      package_weight_kg: parsed.packageWeightKg,
      cargo_status: 'manifested',
      origin: parsed.origin || null,
      destination: parsed.destination || null,
      notes: parsed.notes || null,
    });

    if (error) throw new ApiError(500, 'Failed to create shipment');

    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
