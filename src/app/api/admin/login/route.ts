import { NextRequest, NextResponse } from 'next/server';
import { adminLoginSchema } from '@/lib/validations';
import { verifyAdminPassword, createAdminToken, setAdminTokenCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = adminLoginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Senha é obrigatória' },
        { status: 400 }
      );
    }

    const { password } = validation.data;
    const isValid = await verifyAdminPassword(password);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Senha incorreta' },
        { status: 401 }
      );
    }

    const token = await createAdminToken();
    await setAdminTokenCookie(token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}