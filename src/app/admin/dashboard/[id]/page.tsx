'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DetailResult {
  label: string;
  question: string;
  userAnswer: string;
  matchedConcepts: string[];
  missingConcepts: string[];
  score: number;
  maxScore: number;
}

interface SubmissionDetail {
  id: string;
  fullName: string;
  registration: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  score: number;
  createdAt: string;
  results: DetailResult[];
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

  const getScoreColor = (score: number, maxScore: number) => {
    const ratio = maxScore > 0 ? score / maxScore : 0;
    if (ratio >= 0.8) return 'bg-green-100 text-green-800 border-green-300';
    if (ratio >= 0.6) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
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
          <h2 className="text-lg font-semibold text-gray-900">Análise das Respostas</h2>
          
          {submission.results.map((result, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className={`p-4 border-b border-gray-200 flex items-center justify-between ${getScoreColor(result.score, result.maxScore).split(' ')[0] === 'bg-green-100' ? 'bg-green-50' : getScoreColor(result.score, result.maxScore).split(' ')[0] === 'bg-yellow-100' ? 'bg-yellow-50' : 'bg-red-50'}`}>
                <div className="flex items-center space-x-3">
                  <h3 className="font-medium text-gray-900">{result.label}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getScoreColor(result.score, result.maxScore)}`}>
                    {result.score}/{result.maxScore}
                  </span>
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">{result.question}</p>
                </div>
                
                {/* Student Answer */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Resposta do Aluno
                  </p>
                  <p className="text-gray-900 whitespace-pre-wrap">{result.userAnswer || '(vazio)'}</p>
                </div>
                
                {/* Concept Analysis */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border border-green-300 bg-green-50">
                    <p className="text-xs font-medium text-green-800 uppercase tracking-wider mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                      Conceitos Identificados ({result.matchedConcepts.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.matchedConcepts.length > 0 ? (
                        result.matchedConcepts.map((concept, i) => (
                          <span key={i} className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full border border-green-200">
                            {concept}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">Nenhum conceito-chave identificado</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg border border-amber-300 bg-amber-50">
                    <p className="text-xs font-medium text-amber-800 uppercase tracking-wider mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                      Conceitos Ausentes ({result.missingConcepts.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.missingConcepts.length > 0 ? (
                        result.missingConcepts.map((concept, i) => (
                          <span key={i} className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                            {concept}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">Todos conceitos-chave foram abordados!</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Score Explanation */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs font-medium text-blue-800 uppercase tracking-wider mb-2">
                    Avaliação
                  </p>
                  <p className="text-sm text-blue-900">
                    {result.score === result.maxScore 
                      ? 'Resposta completa, abordou os principais conceitos esperados.'
                      : result.score >= result.maxScore * 0.6
                        ? 'Resposta boa, mas poderia detalhar mais alguns conceitos.'
                        : result.score > 0
                          ? 'Resposta parcial, faltam conceitos fundamentais da metodologia.'
                          : 'Resposta insuficiente, não abordou os conceitos-chave da questão.'
                    }
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {/* Summary */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Resumo da Avaliação</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-2xl font-bold text-gray-900">{submission.score}</p>
                <p className="text-sm text-gray-500">Pontuação Total</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-2xl font-bold text-gray-900">10</p>
                <p className="text-sm text-gray-500">Pontuação Máxima</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round((submission.score / 10) * 100)}%
                </p>
                <p className="text-sm text-gray-500">Aproveitamento</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-2xl font-bold text-gray-900">
                  {submission.results.filter(r => r.score >= r.maxScore * 0.8).length}/4
                </p>
                <p className="text-sm text-gray-500">Questões Completas</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}