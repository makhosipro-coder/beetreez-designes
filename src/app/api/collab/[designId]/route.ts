import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { updateCursor, removeCursor, getCursors, addListener } from '@/lib/cursor-store';
import type { CursorPosition } from '@/lib/collab-types';

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];

function getColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i);
    hash |= 0;
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

export async function GET(
  req: Request,
  { params }: { params: { designId: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const send = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      send(JSON.stringify({ type: 'cursors', cursors: getCursors(params.designId) }));

      const remove = addListener(params.designId, (cursors) => {
        send(JSON.stringify({ type: 'cursors', cursors }));
      });

      req.signal.addEventListener('abort', () => {
        removeCursor(params.designId, session.user!.email!);
        remove();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

export async function POST(
  req: Request,
  { params }: { params: { designId: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { x, y } = await req.json();
  if (typeof x !== 'number' || typeof y !== 'number') {
    return NextResponse.json({ error: 'x and y required' }, { status: 400 });
  }

  const cursor: CursorPosition = {
    userId: session.user.email,
    name: session.user.name || session.user.email,
    color: getColor(session.user.email),
    x,
    y,
    updatedAt: Date.now(),
  };

  updateCursor(params.designId, cursor);
  return NextResponse.json({ success: true });
}
