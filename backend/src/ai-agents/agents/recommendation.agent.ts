import { Injectable } from '@nestjs/common';
import { LLMClientService, LLMMessage } from '../services/llm-client.service';
import { ProgressService } from '../../progress/progress.service';
import { RecommendationOutput } from '@edtech/shared';

@Injectable()
export class RecommendationAgent {
  constructor(
    private llmClient: LLMClientService,
    private progressService: ProgressService,
  ) {}

  async generate(enrollmentId: string): Promise<RecommendationOutput> {
    // Fetch progress data
    const progressData = await this.progressService.findByEnrollment(enrollmentId);

    if (!progressData || progressData.length === 0) {
      return {
        recommendations: [
          {
            type: 'next_lesson',
            title: 'Get Started',
            description: 'Begin your learning journey with the first lesson',
            priority: 1,
          },
        ],
        reasoning: 'No progress data available yet. Starting with the first lesson.',
      };
    }

    // Construct prompt with progress data
    const messages = this.constructPrompt(progressData);

    // Call LLM
    const response = await this.llmClient.generateCompletion(messages, {
      temperature: 0.6,
      maxTokens: 1500,
      responseFormat: 'json',
    });

    // Parse and validate response
    const recommendations = await this.parseAndValidate(response.content);

    return recommendations;
  }

  private constructPrompt(progressData: any[]): LLMMessage[] {
    const systemMessage = `You are an expert learning analytics system that provides personalized recommendations to learners based on their progress patterns.

Your response must be valid JSON matching this exact schema:
{
  "recommendations": [
    {
      "type": "next_lesson" | "review" | "additional_resource",
      "title": "string",
      "description": "string explaining why this is recommended",
      "lessonId": "string (optional)",
      "priority": number (1-5, with 1 being highest priority)
    }
  ],
  "reasoning": "Detailed explanation of the analysis and why these recommendations are made"
}`;

    const progressSummary = progressData.map((p) => ({
      lessonId: p.lessonId,
      lessonTitle: p.lesson?.title || 'Unknown',
      status: p.status,
      timeSpent: p.timeSpentSeconds,
      lastAccessed: p.lastAccessedAt,
    }));

    const userMessage = `Analyze this learner's progress and provide personalized recommendations:

Progress Data:
${JSON.stringify(progressSummary, null, 2)}

Requirements:
- Identify patterns in learning behavior (time spent, completion rates, gaps)
- Recommend the most appropriate next steps
- Suggest review for struggling areas
- Provide 3-5 actionable recommendations
- Prioritize recommendations (1 = highest priority)
- Consider learning momentum and gaps in knowledge
- Be encouraging and constructive

Return your response as valid JSON.`;

    return [
      { role: 'system', content: systemMessage },
      { role: 'user', content: userMessage },
    ];
  }

  private async parseAndValidate(content: string): Promise<RecommendationOutput> {
    const result = await this.llmClient.parseJSON<RecommendationOutput>(content);

    // Validate structure
    if (!result.recommendations || !Array.isArray(result.recommendations)) {
      throw new Error('Invalid recommendation structure: missing recommendations array');
    }

    for (const rec of result.recommendations) {
      if (!rec.type || !rec.title || !rec.description || !rec.priority) {
        throw new Error('Invalid recommendation item structure');
      }

      if (!['next_lesson', 'review', 'additional_resource'].includes(rec.type)) {
        throw new Error('Invalid recommendation type');
      }

      if (rec.priority < 1 || rec.priority > 5) {
        throw new Error('Priority must be between 1 and 5');
      }
    }

    if (!result.reasoning) {
      throw new Error('Reasoning explanation is required');
    }

    return result;
  }
}

