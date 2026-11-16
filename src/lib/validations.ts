import { z } from 'zod';

export const submissionSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  registration: z.string().min(3, 'Prontuário deve ter pelo menos 3 caracteres'),
  q1: z.string().min(10, 'Resposta muito curta. Explique com mais detalhes (mínimo 10 caracteres).'),
  q2: z.string().min(10, 'Resposta muito curta. Explique com mais detalhes (mínimo 10 caracteres).'),
  q3: z.string().min(10, 'Resposta muito curta. Explique com mais detalhes (mínimo 10 caracteres).'),
  q4: z.string().min(10, 'Resposta muito curta. Explique com mais detalhes (mínimo 10 caracteres).'),
});

export type SubmissionInput = z.infer<typeof submissionSchema>;

export const adminLoginSchema = z.object({
  password: z.string().min(1, 'Senha é obrigatória'),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;