import { Controller, Post, Get, Param, Body, Delete, Put } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category } from './category.entity';


@Controller('categories')
export class CategoryController {

    constructor(private readonly categoryService: CategoryService) { }

    /**API to save a Category */
    @Post()
    async addCategory(@Body() category: Category, @Body('parentId') parentId?: number): Promise<Category> {
        return this.categoryService.addCategory(category, parentId);
    }

    /**API to get all Category */
    @Get()
    async getAllCategories(): Promise<Category[]> {
        return this.categoryService.getAllCategories();
    }

    /**API to get a sigle Category by id */
    @Get('single/:id')
    async getCategoryById(@Param('id') id: number): Promise<Category> {
        return this.categoryService.getCategoryById(id);
    }

    /**API to get the first direct node/children of a category by id */
    @Get('with-first-direct-children/:id')
    async getCategoryAndFirstDecendantById(@Param('id') id: number): Promise<Category> {
        return this.categoryService.getCategoryAndFirstDecendantById(id);
    }

    /**API to get all nodes/children of a Category by id */
    @Get('with-all-children/:id')
    async getCategoryAndAllDescendantsById(@Param('id') id: number): Promise<Category> {
        return this.categoryService.getCategoryAndAllDescendantsById(id);
    }

    
    /**API to delete a Category by id. If it has sub nodes, they will be deleted as well*/
    @Delete('remove/:id')
    async removeCategoryById(@Param('id') id: number): Promise<void> {
        return this.categoryService.removeCategoryById(id);
    }

    /**API to move a Category from one node to another */
    @Put('move-subtree/:sourceId/to/:destinationParentId')
    async moveSubtree(
        @Param('sourceId') sourceId: number,
        @Param('destinationParentId') destinationParentId: number,
    ): Promise<void> {
        return this.categoryService.moveSubtree(sourceId, destinationParentId);
    }

}
