import { Test, TestingModule } from '@nestjs/testing';
import { CurriculumGeneratorAgent } from './curriculum-generator.agent';
import { LLMClientService } from '../services/llm-client.service';

describe('CurriculumGeneratorAgent', () => {
  let agent: CurriculumGeneratorAgent;
  let llmClient: LLMClientService;

  const mockLLMClient = {
    generateCompletion: jest.fn(),
    parseJSON: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CurriculumGeneratorAgent,
        { provide: LLMClientService, useValue: mockLLMClient },
      ],
    }).compile();

    agent = module.get<CurriculumGeneratorAgent>(CurriculumGeneratorAgent);
    llmClient = module.get<LLMClientService>(LLMClientService);
  });

  it('should be defined', () => {
    expect(agent).toBeDefined();
  });

  describe('generate', () => {
    it('should validate input before generation', async () => {
      const invalidInput = {
        objectives: [],
        targetAudience: '',
        durationHours: 0,
      };

      await expect(agent.generate(invalidInput)).rejects.toThrow(
        'Learning objectives are required',
      );
    });

    it('should generate curriculum with valid input', async () => {
      const validInput = {
        objectives: ['Learn TypeScript', 'Build applications'],
        targetAudience: 'Beginners',
        durationHours: 10,
      };

      const mockResponse = {
        modules: [
          {
            title: 'Introduction to TypeScript',
            description: 'Getting started',
            lessons: [
              {
                title: 'What is TypeScript',
                learningObjectives: ['Understand TypeScript basics'],
                content: 'TypeScript is...',
                estimatedDuration: 30,
              },
            ],
          },
        ],
        reasoning: 'Progressive learning path',
      };

      mockLLMClient.generateCompletion.mockResolvedValue({
        content: JSON.stringify(mockResponse),
      });
      mockLLMClient.parseJSON.mockResolvedValue(mockResponse);

      const result = await agent.generate(validInput);

      expect(result).toEqual(mockResponse);
      expect(mockLLMClient.generateCompletion).toHaveBeenCalled();
    });
  });
});

