import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { TaskPriority, TaskStatus } from './create-task.dto';

export class FindTasksDto {
    @IsOptional()
    @IsEnum(TaskStatus)
    status?: TaskStatus;

    @IsOptional()
    @IsEnum(TaskPriority)
    priority?: TaskPriority;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    q?: string;
}