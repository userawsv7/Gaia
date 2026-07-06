export interface AIModel {
  id: string;
  name: string;
  category: string[];
  strengths: string[];
  contextLength: number;
  speed: 'fast' | 'medium' | 'slow';
  cost: 'low' | 'medium' | 'high';
}

export const MODELS: AIModel[] = [
  // Groq Models - Llama 3.3 70B as main coach
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', category: ['Coding', 'Reasoning', 'Teaching'], strengths: ['Code generation', 'Complex reasoning', 'Explanations'], contextLength: 128000, speed: 'medium', cost: 'low' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', category: ['Fast Chat', 'General'], strengths: ['Quick responses', 'Speed'], contextLength: 128000, speed: 'fast', cost: 'low' },
  { id: 'gemma2-9b-it', name: 'Gemma 2 9B', category: ['Fast Chat', 'General'], strengths: ['Quick responses', 'Conversational'], contextLength: 8192, speed: 'fast', cost: 'low' },
];

export const MODEL_CATEGORIES = [
  'Reasoning', 'Coding', 'Teaching', 'Long Context', 'Fast Chat',
  'Multimodal', 'Summarization', 'General', 'Testing'
] as const;

export type ModelCategory = typeof MODEL_CATEGORIES[number];

// Fallback chain for different scenarios - using available Groq models
export const FALLBACK_CHAINS = {
  primary: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'gemma2-9b-it'],
  reasoning: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'],
  coding: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'],
  testing: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'],
  teaching: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'],
  fast: ['llama-3.1-8b-instant', 'gemma2-9b-it'],
  longContext: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'],
  multimodal: ['llama-3.3-70b-versatile'],
  api: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'],
  interview: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'],
};

// Model ranking by category
export function getModelsByCategory(category: string): AIModel[] {
  return MODELS.filter(model => model.category.includes(category))
    .sort((a, b) => {
      const speedRank = { fast: 3, medium: 2, slow: 1 };
      const costRank = { low: 3, medium: 2, high: 1 };
      return (speedRank[b.speed] + costRank[b.cost]) - (speedRank[a.speed] + costRank[a.cost]);
    });
}

// Get optimal model for request type
export function getOptimalModel(requestType: string, contextLength?: number): string {
  let chain = FALLBACK_CHAINS.primary;

  switch (requestType) {
    case 'reasoning':
      chain = FALLBACK_CHAINS.reasoning;
      break;
    case 'coding':
      chain = FALLBACK_CHAINS.coding;
      break;
    case 'testing':
      chain = FALLBACK_CHAINS.testing;
      break;
    case 'teaching':
      chain = FALLBACK_CHAINS.teaching;
      break;
    case 'fast':
      chain = FALLBACK_CHAINS.fast;
      break;
    case 'long':
      chain = FALLBACK_CHAINS.longContext;
      break;
    case 'multimodal':
      chain = FALLBACK_CHAINS.multimodal;
      break;
    case 'api':
      chain = FALLBACK_CHAINS.api;
      break;
    case 'interview':
      chain = FALLBACK_CHAINS.interview;
      break;
  }

  // Filter by context length if provided
  if (contextLength) {
    const suitableModels = chain.filter(modelId => {
      const model = MODELS.find(m => m.id === modelId);
      return model && model.contextLength >= contextLength;
    });
    return suitableModels[0] || chain[0];
  }

  return chain[0];
}