import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { Category } from './category.entity';
import { NotFoundException, BadRequestException, InternalServerErrorException, ConflictException, HttpStatus } from '@nestjs/common';




describe('CategoryService', () => {
    let categoryService: CategoryService;
    let categoryRepository: TreeRepository<Category>;

    /**This will run before every test */
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ CategoryService,{provide: getRepositoryToken(Category),
                    // useClass: TreeRepository,
                    useClass: Repository,},],
        }).compile();

        categoryService = module.get<CategoryService>(CategoryService);
        categoryRepository = module.get<TreeRepository<Category>>(getRepositoryToken(Category));
    });


    /**ADD CATEGORY TEST */
    const generateMockCategory = (name: string): Category => ({
        id: 1, // Set an appropriate ID
        name,
        children: [], // Set children as needed
        parent: null, // Set parent as needed
    });

    describe('addCategory', () => {
        it('should add a category successfully', async () => {
            // Arrange
            const categoryToAdd: Category = generateMockCategory('Test Category');

            // Mock the repository save method
            jest.spyOn(categoryRepository, 'save').mockResolvedValue(categoryToAdd);

            // Act
            const result = await categoryService.addCategory(categoryToAdd);

            // Assert
            expect(result.statusCode).toEqual(HttpStatus.OK);
            expect(result.message).toEqual('Category was successfully added.');
            expect(result.error).toBeNull();
            expect(result.data).toEqual(categoryToAdd);
        });

        it('should throw ConflictException for duplicate category name', async () => {
            // Arrange
            const categoryToAdd: Category = generateMockCategory('Duplicate Category');

            // Mock the repository save method to throw a duplicate key violation error
            jest.spyOn(categoryRepository, 'save').mockRejectedValue({ code: '23505' });

            // Act and Assert
            await expect(categoryService.addCategory(categoryToAdd)).rejects.toThrow(ConflictException);
        });

        it('should throw BadRequestException for other database error', async () => {
            // Arrange
            const categoryToAdd: Category = generateMockCategory('Test Category');

            // Mock the repository save method to throw a generic error
            jest.spyOn(categoryRepository, 'save').mockRejectedValue(new Error('Some database error'));

            // Act and Assert
            await expect(categoryService.addCategory(categoryToAdd)).rejects.toThrow(BadRequestException);
        });

        // Add more test cases for different scenarios
    });


    /**GET ALL CATEGORY TEST */
    describe('getAllCategories', () => {
        it('should get all categories successfully', async () => {
            // Arrange
            const mockCategories: Category[] = [
                { id: 1, name: 'Category1', children: [], parent: null },
                { id: 2, name: 'Category2', children: [], parent: null },
            ];

            jest.spyOn(categoryRepository, 'findTrees').mockResolvedValue(mockCategories);

            const result = await categoryService.getAllCategories();

            // Assert
            expect(result.statusCode).toEqual(HttpStatus.OK);
            expect(result.message).toEqual('Categories found.');
            expect(result.error).toBeNull();
            expect(result.data).toEqual(mockCategories);
        });

        it('should throw NotFoundException when no categories are found', async () => {
            jest.spyOn(categoryRepository, 'findTrees').mockResolvedValue([]);

            // Act and Assert
            await expect(categoryService.getAllCategories()).rejects.toThrow(NotFoundException);
        });
    });



    /**TEST FOR GET CATEGORY BY ID */
    describe('getCategoryById', () => {
        it('should get a category by id successfully', async () => {
            const categoryId = 1;

            // Act
            const result = await categoryService.getCategoryById(categoryId);

            // Assert
            expect(result.statusCode).toBe(HttpStatus.OK);
            expect(result.message).toBe('Success.');
            expect(result.error).toBeNull();
            expect(result.data).toBeDefined();
        });

        it('should throw NotFoundException when category is not found', async () => {
            const nonExistentCategoryId = 999;

            // Act & Assert
            await expect(categoryService.getCategoryById(nonExistentCategoryId)).rejects.toThrowError('Category with ID 999 not found.');
        });
    });



    /**TEST FOR GET CATEGORY First Decendent ID */
    describe('getCategoryAndFirstDecendantById', () => {
        it('should get a category and its first descendant by id successfully', async () => {
          const categoryId = 1;
    
          // Act
          const result = await categoryService.getCategoryAndFirstDecendantById(categoryId);
    
          // Assert
          expect(result.statusCode).toBe(HttpStatus.OK);
          expect(result.message).toBe('Category and first descendant found.');
          expect(result.error).toBeNull();
          expect(result.data).toBeDefined();
          // You can add more specific assertions based on your implementation
        });
    
        it('should throw NotFoundException when category is not found', async () => {
          // Arrange
          const nonExistentCategoryId = 999;
    
          // Act & Assert
          await expect(categoryService.getCategoryAndFirstDecendantById(nonExistentCategoryId)).rejects.toThrowError('Category with ID 999 not found.');
        });
      });



    /**TEST FOR GET CATEGORY and All Decendent ID */
      describe('getCategoryAndAllDescendantsById', () => {
        it('should get a category and all descendants by id successfully', async () => {
          const categoryId = 1;
    
          // Act
          const result = await categoryService.getCategoryAndAllDescendantsById(categoryId);
    
          // Assert
          expect(result.statusCode).toBe(HttpStatus.OK);
          expect(result.message).toBe('Category and all descendants found.');
          expect(result.error).toBeNull();
          expect(result.data).toBeDefined();
        });
    
        it('should throw NotFoundException when category is not found', async () => {
          const nonExistentCategoryId = 999;
    
          // Act & Assert
          await expect(categoryService.getCategoryAndAllDescendantsById(nonExistentCategoryId)).rejects.toThrowError('Category with ID 999 not found.');
        });
      });


    /**TEST To Delete a category by id */
      describe('removeCategoryById', () => {
        it('should remove a category by id and its descendants successfully', async () => {
          const categoryIdToRemove = 1;
          const result = await categoryService.removeCategoryById(categoryIdToRemove);
    
          // Assert
          expect(result.statusCode).toBe(HttpStatus.OK);
          expect(result.message).toBe('Category and descendants were successfully removed.');
          expect(result.error).toBeNull();
        });
    
        it('should throw NotFoundException when category is not found', async () => {
          // Arrange
          const nonExistentCategoryId = 999;
          await expect(categoryService.removeCategoryById(nonExistentCategoryId)).rejects.toThrowError('Category with ID 999 not found.');
        });
      });
    

    /**TEST to move a tree from one node to anothe */

    describe('should move subtree successfully', () => {
        it('moves the subtree to a new parent', async () => {
          // Arrange
          const sourceId = 1;
          const destinationParentId = 2;
    
          // Act
          const result = await categoryService.moveSubtree(sourceId, destinationParentId);
    
          // Assert
          expect(result.statusCode).toBe(200);
          expect(result.message).toBe('Subtree successfully moved.');
          expect(result.error).toBeNull();
          expect(result.data).toBeDefined(); // You may want to check specific properties here
        });
      });
    
      describe('should throw BadRequestException for invalid move', () => {
        it('throws BadRequestException when source is a descendant of destination', async () => {
          // Arrange
          const sourceId = 3;
          const destinationParentId = 4;
    
          // Act & Assert
          await expect(categoryService.moveSubtree(sourceId, destinationParentId)).rejects.toThrowError(BadRequestException);
        });
      });
    
      describe('should throw NotFoundException when category is not found', () => {
        it('throws NotFoundException when source category is not found', async () => {
          // Arrange
          const sourceId = 999;
          const destinationParentId = 2;
    
          // Act & Assert
          await expect(categoryService.moveSubtree(sourceId, destinationParentId)).rejects.toThrowError(NotFoundException);
        });
    
        it('throws NotFoundException when destination parent is not found', async () => {
          // Arrange
          const sourceId = 1;
          const destinationParentId = 999;
    
          // Act & Assert
          await expect(categoryService.moveSubtree(sourceId, destinationParentId)).rejects.toThrowError(NotFoundException);
        });
      });

    afterEach(() => {
        jest.restoreAllMocks();
    });
});
