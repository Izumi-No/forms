import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminTokenFromCookies, verifyAdminToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = await getAdminTokenFromCookies();
    
    if (!token || !(await verifyAdminToken(token))) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' as const } },
            { registration: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.submission.count({ where }),
    ]);

    const stats = await prisma.submission.aggregate({
      _avg: { score: true },
      _count: true,
      _max: { score: true },
      _min: { score: true },
    });

    return NextResponse.json({
      submissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalSubmissions: stats._count,
        averageScore: Math.round((stats._avg.score || 0) * 100) / 100,
        maxScore: stats._max.score || 0,
        minScore: stats._min.score || 0,
      },
    });
  } catch (error) {
    console.error('Admin submissions error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}