import { Injectable } from '@nestjs/common';
import { LLMClientService, LLMMessage } from '../services/llm-client.service';
import { GenerateQuizDto, QuizOutput, QuizQuestion } from '@edtech/shared';

@Injectable()
export class QuizGeneratorAgent {
  constructor(private llmClient: LLMClientService) {}

  async generate(input: GenerateQuizDto): Promise<QuizOutput> {
    // Validate input
    this.validateInput(input);

    // Construct prompt
    const messages = this.constructPrompt(input);

    // Call LLM
    const response = await this.llmClient.generateCompletion(messages, {
      temperature: 0.8,
      maxTokens: 2000,
      responseFormat: 'json',
    });

    // Parse and validate response
    const quiz = await this.parseAndValidate(response.content);

    return quiz;
  }

  private validateInput(input: GenerateQuizDto): void {
    if (!input.lessonContent || input.lessonContent.trim().length < 50) {
      throw new Error('Lesson content must be at least 50 characters');
    }

    if (!input.learningObjectives || input.learningObjectives.length === 0) {
      throw new Error('Learning objectives are required');
    }

    if (!input.numberOfQuestions || input.numberOfQuestions < 1 || input.numberOfQuestions > 20) {
      throw new Error('Number of questions must be between 1 and 20');
    }

    if (!['beginner', 'intermediate', 'advanced'].includes(input.difficultyLevel)) {
      throw new Error('Invalid difficulty level');
    }
  }

  private constructPrompt(input: GenerateQuizDto): LLMMessage[] {
    const systemMessage = `You are an expert educational assessment designer. Your task is to create high-quality quiz questions that accurately assess understanding of the lesson content and learning objectives.

Your response must be valid JSON matching this exact schema:
{
  "questions": [
    {
      "id": "unique_string_id",
      "question": "string",
      "type": "multiple_choice" | "short_answer",
      "options": ["string"] (only for multiple_choice),
      "correctAnswer": "string" | ["string"],
      "explanation": "string explaining why this is correct"
    }
  ],
  "reasoning": "Explanation of what concepts each question tests and why they're appropriate for the difficulty level"
}`;

    const userMessage = `Create ${input.numberOfQuestions} quiz questions based on the following:

Lesson Content:
${input.lessonContent}

Learning Objectives:
${input.learningObjectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

Difficulty Level: ${input.difficultyLevel}

Requirements:
- Create a mix of multiple-choice (70%) and short-answer (30%) questions
- Each question should test a specific concept from the lesson
- Multiple-choice questions should have 4 options with only one correct answer
- Avoid ambiguous or trick questions
- Include explanations for correct answers
- Ensure questions are appropriate for ${input.difficultyLevel} level
- Questions should progressively test deeper understanding

Return your response as valid JSON.`;

    return [
      { role: 'system', content: systemMessage },
      { role: 'user', content: userMessage },
    ];
  }

  private async parseAndValidate(content: string): Promise<QuizOutput> {
    const result = await this.llmClient.parseJSON<QuizOutput>(content);

    // Validate structure
    if (!result.questions || !Array.isArray(result.questions)) {
      throw new Error('Invalid quiz structure: missing questions array');
    }

    if (result.questions.length === 0) {
      throw new Error('Quiz must have at least one question');
    }

    for (const question of result.questions) {
      if (!question.id || !question.question || !question.type || !question.correctAnswer) {
        throw new Error('Invalid question structure');
      }

      if (question.type === 'multiple_choice' && (!question.options || question.options.length < 2)) {
        throw new Error('Multiple choice questions must have at least 2 options');
      }

      if (!question.explanation) {
        throw new Error('Each question must have an explanation');
      }
    }

    if (!result.reasoning) {
      throw new Error('Reasoning explanation is required');
    }

    return result;
  }
}

