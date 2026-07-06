import { OpenAI } from 'openai';
import { MODELS, FALLBACK_CHAINS, getOptimalModel } from './models';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface RouterOptions {
  requestType?: string;
  contextLength?: number;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

interface ModelResponse {
  model: string;
  response: string;
  tokens?: number;
}

class AIRouter {
  private client: OpenAI;
  private availableModels: Set<string>;
  private modelUsage: Map<string, { attempts: number; successes: number; lastUsed: Date }>;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.KODE_API_KEY || 'KODE_API_KEY',
      baseURL: 'https://api.ai.kodekloud.com/v1',
    });

    // Initialize available models set
    this.availableModels = new Set(MODELS.map(m => m.id));
    this.modelUsage = new Map();
  }

  private detectRequestType(message: string): string {
    const lowerMessage = message.toLowerCase();

    // Interview detection
    if (lowerMessage.includes('interview') || lowerMessage.includes('mock') ||
        lowerMessage.includes('prepare') && lowerMessage.includes('job')) {
      return 'interview';
    }

    // API testing detection
    if (lowerMessage.includes('api') || lowerMessage.includes('rest') ||
        lowerMessage.includes('endpoint') || lowerMessage.includes('http')) {
      return 'api';
    }

    // Testing detection
    if (lowerMessage.includes('test') || lowerMessage.includes('automation') ||
        lowerMessage.includes('playwright') || lowerMessage.includes('selenium') ||
        lowerMessage.includes('cypress') || lowerMessage.includes('qa')) {
      return 'testing';
    }

    // Coding detection
    if (lowerMessage.includes('code') || lowerMessage.includes('function') ||
        lowerMessage.includes('class') || lowerMessage.includes('debug') ||
        lowerMessage.includes('implement')) {
      return 'coding';
    }

    // Teaching detection
    if (lowerMessage.includes('explain') || lowerMessage.includes('learn') ||
        lowerMessage.includes('teach') || lowerMessage.includes('how to') ||
        lowerMessage.includes('tutorial')) {
      return 'teaching';
    }

    // Reasoning detection
    if (lowerMessage.includes('analyze') || lowerMessage.includes('compare') ||
        lowerMessage.includes('evaluate') || lowerMessage.includes('why') ||
        lowerMessage.includes('reason')) {
      return 'reasoning';
    }

    // Fast chat detection
    if (lowerMessage.length < 100 && (lowerMessage.includes('hi') ||
        lowerMessage.includes('hello') || lowerMessage.includes('quick'))) {
      return 'fast';
    }

    return 'general';
  }

  private getFallbackChain(requestType: string): string[] {
    switch (requestType) {
      case 'reasoning': return FALLBACK_CHAINS.reasoning;
      case 'coding': return FALLBACK_CHAINS.coding;
      case 'testing': return FALLBACK_CHAINS.testing;
      case 'teaching': return FALLBACK_CHAINS.teaching;
      case 'fast': return FALLBACK_CHAINS.fast;
      case 'long': return FALLBACK_CHAINS.longContext;
      case 'multimodal': return FALLBACK_CHAINS.multimodal;
      case 'api': return FALLBACK_CHAINS.api;
      case 'interview': return FALLBACK_CHAINS.interview;
      default: return FALLBACK_CHAINS.primary;
    }
  }

  private updateModelStats(modelId: string, success: boolean) {
    const stats = this.modelUsage.get(modelId) || { attempts: 0, successes: 0, lastUsed: new Date() };
    stats.attempts++;
    if (success) stats.successes++;
    stats.lastUsed = new Date();
    this.modelUsage.set(modelId, stats);
  }

  private getSuccessRate(modelId: string): number {
    const stats = this.modelUsage.get(modelId);
    if (!stats || stats.attempts === 0) return 1;
    return stats.successes / stats.attempts;
  }

  async chat(
    messages: ChatMessage[],
    options: RouterOptions = {}
  ): Promise<ModelResponse> {
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
    const requestType = options.requestType || this.detectRequestType(lastUserMessage);
    const fallbackChain = this.getFallbackChain(requestType);

    // Filter chain by available models
    const availableChain = fallbackChain.filter(model => this.availableModels.has(model));

    let lastError: Error | null = null;

    for (const modelId of availableChain) {
      try {
        console.log(`Trying model: ${modelId} for request type: ${requestType}`);

        const response = await this.client.chat.completions.create({
          model: modelId,
          messages: messages as any,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 4096,
          stream: false,
        });

        const content = response.choices[0]?.message?.content || '';

        this.updateModelStats(modelId, true);

        return {
          model: modelId,
          response: content,
          tokens: response.usage?.total_tokens,
        };

      } catch (error: any) {
        console.error(`Model ${modelId} failed:`, error.message);
        this.updateModelStats(modelId, false);
        lastError = error;

        // Check for rate limit or token errors - continue to next model
        if (error.status === 429 || error.status === 413 ||
            error.message?.includes('rate') || error.message?.includes('token')) {
          continue;
        }

        // For other errors, try next model
        continue;
      }
    }

    // All models failed
    throw new Error(`All models failed. Last error: ${lastError?.message || 'Unknown error'}`);
  }

  async *streamChat(
    messages: ChatMessage[],
    options: RouterOptions = {}
  ): AsyncGenerator<{ content: string; model?: string; done?: boolean }, void, unknown> {
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
    const requestType = options.requestType || this.detectRequestType(lastUserMessage);
    const fallbackChain = this.getFallbackChain(requestType);
    const availableChain = fallbackChain.filter(model => this.availableModels.has(model));

    let lastError: Error | null = null;
    let selectedModel = '';

    for (const modelId of availableChain) {
      try {
        selectedModel = modelId;
        console.log(`Streaming with model: ${modelId}`);

        const stream = await this.client.chat.completions.create({
          model: modelId,
          messages: messages as any,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 4096,
          stream: true,
        });

        let firstChunk = true;
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            if (firstChunk) {
              yield { content, model: modelId };
              firstChunk = false;
            } else {
              yield { content };
            }
          }
        }

        this.updateModelStats(modelId, true);
        yield { content: '', done: true };
        return;

      } catch (error: any) {
        console.error(`Streaming model ${modelId} failed:`, error.message);
        this.updateModelStats(modelId, false);
        lastError = error;
        continue;
      }
    }

    throw new Error(`All streaming models failed. Last error: ${lastError?.message || 'Unknown error'}`);
  }

  getModelStats() {
    return Array.from(this.modelUsage.entries()).map(([modelId, stats]) => ({
      model: modelId,
      attempts: stats.attempts,
      successes: stats.successes,
      successRate: this.getSuccessRate(modelId),
      lastUsed: stats.lastUsed,
    }));
  }
}

export const aiRouter = new AIRouter();
export default aiRouter;