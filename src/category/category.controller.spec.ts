import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { Category } from './category.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('CategoryController', () => {
  let controller: CategoryController;
  let service: CategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [CategoryService],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    service = module.get<CategoryService>(CategoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });



  /**Test for add category */
  describe('addCategory', () => {
    it('should add a category successfully', async () => {
      // Arrange
      const categoryToAdd: Category = {
        id: 1,
        name: 'TestCategory',
        children: [],
        parent: null,
      };
      jest.spyOn(service, 'addCategory').mockResolvedValueOnce(categoryToAdd);

      // Act
      const result = await controller.addCategory(categoryToAdd);

      // Assert
      expect(result).toEqual(categoryToAdd);
    });

    it('should throw ConflictException for duplicate category name', async () => {
      // Arrange
      const duplicateCategory: Category = {
        id: 2,
        name: 'DuplicateCategory',
        children: [],
        parent: null,
      };
      jest.spyOn(service, 'addCategory').mockRejectedValueOnce({
        name: 'ConflictException',  // Mock ConflictException
        code: '23505',
      });

      // Act & Assert
      await expect(controller.addCategory(duplicateCategory)).rejects.toThrowError('Category name must be unique.');
    });
  });





  /**Test for get all category */
  describe('getAllCategories', () => {
    it('should get all categories successfully', async () => {
      // Arrange
      const expectedCategories: Category[] = [
        { id: 1, name: 'Category1', children: [], parent: null },
        { id: 2, name: 'Category2', children: [], parent: null },
      ];
      jest.spyOn(service, 'getAllCategories').mockResolvedValueOnce(expectedCategories);

      // Act
      const result = await controller.getAllCategories();

      // Assert
      expect(result).toEqual(expectedCategories);
    });

    it('should throw NotFoundException when no categories are found', async () => {
      // Arrange
      jest.spyOn(service, 'getAllCategories').mockResolvedValueOnce([]);

      await expect(controller.getAllCategories()).rejects.toThrow('No categories found.');
    });
  });



  /**Test for get category by id */
  describe('getCategoryById', () => {
    it('should get a category by id successfully', async () => {
      // Arrange
      const categoryId = 1;
      const categoryData: Category = {
        id: categoryId,
        name: 'TestCategory',
        children: [],
        parent: null,
      };
      jest.spyOn(service, 'getCategoryById').mockResolvedValueOnce(categoryData);
      const result = await controller.getCategoryById(categoryId);
      expect(result).toEqual(categoryData);
    });

    it('should throw NotFoundException when category is not found', async () => {
      // Arrange
      const nonExistentCategoryId = 2;
      jest.spyOn(service, 'getCategoryById').mockRejectedValueOnce(new NotFoundException());
      await expect(controller.getCategoryById(nonExistentCategoryId)).rejects.toThrow(NotFoundException);
    });

  });


  /**Test for get category and first node decendant by id */
  describe('getCategoryAndFirstDecendantById', () => {
    it('should get a category and its first descendant by id successfully', async () => {
      // Arrange
      const categoryId = 1;
      const categoryData: Category = {
        id: categoryId,
        name: 'TestCategory',
        children: [
          {
            id: 2,
            name: 'FirstChild',
            children: [],
            parent: null,
          },
        ],
        parent: null,
      };
      jest.spyOn(service, 'getCategoryAndFirstDecendantById').mockResolvedValueOnce(categoryData);
      await expect(controller.getCategoryAndFirstDecendantById(categoryId)).resolves.toEqual(categoryData);
    });

    it('should throw NotFoundException when category is not found', async () => {
      // Arrange
      const nonExistentCategoryId = 2;
      jest.spyOn(service, 'getCategoryAndFirstDecendantById').mockRejectedValueOnce(new NotFoundException());
      await expect(controller.getCategoryAndFirstDecendantById(nonExistentCategoryId)).rejects.toThrow(NotFoundException);
    });
  });


  /**Test for get category and all node decendants by id */
  describe('getCategoryAndAllDescendantsById', () => {
    it('should get a category and all descendants by id successfully', async () => {
      // Arrange
      const categoryId = 1;
      const categoryData: Category = {
        id: categoryId,
        name: 'TestCategory',
        children: [
          {
            id: 2,
            name: 'FirstChild',
            children: [
              {
                id: 3,
                name: 'GrandChild',
                children: [],
                parent: null,
              },
            ],
            parent: null,
          },
        ],
        parent: null,
      };
      jest.spyOn(service, 'getCategoryAndAllDescendantsById').mockResolvedValueOnce(categoryData);

      // Act & Assert
      await expect(controller.getCategoryAndAllDescendantsById(categoryId)).resolves.toEqual(categoryData);
    });

    it('should throw NotFoundException when category is not found', async () => {
      // Arrange
      const nonExistentCategoryId = 2;
      jest.spyOn(service, 'getCategoryAndAllDescendantsById').mockRejectedValueOnce(new NotFoundException());

      // Act & Assert
      await expect(controller.getCategoryAndAllDescendantsById(nonExistentCategoryId)).rejects.toThrow(NotFoundException);
    });
  });


  /**Test fto remove a categoty by id */
  describe('removeCategoryById', () => {
    it('should remove a category by id and its descendants successfully', async () => {
      // Arrange
      const categoryId = 1;
      jest.spyOn(service, 'removeCategoryById').mockResolvedValueOnce(undefined);

      // Act & Assert
      await expect(controller.removeCategoryById(categoryId)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException when category is not found', async () => {
      // Arrange
      const nonExistentCategoryId = 2;
      jest.spyOn(service, 'removeCategoryById').mockRejectedValueOnce(new NotFoundException());

      // Act & Assert
      await expect(controller.removeCategoryById(nonExistentCategoryId)).rejects.toThrow(NotFoundException);
    });
  });



  /**Test to move a category from one node to another*/
  describe('moveSubtree', () => {
    it('should move subtree successfully', async () => {
      // Arrange
      const sourceId = 1;
      const destinationParentId = 2;
      jest.spyOn(service, 'moveSubtree').mockResolvedValueOnce(undefined);

      // Act & Assert
      await expect(controller.moveSubtree(sourceId, destinationParentId)).resolves.toBeUndefined();
    });

    it('should throw BadRequestException for invalid move (source is descendant of destination)', async () => {
      // Arrange
      const sourceId = 1;
      const destinationParentId = 1;
      jest.spyOn(service, 'moveSubtree').mockRejectedValueOnce(new BadRequestException());

      // Act & Assert
      await expect(controller.moveSubtree(sourceId, destinationParentId)).rejects.toThrow(BadRequestException);
    });
  });

});
