import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from './courses.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CourseStatus } from '@edtech/shared';

describe('CoursesService', () => {
  let service: CoursesService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        {
          provide: getRepositoryToken(Course),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a course', async () => {
      const courseData = {
        title: 'Test Course',
        description: 'Test Description',
      };

      const expectedCourse = {
        id: '123',
        ...courseData,
        status: CourseStatus.DRAFT,
        instructorId: 'instructor-id',
      };

      mockRepository.create.mockReturnValue(expectedCourse);
      mockRepository.save.mockResolvedValue(expectedCourse);

      const result = await service.create('instructor-id', courseData);

      expect(result).toEqual(expectedCourse);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...courseData,
        instructorId: 'instructor-id',
        status: CourseStatus.DRAFT,
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated courses', async () => {
      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual({ data: [], total: 0 });
    });
  });
});

