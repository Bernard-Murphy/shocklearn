import { Injectable } from '@nestjs/common';
import { LLMClientService, LLMMessage } from '../services/llm-client.service';
import { GenerateCurriculumDto, CurriculumOutput } from '@edtech/shared';

@Injectable()
export class CurriculumGeneratorAgent {
  constructor(private llmClient: LLMClientService) {}

  async generate(input: GenerateCurriculumDto): Promise<CurriculumOutput> {
    // Validate input
    this.validateInput(input);

    // Construct prompt
    const messages = this.constructPrompt(input);

    // Call LLM
    const response = await this.llmClient.generateCompletion(messages, {
      temperature: 0.7,
      maxTokens: 3000,
      responseFormat: 'json',
    });

    // Parse and validate response
    const curriculum = await this.parseAndValidate(response.content);

    return curriculum;
  }

  private validateInput(input: GenerateCurriculumDto): void {
    if (!input.objectives || input.objectives.length === 0) {
      throw new Error('Learning objectives are required');
    }

    if (!input.targetAudience) {
      throw new Error('Target audience is required');
    }

    if (!input.durationHours || input.durationHours <= 0) {
      throw new Error('Duration must be a positive number');
    }
  }

  private constructPrompt(input: GenerateCurriculumDto): LLMMessage[] {
    const systemMessage = `You are an expert curriculum designer with deep knowledge of pedagogy and instructional design. Your task is to create structured, well-organized course content that progressively builds knowledge and skills.

Your response must be valid JSON matching this exact schema:
{
  "modules": [
    {
      "title": "string",
      "description": "string",
      "lessons": [
        {
          "title": "string",
          "learningObjectives": ["string"],
          "content": "markdown formatted string with detailed lesson content",
          "estimatedDuration": number (in minutes)
        }
      ]
    }
  ],
  "reasoning": "Detailed explanation of your pedagogical choices, topic sequencing, and how the curriculum aligns with the learning objectives"
}`;

    const prerequisites = input.prerequisites?.length
      ? `\n\nPrerequisites: ${input.prerequisites.join(', ')}`
      : '';

    const userMessage = `Create a comprehensive curriculum with the following requirements:

Learning Objectives:
${input.objectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

Target Audience: ${input.targetAudience}
Total Duration: ${input.durationHours} hours${prerequisites}

Requirements:
- Break down the content into logical modules
- Each module should have 3-5 lessons
- Lessons should build on each other progressively
- Include clear learning objectives for each lesson
- Provide detailed markdown content for each lesson (at least 200 words per lesson)
- Ensure total estimated duration matches the specified hours
- Consider the target audience's background and learning needs

Return your response as valid JSON.`;

    return [
      { role: 'system', content: systemMessage },
      { role: 'user', content: userMessage },
    ];
  }

  private async parseAndValidate(content: string): Promise<CurriculumOutput> {
    const result = await this.llmClient.parseJSON<CurriculumOutput>(content);

    // Validate structure
    if (!result.modules || !Array.isArray(result.modules)) {
      throw new Error('Invalid curriculum structure: missing modules array');
    }

    if (result.modules.length === 0) {
      throw new Error('Curriculum must have at least one module');
    }

    for (const module of result.modules) {
      if (!module.title || !module.lessons || !Array.isArray(module.lessons)) {
        throw new Error('Invalid module structure');
      }

      if (module.lessons.length === 0) {
        throw new Error('Each module must have at least one lesson');
      }

      for (const lesson of module.lessons) {
        if (
          !lesson.title ||
          !lesson.learningObjectives ||
          !lesson.content ||
          !lesson.estimatedDuration
        ) {
          throw new Error('Invalid lesson structure');
        }
      }
    }

    if (!result.reasoning) {
      throw new Error('Reasoning explanation is required');
    }

    return result;
  }
}

