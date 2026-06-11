import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/api-utils';

export async function GET() {
  try {
    const supabase = createServiceClient();

    const { data: templates } = await supabase
      .from('designs')
      .select('id, name, design_metadata', { count: 'exact' })
      .eq('author_id', '__system__');

    return NextResponse.json(
      (templates || []).map((t) => {
        const meta = t.design_metadata as Record<string, unknown>;
        return {
          id: t.id,
          name: t.name,
          category: (meta?.category as string) || 'General',
          thumbnail: '',
          width: (meta?.width as number) || 1920,
          height: (meta?.height as number) || 1080,
        };
      }),
    );
  } catch (error) {
    return handleError(error);
  }
}
