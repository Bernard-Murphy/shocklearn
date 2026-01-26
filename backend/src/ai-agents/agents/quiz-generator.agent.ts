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
    if (!input.lessonId) {
      throw new Error('Lesson ID is required');
    }

    if (!input.numberOfQuestions || input.numberOfQuestions < 1 || input.numberOfQuestions > 20) {
      throw new Error('Number of questions must be between 1 and 20');
    }

    if (!['beginner', 'intermediate', 'advanced'].includes(input.difficultyLevel)) {
      throw new Error('Invalid difficulty level');
    }
  }

  private constructPrompt(input: GenerateQuizDto): LLMMessage[] {
    const systemMessage = `You are an expert educational content and assessment designer. Your task is to:
1. Generate comprehensive, high-quality lesson content in Markdown format based on the lesson title and any additional details provided.
2. Create a high-quality quiz that accurately assesses understanding of the generated lesson content.

Your response must be valid JSON matching this exact schema:
{
  "lessonContent": "string (Markdown format)",
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
  "reasoning": "Explanation of the lesson content structure and what concepts each question tests"
}`;

    const userMessage = `Create a lesson and ${input.numberOfQuestions} quiz questions based on the following:

Lesson Title: ${input.lessonTitle || 'Untitled Lesson'}
Additional Details: ${input.additionalDetails || 'None provided'}

Difficulty Level: ${input.difficultyLevel}

Requirements for Lesson Content:
- Write in clear, engaging Markdown
- Include headers, lists, and bold text for readability
- Ensure content is thorough and appropriate for ${input.difficultyLevel} level
- Content should be at least 500 words

Requirements for Quiz:
- Create ${input.numberOfQuestions} questions
- Create a mix of multiple-choice (70%) and short-answer (30%) questions
- Each question should test a specific concept from the generated lesson
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
    if (!result.lessonContent || result.lessonContent.trim().length < 100) {
      throw new Error('Invalid quiz structure: missing or too short lesson content');
    }

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

