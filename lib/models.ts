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
  // Reasoning Models
  { id: 'gpt-5.5', name: 'GPT-5.5', category: ['Reasoning', 'General'], strengths: ['Complex reasoning', 'Analysis'], contextLength: 128000, speed: 'medium', cost: 'high' },
  { id: 'claude-opus-4.8', name: 'Claude Opus 4.8', category: ['Reasoning', 'Coding'], strengths: ['Deep reasoning', 'Complex problem solving'], contextLength: 200000, speed: 'slow', cost: 'high' },
  { id: 'claude-opus-4.7', name: 'Claude Opus 4.7', category: ['Reasoning', 'Coding'], strengths: ['Deep reasoning', 'Architecture'], contextLength: 200000, speed: 'slow', cost: 'high' },

  // Coding Models
  { id: 'claude-opus-4.6', name: 'Claude Opus 4.6', category: ['Coding', 'Reasoning'], strengths: ['Code generation', 'Debugging'], contextLength: 200000, speed: 'medium', cost: 'high' },
  { id: 'gpt-5.4', name: 'GPT-5.4', category: ['Coding', 'General'], strengths: ['Code generation', 'Technical explanations'], contextLength: 128000, speed: 'medium', cost: 'medium' },

  // Teaching Models
  { id: 'claude-sonnet-5', name: 'Claude Sonnet 5', category: ['Teaching', 'General'], strengths: ['Explanations', 'Structured learning'], contextLength: 200000, speed: 'medium', cost: 'medium' },
  { id: 'claude-sonnet-4.6', name: 'Claude Sonnet 4.6', category: ['Teaching', 'Coding'], strengths: ['Clear explanations', 'Step-by-step guidance'], contextLength: 200000, speed: 'medium', cost: 'medium' },

  // Fast Chat Models
  { id: 'claude-haiku-4.5', name: 'Claude Haiku 4.5', category: ['Fast Chat', 'General'], strengths: ['Quick responses', 'Conversational'], contextLength: 200000, speed: 'fast', cost: 'low' },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', category: ['Fast Chat', 'General'], strengths: ['Speed', 'Efficiency'], contextLength: 1000000, speed: 'fast', cost: 'low' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', category: ['Fast Chat', 'General'], strengths: ['Ultra-fast', 'Simple queries'], contextLength: 1000000, speed: 'fast', cost: 'low' },

  // Long Context Models
  { id: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro', category: ['Long Context', 'Multimodal'], strengths: ['Long documents', 'Large context'], contextLength: 2000000, speed: 'medium', cost: 'medium' },
  { id: 'gpt-5.4-mini', name: 'GPT-5.4 Mini', category: ['Long Context', 'General'], strengths: ['Long conversations', 'Context retention'], contextLength: 128000, speed: 'fast', cost: 'low' },

  // Multimodal Models
  { id: 'gemini-3-flash', name: 'Gemini 3 Flash', category: ['Multimodal', 'Fast Chat'], strengths: ['Vision', 'Multimodal'], contextLength: 1000000, speed: 'fast', cost: 'low' },
  { id: 'mimo-v2.5-pro', name: 'MiMo-V2.5 Pro', category: ['Multimodal', 'Coding'], strengths: ['Vision', 'Code with visuals'], contextLength: 128000, speed: 'medium', cost: 'medium' },

  // Summarization Models
  { id: 'grok-4.3', name: 'Grok 4.3', category: ['Summarization', 'General'], strengths: ['Concise summaries', 'Key points'], contextLength: 128000, speed: 'medium', cost: 'medium' },
  { id: 'deepseek-v4-pro', name: 'DeepSeek V4 Pro', category: ['Summarization', 'Coding'], strengths: ['Technical summaries', 'Code analysis'], contextLength: 128000, speed: 'medium', cost: 'medium' },

  // API Testing Models
  { id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash', category: ['Fast Chat', 'Coding'], strengths: ['API testing', 'Quick code'], contextLength: 128000, speed: 'fast', cost: 'low' },
  { id: 'deepseek-v3.2', name: 'DeepSeek V3.2', category: ['Coding', 'Testing'], strengths: ['API tests', 'Test automation'], contextLength: 128000, speed: 'medium', cost: 'low' },

  // Interview Prep Models
  { id: 'kimi-k2.5', name: 'Kimi K2.5', category: ['Teaching', 'General'], strengths: ['Interview prep', 'Q&A format'], contextLength: 200000, speed: 'medium', cost: 'medium' },
  { id: 'minimax-m3', name: 'MiniMax M3', category: ['Teaching', 'General'], strengths: ['Mock interviews', 'Feedback'], contextLength: 100000, speed: 'medium', cost: 'medium' },

  // Specialized Testing Models
  { id: 'minimax-m2.5', name: 'MiniMax M2.5', category: ['Testing', 'Fast Chat'], strengths: ['Quick testing tips', 'Bug hunting'], contextLength: 100000, speed: 'fast', cost: 'low' },
  { id: 'mimo-v2.5', name: 'MiMo-V2.5', category: ['Multimodal', 'Testing'], strengths: ['UI testing', 'Visual bugs'], contextLength: 128000, speed: 'medium', cost: 'low' },
  { id: 'glm-5.1', name: 'GLM-5.1', category: ['General', 'Coding'], strengths: ['Framework design', 'Architecture'], contextLength: 128000, speed: 'medium', cost: 'medium' },
];

export const MODEL_CATEGORIES = [
  'Reasoning', 'Coding', 'Teaching', 'Long Context', 'Fast Chat',
  'Multimodal', 'Summarization', 'General', 'Testing'
] as const;

export type ModelCategory = typeof MODEL_CATEGORIES[number];

// Fallback chain for different scenarios
export const FALLBACK_CHAINS = {
  primary: ['gpt-5.5', 'claude-opus-4.8', 'claude-sonnet-5', 'gemini-3.1-pro'],
  reasoning: ['claude-opus-4.8', 'gpt-5.5', 'claude-opus-4.7', 'gemini-3.1-pro'],
  coding: ['claude-opus-4.6', 'gpt-5.4', 'claude-sonnet-5', 'deepseek-v4-pro'],
  testing: ['claude-sonnet-5', 'gpt-5.4', 'deepseek-v3.2', 'claude-haiku-4.5'],
  teaching: ['claude-sonnet-5', 'claude-sonnet-4.6', 'kimi-k2.5', 'minimax-m3'],
  fast: ['claude-haiku-4.5', 'gemini-3.5-flash', 'deepseek-v4-flash', 'minimax-m2.5'],
  longContext: ['gemini-3.1-pro', 'gemini-3-flash', 'claude-opus-4.8', 'gpt-5.5'],
  multimodal: ['gemini-3-flash', 'mimo-v2.5-pro', 'gemini-3.1-pro', 'mimo-v2.5'],
  api: ['deepseek-v3.2', 'claude-sonnet-5', 'gpt-5.4', 'deepseek-v4-flash'],
  interview: ['kimi-k2.5', 'minimax-m3', 'claude-sonnet-5', 'claude-haiku-4.5'],
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