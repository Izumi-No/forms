'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { questions } from '@/lib/questions';

interface ResultItem {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

interface SubmissionDetail {
  id: string;
  fullName: string;
  registration: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
  score: number;
  createdAt: string;
  results: ResultItem[];
}

export default function SubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await fetch(`/api/admin/submissions/${params.id}`);
        
        if (response.status === 401) {
          router.push(`/admin/login?callbackUrl=/admin/dashboard/${params.id}`);
          return;
        }

        if (!response.ok) {
          throw new Error('Submissão não encontrada');
        }

        const data = await response.json();
        setSubmission(data.submission);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar detalhes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [params.id, router]);

  const getOptionLabel = (questionId: string, value: string) => {
    const question = questions.find((q) => q.id === questionId);
    return question?.options.find((o) => o.value === value)?.label || value;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro</h1>
          <p className="text-gray-600 mb-6">{error || 'Submissão não encontrada'}</p>
          <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-800">
            ← Voltar ao painel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/dashboard"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Voltar
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Detalhes da Resposta</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                submission.score >= 8 ? 'bg-green-100 text-green-800' :
                submission.score >= 6 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {submission.score}/10
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações do Aluno</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Nome</p>
              <p className="text-gray-900 font-medium">{submission.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Prontuário</p>
              <p className="text-gray-900 font-medium">{submission.registration}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Data de Envio</p>
              <p className="text-gray-900 font-medium">
                {format(new Date(submission.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </p>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Respostas</h2>
          
          {submission.results.map((result, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className={`p-4 border-b border-gray-200 flex items-center justify-between ${
                result.isCorrect ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <h3 className="font-medium text-gray-900">Questão {index + 1}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  result.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {result.isCorrect ? 'Correta' : 'Incorreta'}
                </span>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">{result.question}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg border ${
                    result.isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                  }`}>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      Resposta do Aluno
                    </p>
                    <p className="text-gray-900">
                      {getOptionLabel(questions[index]?.id || '', result.userAnswer)}
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg border border-green-300 bg-green-50">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      Resposta Correta
                    </p>
                    <p className="text-gray-900">
                      {getOptionLabel(questions[index]?.id || '', result.correctAnswer)}
                    </p>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Explicação
                  </p>
                  <p className="text-sm text-gray-700">{result.explanation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}