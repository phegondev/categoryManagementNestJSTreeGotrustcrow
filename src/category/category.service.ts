import { Injectable, NotFoundException, ConflictException, HttpStatus, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { FindOneOptions, FindManyOptions, TreeRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './category.entity';




@Injectable()
export class CategoryService {
    constructor(@InjectRepository(Category) private readonly categoryRepository: TreeRepository<Category>) { }



    /* This is the Method to add a category */
    async addCategory(category: Category, parentId?: number): Promise<any> {
        try {
            if (parentId) {
                const parentCategory = await this.categoryRepository.findOneOrFail({
                    where: { id: parentId },
                } as FindOneOptions<Category>);
                category.parent = parentCategory;
            }
            const savedCategory = await this.categoryRepository.save(category);
            return {
                statusCode: HttpStatus.OK,
                message: 'Category was successfully added.',
                error: null,
                data: savedCategory, // I'm including the saved category in the response
            };
        } catch (error) {
            if (error.name === 'EntityNotFoundError') {
                throw new NotFoundException(`Parent category with ID ${parentId} not found.`);
            } else if (error.code === '23505') {
                throw new ConflictException('Category name must be unique.');
            } else if (error.code === '22023' || error.constraint === 'nested_set_root_check' || error.name === 'QueryFailedError' || error.code === '23503' || error.message.includes('Nested sets do not support multiple root')) {
                throw new BadRequestException('Bad Request: ' + error);
            } else {
                throw new InternalServerErrorException('Error during category addition.' + error);
            }
        }
    }


    /* This is the Method to get all categories */
    async getAllCategories(): Promise<any> {
        try {
            const categories = await this.categoryRepository.findTrees();
            if (categories.length === 0) {
                throw new NotFoundException('No categories found.');
            }
            return {
                statusCode: HttpStatus.OK,
                message: 'Categories found.',
                error: null,
                data: categories,
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException(`Category not found.`);
            } else {
                throw new InternalServerErrorException(`An error occurred ${error.message} `);
            }
        }
    }

    /* This is the Method to get a single category by id */
    async getCategoryById(id: number): Promise<any> {
        try {
            const category = await this.categoryRepository.findOneOrFail({
                where: { id },
            } as FindOneOptions<Category>);

            return {
                statusCode: HttpStatus.OK,
                message: 'Success.',
                error: null,
                data: category,
            };
        } catch (error) {
            if (error.name === 'EntityNotFoundError') {
                throw new NotFoundException(`Category with ID ${id} not found.`);
            } else if (error.name === 'TypeError' && error.message.includes('invalid input syntax')) {
                throw new BadRequestException('Invalid category ID format.');
            } else {
                throw new InternalServerErrorException('An unexpected error occurred.');
            }
        }
    }

    /** This method is used to get the first direct node children of a category by id */
    async getCategoryAndFirstDecendantById(id: number): Promise<any> {
        try {
            const category = await this.categoryRepository.findOneOrFail({
                where: { id },
            } as FindOneOptions<Category>);

            category.children = await this.categoryRepository.find({
                where: { parent: category },
            } as FindManyOptions<Category>);

            return {
                statusCode: HttpStatus.OK,
                message: 'Category and first descendant found.',
                error: null,
                data: category,
            };
        } catch (error) {
            if (error.name === 'EntityNotFoundError') {
                throw new NotFoundException(`Category with ID ${id} not found.`);
            } else if (error.name === 'TypeError' && error.message.includes('invalid input syntax')) {
                throw new BadRequestException('Invalid category ID format.' + error);
            } else {
                throw new InternalServerErrorException('An unexpected error occurred.' + error);
            }
        }
    }


    /** This method is used to get all nodes/children of a Category by id */
    async getCategoryAndAllDescendantsById(id: number): Promise<any> {
        try {
            const category = await this.categoryRepository.findOneOrFail({
                where: { id },
            } as FindOneOptions<Category>);

            let cat = await this.categoryRepository.findDescendantsTree(category);

            return {
                statusCode: HttpStatus.OK,
                message: 'Category and all descendants found.',
                error: null,
                data: cat,
            };
        } catch (error) {
            if (error.name === 'EntityNotFoundError') {
                throw new NotFoundException(`Category with ID ${id} not found.`);
            } else if (error.name === 'TypeError' && error.message.includes('invalid input syntax')) {
                throw new BadRequestException('Invalid category ID format.' + error);
            } else {
                throw new InternalServerErrorException('An unexpected error occurred.' + error);
            }
        }
    }


    /** This method is used to delete a Category by id. If it has sub nodes, they will be deleted as well*/
    async removeCategoryById(id: number): Promise<any> {
        try {
            const categoryToRemove = await this.categoryRepository.findOneOrFail({
                where: { id },
            } as FindOneOptions<Category>);

            await this.removeDescendantsRecursive(categoryToRemove);

            return {
                statusCode: HttpStatus.OK,
                message: 'Category was successfully removed',
                error: null,
            };
        } catch (error) {
            if (error.name === 'EntityNotFoundError') {
                throw new NotFoundException(`Category with ID ${id} not found.`);
            } else if (error.name === 'QueryFailedError' && error.code === '23503') {
                throw new BadRequestException('Cannot remove category with referenced descendants.' + error);
            } else {
                throw new InternalServerErrorException('Internal server error during category removal.' + error);
            }
        }
    }

    /** Method to move a Category from one node to another */
    async moveSubtree(sourceId: number, destinationParentId: number): Promise<any> {
        try {
            const sourceCategory = await this.categoryRepository.findOneOrFail({
                where: { id: sourceId },
            } as FindOneOptions<Category>);

            const destinationParent = await this.categoryRepository.findOneOrFail({
                where: { id: destinationParentId },
            } as FindOneOptions<Category>);

            // Check if moving the subtree would create an invalid category structure
            if (await this.isDescendantOf(destinationParent, sourceCategory)) {
                throw new BadRequestException('Invalid category structure. Cannot move node to its descendant.');
            }

            sourceCategory.parent = destinationParent;

            const movedTreeData = await this.categoryRepository.save(sourceCategory);

            return {
                statusCode: HttpStatus.OK,
                message: 'Subtree successfully moved.',
                error: null,
                data: movedTreeData, // I'm including the moved tree data in the response
            };
        } catch (error) {
            if (error.name === 'EntityNotFoundError') {
                throw new NotFoundException(`Source category or destination parent not found.`);
            } else if (error.name === 'QueryFailedError' && error.code === '23503') {
                throw new BadRequestException('Cannot move subtree with referenced categories.');
            } else {
                throw new InternalServerErrorException('Internal server error during subtree movement.' + error);
            }
        }
    }

    private async isDescendantOf(potentialParent: Category, source: Category): Promise<boolean> {
        // Check if the potential parent category is a descendant of the source category
        const descendants = await this.getAllDescendantsRecursive(source);
        return descendants.some(descendant => descendant.id === potentialParent.id);
    }


    private async removeDescendantsRecursive(category: Category): Promise<void> {
        const descendants = await this.categoryRepository.findDescendantsTree(category);

        if (descendants && descendants.children.length > 0) {
            await this.removeDescendantsTree(descendants);
        } else {
            await this.categoryRepository.remove(category);
        }
    }


    private async removeDescendantsTree(category: Category): Promise<void> {
        if (category.children && category.children.length > 0) {
            for (const child of category.children) {
                await this.removeDescendantsTree(child);
            }
        }
        await this.categoryRepository.remove(category);
    }


    async getAllDescendantsRecursive(category: Category, visited: Set<number> = new Set()): Promise<Category[]> {
        const descendants: Category[] = [];

        const collectDescendants = async (currentCategory: Category) => {
            if (visited.has(currentCategory.id)) {
                return;
            }
            visited.add(currentCategory.id);
            const children = await this.categoryRepository.find({
                where: { parent: currentCategory },
            } as FindManyOptions<Category>);
            for (const child of children) {
                descendants.push(child);
                await collectDescendants(child);
            }
        };
        await collectDescendants(category);
        return descendants;
    }

}
