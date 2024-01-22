import { Controller, Post, Get, Param, Body, Delete, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBadRequestResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { Category } from './category.entity';


@ApiTags('Categories') 
@Controller('categories')
export class CategoryController {

    constructor(private readonly categoryService: CategoryService) { }

    /**API to save a Category */
    @ApiOperation({ summary: 'Save a new category' })
    @ApiResponse({ status: 201, description: 'Category successfully added', type: Category })
    @ApiBadRequestResponse({ description: 'Bad request: Invalid input or category name must be unique' })
    @Post()
    async addCategory(@Body() category: Category, @Body('parentId') parentId?: number): Promise<Category> {
        return this.categoryService.addCategory(category, parentId);
    }

    /**API to get all Category */
    @ApiOperation({ summary: 'Get all categories' })
    @ApiResponse({ status: 200, description: 'Successfully retrieved all categories', type: [Category] })
    @ApiNotFoundResponse({ description: 'No categories found' })
    @Get()
    async getAllCategories(): Promise<Category[]> {
        return this.categoryService.getAllCategories();
    }

    /**API to get a sigle Category by id */
    @ApiOperation({ summary: 'Get a single category by ID' })
    @ApiResponse({ status: 200, description: 'Successfully retrieved the category', type: Category })
    @ApiNotFoundResponse({ description: 'Category not found' })
    @Get('single/:id')
    async getCategoryById(@Param('id') id: number): Promise<Category> {
        return this.categoryService.getCategoryById(id);
    }

    /**API to get the first direct node/children of a category by id */
    @ApiOperation({ summary: 'Get a category and its first descendant by ID' })
    @ApiResponse({ status: 200, description: 'Successfully retrieved the category and its first descendant', type: Category })
    @ApiNotFoundResponse({ description: 'Category not found' })
    @Get('with-first-direct-children/:id')
    async getCategoryAndFirstDecendantById(@Param('id') id: number): Promise<Category> {
        return this.categoryService.getCategoryAndFirstDecendantById(id);
    }

    /**API to get all nodes/children of a Category by id */
    @ApiOperation({ summary: 'Get a category and all descendants by ID' })
    @ApiResponse({ status: 200, description: 'Successfully retrieved the category and all descendants', type: Category })
    @ApiNotFoundResponse({ description: 'Category not found' })
    @Get('with-all-children/:id')
    async getCategoryAndAllDescendantsById(@Param('id') id: number): Promise<Category> {
        return this.categoryService.getCategoryAndAllDescendantsById(id);
    }

    
    /**API to delete a Category by id. If it has sub nodes, they will be deleted as well*/
    @ApiOperation({ summary: 'Delete a category by ID and its descendants' })
    @ApiResponse({ status: 200, description: 'Category and descendants successfully removed' })
    @ApiNotFoundResponse({ description: 'Category not found' })
    @ApiBadRequestResponse({ description: 'Cannot remove category with referenced descendants' })
    @Delete('remove/:id')
    async removeCategoryById(@Param('id') id: number): Promise<void> {
        return this.categoryService.removeCategoryById(id);
    }

    /**API to move a Category from one node to another */    
    @ApiOperation({ summary: 'Move a category subtree from one node to another' })
    @ApiResponse({ status: 200, description: 'Subtree successfully moved' })
    @ApiNotFoundResponse({ description: 'Source category or destination parent not found' })
    @ApiBadRequestResponse({ description: 'Cannot move subtree with referenced categories or invalid move' })
    @Put('move-subtree/:sourceId/to/:destinationParentId')
    async moveSubtree(
        @Param('sourceId') sourceId: number,
        @Param('destinationParentId') destinationParentId: number,
    ): Promise<void> {
        return this.categoryService.moveSubtree(sourceId, destinationParentId);
    }

}
