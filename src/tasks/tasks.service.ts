import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateTaskDto, TaskPriority, TaskStatus } from './dto/create-task.dto';
import { FindTasksDto } from './dto/get-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './schema/task.schema';

@Injectable()
export class TasksService {
    constructor(
        @InjectModel(Task.name)
        private readonly taskModel: Model<Task>,
    ) { }

    // Create a new task for a user 
    async create(userId: string, dto: CreateTaskDto): Promise<Task> {
        const task = await this.taskModel.create({
            ...dto,
            userId,
        });
        return task;
    }

    // Find all tasks for a user with optional filters for status, priority, and search query
    async findAll(userId: string, filters: FindTasksDto): Promise<Task[]> {
        const query: {
            userId: string;
            status?: TaskStatus;
            priority?: TaskPriority;
            $or?: Array<Record<string, unknown>>;
        } = { userId };

        if (filters.status) query.status = filters.status;
        if (filters.priority) query.priority = filters.priority;

        if (filters.q) {
            const regex = new RegExp(filters.q, 'i');
            query.$or = [{ title: regex }, { description: regex }];
        }

        return this.taskModel.find(query).sort({ createdAt: -1 }).exec();
    }

    // Find a single task by its ID for a specific user and throw an error if the ID is invalid or the task is not found
    async findOne(userId: string, taskId: string): Promise<Task> {
        if (!mongoose.isValidObjectId(taskId)) {
            throw new BadRequestException('Invalid task id');
        }

        const task = await this.taskModel
            .findOne({ _id: taskId, userId })
            .exec();

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        return task;
    }

    // Update a task by its ID for a specific user with the provided data and throw an error if the ID is invalid or the task is not found
    async update(userId: string, taskId: string, dto: UpdateTaskDto): Promise<Task> {
        if (!mongoose.isValidObjectId(taskId)) {
            throw new BadRequestException('Invalid task id');
        }

        const task = await this.taskModel
            .findOneAndUpdate(
                { _id: taskId, userId },
                { $set: dto },
                { new: true, runValidators: true },
            )
            .exec();

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        return task;
    }

    // Delete a task by its ID for a specific user and throw an error if the ID is invalid or the task is not found
    async delete(userId: string, taskId: string): Promise<void> {
        if (!mongoose.isValidObjectId(taskId)) {
            throw new BadRequestException('Invalid task id');
        }

        const result = await this.taskModel.deleteOne({ _id: taskId, userId }).exec();

        if (result.deletedCount === 0) {
            throw new NotFoundException('Task not found');
        }
    }
}