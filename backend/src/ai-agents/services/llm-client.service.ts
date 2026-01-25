import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

@Injectable()
export class LLMClientService {
  private provider: string;
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(private configService: ConfigService) {
    this.provider = this.configService.get('LLM_PROVIDER', 'openai');
    this.apiKey =
      this.provider === 'openai'
        ? this.getRequiredConfig('OPENAI_API_KEY')
        : this.getRequiredConfig('ANTHROPIC_API_KEY');
    this.baseUrl = this.configService.get('OPENAI_BASE_URL', 'https://api.openai.com/v1');
    this.model = this.configService.get('OPENAI_MODEL', 'gpt-4-turbo-preview');
  }

  private getRequiredConfig(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new Error(`Missing required configuration: ${key}`);
    }
    return value;
  }

  async generateCompletion(
    messages: LLMMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      responseFormat?: 'text' | 'json';
    },
  ): Promise<LLMResponse> {
    const temperature = options?.temperature ?? 0.7;
    const maxTokens = options?.maxTokens ?? 2000;
    const responseFormat = options?.responseFormat ?? 'text';

    if (this.provider === 'openai') {
      return this.callOpenAI(messages, temperature, maxTokens, responseFormat);
    } else if (this.provider === 'anthropic') {
      return this.callAnthropic(messages, temperature, maxTokens);
    }

    throw new Error(`Unsupported LLM provider: ${this.provider}`);
  }

  private async callOpenAI(
    messages: LLMMessage[],
    temperature: number,
    maxTokens: number,
    responseFormat: string,
  ): Promise<LLMResponse> {
    const trimmedBase = this.baseUrl.replace(/\/$/, '');
    const url = `${trimmedBase}/chat/completions`;

    const body: any = {
      model: this.model,
      messages,
      temperature,
      max_tokens: maxTokens,
    };

    if (responseFormat === 'json') {
      body.response_format = { type: 'json_object' };
    }
console.log(url, body);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();

    return {
      content: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      },
    };
  }

  private async callAnthropic(
    messages: LLMMessage[],
    temperature: number,
    maxTokens: number,
  ): Promise<LLMResponse> {
    const url = 'https://api.anthropic.com/v1/messages';

    // Extract system message
    const systemMessage = messages.find((m) => m.role === 'system')?.content || '';
    const conversationMessages = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: maxTokens,
        temperature,
        system: systemMessage,
        messages: conversationMessages,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${error}`);
    }

    const data = await response.json();

    return {
      content: data.content[0].text,
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens,
      },
    };
  }

  async parseJSON<T>(content: string): Promise<T> {
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }

      // Try direct parsing
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to parse JSON response: ${error.message}`);
    }
  }
}

