import { NextResponse } from 'next/server';
import { clearAdminTokenCookie } from '@/lib/auth';

export async function POST() {
  await clearAdminTokenCookie();
  return NextResponse.json({ success: true });
}