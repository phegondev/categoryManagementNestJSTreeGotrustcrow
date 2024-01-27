import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { Category } from './category.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('CategoryController', () => {
  let categoryController: CategoryController;
  let categoryService: CategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        CategoryService,
        {
          provide: getRepositoryToken(Category),
          useClass: Repository,
        },
      ],
    }).compile();

    categoryController = module.get<CategoryController>(CategoryController);
    categoryService = module.get<CategoryService>(CategoryService);
  });


  
  /***CONTROLLER TEST TO ADD A CATEGORY */
  describe('addCategory', () => {
    it('should add a new category successfully', async () => {
      const mockCategory: Category = { id: 1, name: 'Category 1', children: [], parent: null };
      jest.spyOn(categoryService, 'addCategory').mockResolvedValueOnce(mockCategory);

      const result = await categoryController.addCategory(mockCategory);

      expect(result).toBeDefined();
      expect(result.name).toEqual('Category 1');
    });

    it('should add a new category successfully', async () => {
      const mockCategory: Category = { id: 3, name: 'Category 1', children: [], parent: null };
      jest.spyOn(categoryService, 'addCategory').mockResolvedValueOnce(mockCategory);
  
      const result = await categoryController.addCategory(mockCategory);
  
      expect(result).toBeDefined();
      expect(result.id).toEqual(5); // THIS WILL FAIL BECAUSE ID IS SURPOSE TO BE 3 but you said 5
    });

    it('should handle invalid input', async () => {
      const invalidCategory: any = { invalidField: 'Invalid Value' };
      jest.spyOn(categoryService, 'addCategory').mockRejectedValueOnce(new BadRequestException());

      await expect(categoryController.addCategory(invalidCategory)).rejects.toThrow(BadRequestException);
    });
  });

  

  /***CONTROLLER TEST TO GET ALL CATEGORY */
  describe('getAllCategories', () => {
    it('should get all categories successfully', async () => {
      const mockCategories: Category[] = [
        { id: 1, name: 'Category 1', children: [], parent: null },
        { id: 2, name: 'Category 2', children: [], parent: null },
      ];
  
      jest.spyOn(categoryService, 'getAllCategories').mockResolvedValue(mockCategories);
  
      const result = await categoryController.getAllCategories();
  
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  
    it('should handle no categories found', async () => {
      jest.spyOn(categoryService, 'getAllCategories').mockResolvedValue([]);
  
      await expect(categoryController.getAllCategories()).resolves.toEqual([]);
    });
  });
  

  /***CONTROLLER TEST TO GET A CATEGORY BY ID */
  describe('getCategoryById', () => {
    it('should get a category by ID successfully', async () => {
      const mockCategory: Category = { id: 1, name: 'Category 1', children: [], parent: null };
      jest.spyOn(categoryService, 'getCategoryById').mockResolvedValueOnce(mockCategory);

      const result = await categoryController.getCategoryById(1);

      expect(result).toBeDefined();
      expect(result.id).toEqual(1);
      expect(result.name).toEqual('Category 1');
    });

    it('should handle category not found', async () => {
      jest.spyOn(categoryService, 'getCategoryById').mockRejectedValueOnce(new NotFoundException());

      await expect(categoryController.getCategoryById(999)).rejects.toThrow(NotFoundException);
    });
  });


  /***CONTROLLER TEST TO GET A CATEGORY AND  FIEST DEDENDANT BY ID */
  describe('getCategoryAndFirstDecendantById', () => {
    it('should get a category and its first descendant by ID successfully', async () => {
      const mockCategory: Category = { id: 1, name: 'Category 1', children: [], parent: null };
      jest.spyOn(categoryService, 'getCategoryAndFirstDecendantById').mockResolvedValueOnce(mockCategory);

      const result = await categoryController.getCategoryAndFirstDecendantById(1);

      expect(result).toBeDefined();
      expect(result.id).toEqual(1);
      expect(result.name).toEqual('Category 1');
    });

    it('should handle category not found', async () => {
      jest.spyOn(categoryService, 'getCategoryAndFirstDecendantById').mockRejectedValueOnce(new NotFoundException());

      await expect(categoryController.getCategoryAndFirstDecendantById(999)).rejects.toThrow(NotFoundException);
    });
  });


  
  /***CONTROLLER TEST TO GET ALL CATEGORIES BY ID */
  describe('getCategoryAndAllDescendantsById', () => {
    it('should get a category and all descendants by ID successfully', async () => {
      const mockCategory: Category = { id: 1, name: 'Category 1', children: [], parent: null };
      jest.spyOn(categoryService, 'getCategoryAndAllDescendantsById').mockResolvedValueOnce(mockCategory);

      const result = await categoryController.getCategoryAndAllDescendantsById(1);

      expect(result).toBeDefined();
      expect(result.id).toEqual(1);
      expect(result.name).toEqual('Category 1');
    });

    it('should handle category not found', async () => {
      jest.spyOn(categoryService, 'getCategoryAndAllDescendantsById').mockRejectedValueOnce(new NotFoundException());

      await expect(categoryController.getCategoryAndAllDescendantsById(999)).rejects.toThrow(NotFoundException);
    });
  });


  /**TEST TO REMOVE A CATEGORY BY ID */
  describe('removeCategoryById', () => {
    it('should remove a category and its descendants by ID successfully', async () => {
      jest.spyOn(categoryService, 'removeCategoryById').mockResolvedValueOnce(undefined);

      await expect(categoryController.removeCategoryById(1)).resolves;
    });

    it('should handle category not found', async () => {
      jest.spyOn(categoryService, 'removeCategoryById').mockRejectedValueOnce(new NotFoundException());

      await expect(categoryController.removeCategoryById(999)).rejects.toThrow(NotFoundException);
    });

    it('should handle removing category with referenced descendants', async () => {
      jest.spyOn(categoryService, 'removeCategoryById').mockRejectedValueOnce(new BadRequestException());

      await expect(categoryController.removeCategoryById(1)).rejects.toThrow(BadRequestException);
    });
  });

  /**TEST TO MOVE A CATEGORY */
  describe('moveSubtree', () => {
    it('should move a category subtree from one node to another successfully', async () => {
      jest.spyOn(categoryService, 'moveSubtree').mockResolvedValueOnce(undefined);

      await expect(categoryController.moveSubtree(1, 2)).resolves;
    });

    it('should handle source category or destination parent not found', async () => {
      jest.spyOn(categoryService, 'moveSubtree').mockRejectedValueOnce(new NotFoundException());

      await expect(categoryController.moveSubtree(999, 2)).rejects.toThrow(NotFoundException);
    });

    it('should handle cannot move subtree with referenced categories or invalid move', async () => {
      jest.spyOn(categoryService, 'moveSubtree').mockRejectedValueOnce(new BadRequestException());

      await expect(categoryController.moveSubtree(1, 999)).rejects.toThrow(BadRequestException);
    });
  });
});
