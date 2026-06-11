import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';
import { handleError, ApiError } from '@/lib/api-utils';
import { folderUpdateSchema } from '@/lib/validations';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new ApiError(401, 'Unauthorized');

    const body = await req.json();
    const parsed = folderUpdateSchema.parse(body);

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('folders')
      .update({ name: parsed.name })
      .eq('id', params.id)
      .select()
      .single();

    if (error || !data) throw new ApiError(404, 'Folder not found');

    return NextResponse.json({
      id: data.id,
      name: data.name,
      parentId: data.parent_id,
      userId: data.user_id,
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new ApiError(401, 'Unauthorized');

    const supabase = createServiceClient();
    const { error } = await supabase.from('folders').delete().eq('id', params.id);

    if (error) throw new ApiError(404, 'Not found');

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
