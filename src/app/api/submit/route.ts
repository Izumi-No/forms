import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { submissionSchema } from '@/lib/validations';
import { calculateScore } from '@/lib/questions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = submissionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = validation.data;
    const score = calculateScore({
      q1: data.q1,
      q2: data.q2,
      q3: data.q3,
      q4: data.q4,
    });

    // Check if registration already exists
    const existing = await prisma.submission.findUnique({
      where: { registration: data.registration },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Este prontuário já foi cadastrado' },
        { status: 409 }
      );
    }

    const submission = await prisma.submission.create({
      data: {
        fullName: data.fullName,
        registration: data.registration,
        q1: data.q1,
        q2: data.q2,
        q3: data.q3,
        q4: data.q4,
        score,
      },
    });

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      score,
      maxScore: 10,
      message: 'Respostas enviadas com sucesso!',
    });
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}