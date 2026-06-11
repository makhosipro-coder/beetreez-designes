import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { handleError, ApiError } from '@/lib/api-utils';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = createServiceClient();

    const { data: snapshot } = await supabase
      .from('published_snapshots')
      .select('*')
      .eq('id', params.id)
      .single();

    if (!snapshot) throw new ApiError(404, 'Not found');

    return NextResponse.json({
      id: snapshot.id,
      title: snapshot.title || 'Published Design',
      description: snapshot.description || '',
      visibility: snapshot.visibility || 'public',
      document: { id: snapshot.design_id, layers: [], rootIds: [] },
      layerState: snapshot.layer_state,
      authorId: snapshot.author_email,
      createdAt: new Date(snapshot.created_at).getTime(),
    });
  } catch (error) {
    return handleError(error);
  }
}
