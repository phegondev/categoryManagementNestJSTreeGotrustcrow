import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { Category } from './category.entity';
import {
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
  HttpStatus,
} from '@nestjs/common';

describe('CategoryService', () => {
  let categoryService: CategoryService;
  let categoryRepository: TreeRepository<Category>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: getRepositoryToken(Category),
          useClass: TreeRepository,
        },
      ],
    }).compile();

    categoryService = module.get<CategoryService>(CategoryService);
    categoryRepository = module.get<TreeRepository<Category>>(getRepositoryToken(Category));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });


  /**TEST TO ADD A CATEGORIES */
  describe('addCategory', () => {
    it('should add a category successfully', async () => {
      const categoryToAdd: Category = generateMockCategory('Test Category');
      jest.spyOn(categoryRepository, 'save').mockResolvedValue(categoryToAdd);

      const result = await categoryService.addCategory(categoryToAdd);

      expect(result.statusCode).toEqual(HttpStatus.OK);
      expect(result.message).toEqual('Category was successfully added.');
      expect(result.error).toBeNull();
      expect(result.data).toEqual(categoryToAdd);
    });

    it('should throw ConflictException for duplicate category name', async () => {
      const categoryToAdd: Category = generateMockCategory('Duplicate Category');
      jest.spyOn(categoryRepository, 'save').mockRejectedValue({ code: '23505' });

      await expect(categoryService.addCategory(categoryToAdd)).rejects.toThrow(ConflictException);
    });

    it('should throw InternalServerErrorException for other database error', async () => {
      const categoryToAdd: Category = generateMockCategory('Test Category');
      jest.spyOn(categoryRepository, 'save').mockRejectedValue(new Error('Some database error'));

      await expect(categoryService.addCategory(categoryToAdd)).rejects.toThrow(InternalServerErrorException);
    });
  });


  /**TEST TO GET ALL CATEGORIES */
  describe('getAllCategories', () => {
    it('should get all categories successfully', async () => {

      const mockCategories: Category[] = [
        { id: 1, name: 'Category1', children: [], parent: null },
        { id: 2, name: 'Category2', children: [], parent: null },
      ];

      jest.spyOn(categoryRepository, 'findTrees').mockResolvedValue(mockCategories);

      const result = await categoryService.getAllCategories();

      expect(result.statusCode).toEqual(HttpStatus.OK);
      expect(result.message).toEqual('Categories found.');
      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockCategories);
    });

    it('should throw NotFoundException when no categories are found', async () => {
      jest.spyOn(categoryRepository, 'findTrees').mockResolvedValue([]);

      await expect(categoryService.getAllCategories()).rejects.toThrow(NotFoundException);
    });
  });



/** TEST TO GET A CATEGORY BY ID */
describe('getCategoryById', () => {
  it('should get a category by id successfully', async () => {
    // Mock category data
    const categoryData: Category = {
      id: 1,
      name: 'Test Category',
      children: [],
      parent: null,
    };

    // Mock the findOneOrFail method to return the category data
    jest.spyOn(categoryRepository, 'findOneOrFail').mockResolvedValue(categoryData);

    const result = await categoryService.getCategoryById(1);

    expect(result.statusCode).toBe(HttpStatus.OK);
    expect(result.message).toBe('Success.');
    expect(result.error).toBeNull();
    expect(result.data).toEqual(categoryData);
  });


  it('should throw BadRequestException for invalid category ID format', async () => {
    // Mocking that findOneOrFail throws a TypeError with 'invalid input syntax' message
    jest.spyOn(categoryRepository, 'findOneOrFail').mockRejectedValue(new TypeError('invalid input syntax'));

    await expect(categoryService.getCategoryById(123567)).rejects.toThrow(
      new BadRequestException('Invalid category ID format.')
    );
  });

  it('should throw InternalServerErrorException for unexpected errors', async () => {
    // Mocking that findOneOrFail throws some unexpected error
    jest.spyOn(categoryRepository, 'findOneOrFail').mockRejectedValue(new Error('Unexpected error'));

    await expect(categoryService.getCategoryById(1)).rejects.toThrow(
      new InternalServerErrorException('An unexpected error occurred.')
    );
  });
});



/** TEST TO GET A CATEGORY and first DESCENDANT */
describe('getCategoryAndFirstDescendantById', () => {

  it('should throw NotFoundException when category is not found', async () => {
      const nonExistentCategoryId = 999;

      // Mocking the categoryRepository to throw EntityNotFoundError
      jest.spyOn(categoryRepository, 'findOneOrFail').mockRejectedValue({
          name: 'EntityNotFoundError',
      });

      await expect(
          categoryService.getCategoryAndFirstDecendantById(nonExistentCategoryId),
      ).rejects.toThrow(new NotFoundException(`Category with ID ${nonExistentCategoryId} not found.`));
  });
});


  // Helper function to generate a mock category
  const generateMockCategory = (name: string): Category => ({
    id: 1,
    name,
    children: [],
    parent: null,
  });
});
