import { NextResponse } from 'next/server';
import { getAdminTokenFromCookies, verifyAdminToken } from '@/lib/auth';

export async function GET() {
  const token = await getAdminTokenFromCookies();
  const isValid = token ? await verifyAdminToken(token) : false;
  
  return NextResponse.json({ authenticated: isValid });
}