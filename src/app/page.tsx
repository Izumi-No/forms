'use client';

import { useState } from 'react';
import { questions } from '@/lib/questions';
import { SubmissionInput } from '@/lib/validations';

export default function FormPage() {
  const [formData, setFormData] = useState<SubmissionInput>({
    fullName: '',
    registration: '',
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: '',
  });
  const [errors, setErrors] = useState<Partial<SubmissionInput>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validateField = (name: keyof SubmissionInput, value: string): string | undefined => {
    if (!value.trim()) return 'Este campo é obrigatório';
    if (name === 'fullName' && value.length < 2) return 'Nome deve ter pelo menos 2 caracteres';
    if (name === 'registration' && value.length < 3) return 'Prontuário deve ter pelo menos 3 caracteres';
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
        q5: '',
      });
    } catch (err) {
      setSubmitStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao enviar formulário');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            ATIVIDADE PRÁTICA
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Estudo de caso: Rede de Lojas Varejo Inteligente</h2>
          <div className="prose prose-sm max-w-none text-gray-700">
            <p>
              A <strong>Rede de Lojas Varejo Inteligente</strong> possui 45 lojas distribuídas em três estados. 
              A rede enfrenta um problema crônico de gestão de estoque: produtos de alta rotação (como itens 
              de higiene, bebidas geladas e pães) sofrem rupturas frequentes, levando à perda de vendas e 
              insatisfação do cliente. Por outro lado, itens de baixa rotação (eletroportáteis específicos, 
              artigos sazonais passados, embalagens diferenciadas) ocupam espaço nos depósitos e capital de 
              giro por meses, muitas vezes sendo vendidos com prejuízo em queimas de estoque.
            </p>
            <p>
              Atualmente, os pedidos de reposição são feitos manualmente pelos gerentes de loja com base 
              em "intuição" e planilhas simples, sem considerar histórico de vendas, sazonalidade, 
              lead time dos fornecedores ou classificação dos produtos por importância e volatilidade da demanda.
            </p>
            <p>
              Para solucionar esse cenário, a diretoria decidiu implantar um sistema de gestão de estoque 
              com reposição inteligente. O objetivo é <strong>reduzir rupturas de estoque em 80%</strong> 
              e <strong>diminuir o capital imobilizado em produtos de giro lento em 30%</strong> 
              nos próximos <strong>6 meses</strong>.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          {/* Identification */}
          <fieldset className="mb-8">
            <legend className="text-lg font-semibold text-gray-900 mb-4">Identificação</legend>
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

          {/* Questions */}
          <div className="space-y-8">
            {questions.map((question) => (
              <fieldset key={question.id} className="border-t border-gray-100 pt-6 first:border-t-0 first:pt-0">
                <legend className="text-base font-medium text-gray-900 mb-4">
                  {question.text}
                </legend>
                <div className="space-y-3">
                  {question.options.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData[question.id as keyof SubmissionInput] === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={option.value}
                        checked={formData[question.id as keyof SubmissionInput] === option.value}
                        onChange={(e) => handleChange(question.id as keyof SubmissionInput, e.target.value)}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      />
                      <span className="ml-3 text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
                {errors[question.id as keyof SubmissionInput] && (
                  <p className="mt-2 text-sm text-red-600">{errors[question.id as keyof SubmissionInput]}</p>
                )}
              </fieldset>
            ))}
          </div>

          {/* Submit Button */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            {submitStatus === 'success' && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                <p className="font-medium">Respostas enviadas com sucesso!</p>
                <p className="text-sm mt-1">Obrigado pela participação.</p>
              </div>
            )}
            {submitStatus === 'error' && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                <p className="font-medium">Erro ao enviar</p>
                <p className="text-sm mt-1">{errorMessage}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting || submitStatus === 'success'}
              className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Enviando...' : submitStatus === 'success' ? 'Enviado ✓' : 'Enviar Respostas'}
            </button>
          </div>
        </form>

        {/* Admin Link */}
        <div className="mt-8 text-center">
          <a
            href="/admin"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Área do Administrador →
          </a>
        </div>
      </div>
    </main>
  );
}