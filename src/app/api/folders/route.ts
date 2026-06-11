import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';
import { ensureProfile } from '@/lib/supabase/user';
import { handleError, ApiError } from '@/lib/api-utils';
import { folderCreateSchema } from '@/lib/validations';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email || 'anonymous';

    const supabase = createServiceClient();
    const profileId = await ensureProfile(userEmail);

    const { data: folders } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', profileId)
      .order('name');

    return NextResponse.json(folders || []);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new ApiError(401, 'Unauthorized');

    const body = await req.json();
    const parsed = folderCreateSchema.parse(body);

    const supabase = createServiceClient();
    const profileId = await ensureProfile(session.user.email);

    const folder = {
      id: crypto.randomUUID(),
      name: parsed.name,
      parent_id: parsed.parentId || null,
      user_id: profileId,
    };

    const { error } = await supabase.from('folders').insert(folder);
    if (error) throw new ApiError(500, 'Failed to create folder');

    return NextResponse.json({
      id: folder.id,
      name: folder.name,
      parentId: folder.parent_id,
      userId: session.user.email,
    }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
