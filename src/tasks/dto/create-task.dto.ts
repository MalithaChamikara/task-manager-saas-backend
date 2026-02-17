import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export enum TaskStatus {
    Todo = 'todo',
    InProgress = 'in-progress',
    Done = 'done',
}

export enum TaskPriority {
    Low = 'low',
    Medium = 'medium',
    High = 'high',
}

export class CreateTaskDto {
    @IsString()
    @MinLength(1)
    @MaxLength(200)
    title: string;

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    description?: string;

    @IsOptional()
    @IsEnum(TaskStatus)
    status?: TaskStatus;

    @IsOptional()
    @IsEnum(TaskPriority)
    priority?: TaskPriority;
}