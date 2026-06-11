import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { handleError, ApiError } from '@/lib/api-utils';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = createServiceClient();

    const { data: design } = await supabase
      .from('designs')
      .select('*')
      .eq('id', params.id)
      .single();

    if (!design) throw new ApiError(404, 'Template not found');

    const ls = design.layer_state as { layers?: unknown[]; rootIds?: string[] } | null;
    const meta = design.design_metadata as Record<string, unknown>;

    return NextResponse.json({
      id: design.id,
      name: design.name,
      category: (meta?.category as string) || 'General',
      width: (meta?.width as number) || 1920,
      height: (meta?.height as number) || 1080,
      thumbnail: (meta?.thumbnail as string) || '',
      layers: ls?.layers || [],
      rootIds: ls?.rootIds || [],
    });
  } catch (error) {
    return handleError(error);
  }
}
