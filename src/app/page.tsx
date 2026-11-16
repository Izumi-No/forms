'use client';

import { useState } from 'react';
import { questions, caseProblem } from '@/lib/questions';
import { SubmissionInput } from '@/lib/validations';

export default function FormPage() {
  const [formData, setFormData] = useState<SubmissionInput>({
    fullName: '',
    registration: '',
    q1: '',
    q2: '',
    q3: '',
    q4: '',
  });
  const [errors, setErrors] = useState<Partial<SubmissionInput>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validateField = (name: keyof SubmissionInput, value: string): string | undefined => {
    if (!value.trim()) return 'Este campo é obrigatório';
    if (name === 'fullName' && value.length < 2) return 'Nome deve ter pelo menos 2 caracteres';
    if (name === 'registration' && value.length < 3) return 'Prontuário deve ter pelo menos 3 caracteres';
    if (['q1', 'q2', 'q3', 'q4'].includes(name) && value.length < 10) return 'Resposta muito curta. Explique com mais detalhes (mínimo 10 caracteres).';
    return undefined;
  };

  const handleChange = (name: keyof SubmissionInput, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: Partial<SubmissionInput> = {};
    let hasErrors = false;
    
    (Object.keys(formData) as Array<keyof SubmissionInput>).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        hasErrors = true;
      }
    });
    
    setErrors(newErrors);
    if (hasErrors) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar');
      }

      setSubmitStatus('success');
      setFormData({
        fullName: '',
        registration: '',
        q1: '',
        q2: '',
        q3: '',
        q4: '',
      });
    } catch (err) {
      setSubmitStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao enviar formulário');
    } finally {
      setIsSubmitting(false);
    }
  };

  const charCount = (text: string) => text.length;

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            ATIVIDADE PRÁTICA AVALIATIVA
          </h1>
          <p className="text-lg text-gray-600">
            Planejamento Estratégico de Sistemas de Informação
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Metodologia: Problema → Objetivo → Informação → Sistema → Indicador
          </p>
        </div>

        {/* Case Study */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-mono">CASO</span>
            A Lojinha — Perde Vendas e Acumula Estoque
          </h2>
          <div className="prose prose-sm max-w-none text-gray-700 space-y-4">
            <p>
              A <strong>lojinha</strong> enfrenta um problema duplo: 
              <span className="text-red-600 font-medium">produtos antigos ocupam espaço e imobilizam dinheiro</span>, 
              enquanto <span className="text-red-600 font-medium">em épocas específicas, itens procurados acabam antes da reposição</span>.
            </p>
            <p>
              A decisão hoje é <span className="font-medium">baseada em percepção, não em histórico organizado</span>. 
              O desafio é transformar sinais dispersos em uma rotina de decisão.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mt-4">
              <p className="text-sm font-medium text-gray-900 mb-2">Problema identificado:</p>
              <p className="text-sm text-gray-700">{caseProblem.text}</p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
            Instruções
          </h3>
          <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
            <li>Responda às 4 estratégias abaixo com <strong>textos livres</strong> (não é múltipla escolha)</li>
            <li>Explique com suas palavras — mínimo 10 caracteres por resposta</li>
            <li>Use conceitos da metodologia: <em>problema, objetivo mensurável, informação, sistema, indicador</em></li>
            <li>A avaliação considera conceitos-chave esperados em cada resposta</li>
          </ul>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          {/* Identification */}
          <fieldset className="mb-8">
            <legend className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm font-mono">ID</span>
              Identificação
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.fullName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Digite seu nome completo"
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                )}
              </div>
              <div>
                <label htmlFor="registration" className="block text-sm font-medium text-gray-700 mb-1">
                  Prontuário <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="registration"
                  name="registration"
                  value={formData.registration}
                  onChange={(e) => handleChange('registration', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.registration ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Digite seu prontuário"
                />
                {errors.registration && (
                  <p className="mt-1 text-sm text-red-600">{errors.registration}</p>
                )}
              </div>
            </div>
          </fieldset>

          {/* Questions - Text Areas */}
          <div className="space-y-8">
            {questions.map((question) => (
              <fieldset key={question.id} className="border-t border-gray-100 pt-6 first:border-t-0 first:pt-0">
                <legend className="text-base font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-mono">
                    {question.label}
                  </span>
                  {question.text}
                </legend>
                
                <div className="space-y-2">
                  <textarea
                    name={question.id}
                    id={question.id}
                    value={formData[question.id as keyof SubmissionInput]}
                    onChange={(e) => handleChange(question.id as keyof SubmissionInput, e.target.value)}
                    rows={5}
                    placeholder={question.placeholder}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-sans text-sm ${
                      errors[question.id as keyof SubmissionInput] ? 'border-red-500' : 'border-gray-300'
                    } resize-y`}
                  />
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{charCount(formData[question.id as keyof SubmissionInput])} caracteres</span>
                    <span className={charCount(formData[question.id as keyof SubmissionInput]) >= 10 ? 'text-green-600' : 'text-gray-400'}>
                      Mínimo 10
                    </span>
                  </div>
                  
                  {errors[question.id as keyof SubmissionInput] && (
                    <p className="text-sm text-red-600">{errors[question.id as keyof SubmissionInput]}</p>
                  )}
                </div>
              </fieldset>
            ))}
          </div>

          {/* Submit Button */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            {submitStatus === 'success' && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                <div className="font-medium">Respostas enviadas com sucesso!</div>
                <div className="text-sm mt-1">Obrigado pela participação. Sua resposta será avaliada pelo professor.</div>
              </div>
            )}
            {submitStatus === 'error' && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                <div className="font-medium">Erro ao enviar</div>
                <div className="text-sm mt-1">{errorMessage}</div>
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting || submitStatus === 'success'}
              className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Enviando...' : submitStatus === 'success' ? 'Enviado ✓' : 'Enviar Respostas para Avaliação'}
            </button>
          </div>
        </form>

        {/* Admin Link */}
        <div className="mt-8 text-center">
          <a
            href="/admin"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium"
          >
            Área do Administrador / Professor →
          </a>
        </div>
      </div>
    </main>
  );
}