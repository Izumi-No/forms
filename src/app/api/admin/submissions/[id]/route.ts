import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminTokenFromCookies, verifyAdminToken } from '@/lib/auth';
import { getDetailedResults } from '@/lib/questions';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getAdminTokenFromCookies();
    
    if (!token || !(await verifyAdminToken(token))) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const submission = await prisma.submission.findUnique({
      where: { id },
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Submissão não encontrada' },
        { status: 404 }
      );
    }

    const results = getDetailedResults({
      q1: submission.q1,
      q2: submission.q2,
      q3: submission.q3,
      q4: submission.q4,
    });

    return NextResponse.json({
      submission: {
        ...submission,
        results,
      },
    });
  } catch (error) {
    console.error('Admin submission detail error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}