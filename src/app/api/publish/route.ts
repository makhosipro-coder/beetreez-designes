import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';
import { Json } from '@/lib/supabase/types';
import { handleError, ApiError } from '@/lib/api-utils';
import { publishSchema } from '@/lib/validations';
import { v4 as uuid } from 'uuid';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new ApiError(401, 'Unauthorized');

    const body = await req.json();
    const parsed = publishSchema.parse(body);
    const designId = parsed.document.id as string;

    const publishId = uuid();
    const supabase = createServiceClient();

    const { error: publishError } = await supabase.from('published_snapshots').insert({
      id: publishId,
      design_id: designId,
      author_email: session.user.email,
      title: parsed.title || '',
      description: parsed.description || '',
      visibility: parsed.visibility || 'public',
      layer_state: parsed.layerState as Json,
    });

    if (publishError) throw new ApiError(500, 'Failed to publish');

    await supabase
      .from('designs')
      .update({ published_at: new Date().toISOString() })
      .eq('id', designId);

    return NextResponse.json({
      id: publishId,
      url: `/view/${publishId}`,
      publishedAt: new Date().toISOString(),
    }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new ApiError(401, 'Unauthorized');

    const supabase = createServiceClient();
    const { data: snapshots } = await supabase
      .from('published_snapshots')
      .select('id, design_id, title, description, visibility, created_at')
      .eq('author_email', session.user.email)
      .order('created_at', { ascending: false });

    return NextResponse.json(snapshots || []);
  } catch (error) {
    return handleError(error);
  }
}
