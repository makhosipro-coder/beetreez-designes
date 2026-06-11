import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const token = crypto.randomUUID();
  const cookieStore = cookies();
  cookieStore.set('csrf-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
  return NextResponse.json({ token });
}
