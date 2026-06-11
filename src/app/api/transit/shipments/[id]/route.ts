import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';
import { ensureProfile } from '@/lib/supabase/user';
import { handleError, ApiError } from '@/lib/api-utils';
import { shipmentUpdateSchema } from '@/lib/validations';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new ApiError(401, 'Unauthorized');

    const supabase = createServiceClient();
    const { data: shipment } = await supabase
      .from('transit_shipments')
      .select('*, designs!inner(author_id, name, team_id, design_metadata)')
      .eq('id', params.id)
      .single();

    if (!shipment) throw new ApiError(404, 'Not found');

    const profileId = await ensureProfile(session.user.email);
    const design = shipment.designs as { author_id: string; name: string; team_id: string | null };
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
      id: shipment.id,
      designId: shipment.design_id,
      designName: design.name,
      carrierId: shipment.carrier_id,
      carrierName: shipment.carrier_name,
      trackingNumber: shipment.tracking_number,
      packageWeightKg: shipment.package_weight_kg,
      cargoStatus: shipment.cargo_status,
      currentEta: shipment.current_eta,
      origin: shipment.origin,
      destination: shipment.destination,
      notes: shipment.notes,
      createdAt: shipment.created_at,
      updatedAt: shipment.updated_at,
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

    const { data: shipment } = await supabase
      .from('transit_shipments')
      .select('*, designs!inner(author_id)')
      .eq('id', params.id)
      .single();

    if (!shipment) throw new ApiError(404, 'Not found');

    const design = shipment.designs as { author_id: string };
    if (design.author_id !== profileId) throw new ApiError(403, 'Forbidden');

    const body = await req.json();
    const parsed = shipmentUpdateSchema.parse(body);

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (parsed.carrierId) updateData.carrier_id = parsed.carrierId;
    if (parsed.carrierName) updateData.carrier_name = parsed.carrierName;
    if (parsed.trackingNumber !== undefined) updateData.tracking_number = parsed.trackingNumber;
    if (parsed.packageWeightKg !== undefined) updateData.package_weight_kg = parsed.packageWeightKg;
    if (parsed.cargoStatus) updateData.cargo_status = parsed.cargoStatus;
    if (parsed.currentEta !== undefined) updateData.current_eta = parsed.currentEta ? { eta: parsed.currentEta } : null;
    if (parsed.origin !== undefined) updateData.origin = parsed.origin;
    if (parsed.destination !== undefined) updateData.destination = parsed.destination;
    if (parsed.notes !== undefined) updateData.notes = parsed.notes;

    const { error } = await supabase
      .from('transit_shipments')
      .update(updateData as never)
      .eq('id', params.id);

    if (error) throw new ApiError(500, 'Failed to update shipment');

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

    const { data: shipment } = await supabase
      .from('transit_shipments')
      .select('*, designs!inner(author_id)')
      .eq('id', params.id)
      .single();

    if (!shipment) throw new ApiError(404, 'Not found');

    const design = shipment.designs as { author_id: string };
    if (design.author_id !== profileId) throw new ApiError(403, 'Forbidden');

    const { error } = await supabase.from('transit_shipments').delete().eq('id', params.id);
    if (error) throw new ApiError(500, 'Failed to delete shipment');

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
