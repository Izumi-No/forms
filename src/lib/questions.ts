export interface Question {
  id: string;
  label: string;
  text: string;
  placeholder: string;
  // For admin evaluation - expected key concepts
  expectedConcepts: string[];
  maxScore: number;
}

export const questions: Question[] = [
  {
    id: 'q1',
    label: 'Estratégia 1',
    text: 'Escrevam um objetivo mensurável para resolver o problema da lojinha.',
    placeholder: 'Ex: Reduzir em 40% o valor de estoque parado (itens sem venda há 90+ dias) e zerar rupturas de itens sazonais nos próximos 6 meses, usando previsão baseada em histórico de vendas.',
    expectedConcepts: [
      'reduzir estoque parado',
      'ruptura',
      'saazonal',
      'mensurável',
      'prazo',
      'percentual',
      'previsão',
      'histórico',
    ],
    maxScore: 2,
  },
  {
    id: 'q2',
    label: 'Estratégia 2',
    text: 'Indiquem três informações necessárias para apoiar a decisão de compra/reposição.',
    placeholder: 'Ex: 1) Histórico de vendas diárias por SKU (quantidade, data); 2) Estoque atual por produto com data de entrada; 3) Lead time dos fornecedores e calendário sazonal de demanda.',
    expectedConcepts: [
      'vendas por produto',
      'histórico',
      'estoque atual',
      'lead time',
      'fornecedor',
      'sazonal',
      'data',
      'quantidade',
    ],
    maxScore: 2,
  },
  {
    id: 'q3',
    label: 'Estratégia 3',
    text: 'Proponham uma funcionalidade do sistema que resolva o problema.',
    placeholder: 'Ex: Módulo de reposição inteligente com alertas automáticos: classifica produtos em ABC/XYZ, calcula ponto de pedido baseado em consumo médio + lead time + margem de segurança, gera sugestão de pedido por fornecedor e alerta sobre itens sazonais com antecedência de 30 dias.',
    expectedConcepts: [
      'reposição',
      'alerta',
      'automático',
      'ABC',
      'XYZ',
      'ponto de pedido',
      'lead time',
      'margem de segurança',
      'sazonal',
      'fornecedor',
    ],
    maxScore: 3,
  },
  {
    id: 'q4',
    label: 'Estratégia 4',
    text: 'Definam um indicador e expliquem como lê-lo para saber se melhorou.',
    placeholder: 'Ex: Indicador: "Taxa de Ruptura Sazonal (%) = (SKUs sazonais com estoque zero / Total de SKUs sazonais ativos) × 100". Leitura: valor próximo de 0% indica que a reposição antecipada funcionou; valor alto indica falha na previsão ou no lead time. Acompanhar semanalmente no painel do sistema.',
    expectedConcepts: [
      'taxa de ruptura',
      'estoque parado',
      'giro',
      'percentual',
      'leitura',
      'painel',
      'acompanhamento',
      'semanal',
      'indicador',
    ],
    maxScore: 3,
  },
];

// The problem identification is part of the case study context
export const caseProblem = {
  text: 'A lojinha perde vendas e acumula estoque: produtos antigos ocupam espaço e imobilizam dinheiro; em épicas específicas, itens procurados acabam antes da reposição; a decisão hoje é baseada em percepção, não em histórico organizado.',
  expectedIdentification: [
    'perde vendas',
    'acumula estoque',
    'produtos antigos',
    'imobilizam dinheiro',
    'ruptura',
    'saazonal',
    'percepção',
    'histórico',
  ],
};

export function calculateScore(answers: Record<string, string>): number {
  let totalScore = 0;
  
  for (const question of questions) {
    const answer = answers[question.id]?.toLowerCase() || '';
    let matchedConcepts = 0;
    
    for (const concept of question.expectedConcepts) {
      if (answer.includes(concept.toLowerCase())) {
        matchedConcepts++;
      }
    }
    
    // Score based on how many expected concepts are mentioned
    const conceptRatio = matchedConcepts / question.expectedConcepts.length;
    let score = 0;
    
    if (conceptRatio >= 0.6) score = question.maxScore;
    else if (conceptRatio >= 0.4) score = Math.round(question.maxScore * 0.7);
    else if (conceptRatio >= 0.2) score = Math.round(question.maxScore * 0.4);
    else if (answer.length > 20) score = 1; // Some effort but missing concepts
    
    totalScore += score;
  }
  
  return totalScore;
}

export function getDetailedResults(answers: Record<string, string>) {
  return questions.map((q) => {
    const answer = answers[q.id]?.toLowerCase() || '';
    const matchedConcepts = q.expectedConcepts.filter((c) => 
      answer.includes(c.toLowerCase())
    );
    const missingConcepts = q.expectedConcepts.filter((c) => 
      !answer.includes(c.toLowerCase())
    );
    
    let score = 0;
    const conceptRatio = matchedConcepts.length / q.expectedConcepts.length;
    
    if (conceptRatio >= 0.6) score = q.maxScore;
    else if (conceptRatio >= 0.4) score = Math.round(q.maxScore * 0.7);
    else if (conceptRatio >= 0.2) score = Math.round(q.maxScore * 0.4);
    else if (answer.length > 20) score = 1;
    
    return {
      question: q.text,
      label: q.label,
      userAnswer: answers[q.id] || '',
      matchedConcepts,
      missingConcepts,
      score,
      maxScore: q.maxScore,
    };
  });
}