import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Put,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { FindTasksDto } from './dto/get-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

type AuthRequest = Request & {
    user: {
        userId: string;
        email: string;
    };
};

@UseGuards(JwtAuthGuard) // Protect all routes in this controller with JWT authentication
@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    // POST /tasks
    // create a new task for the authenticated user using the provided data in the request body and return the created task
    @Post()
    create(@Req() req: AuthRequest, @Body() dto: CreateTaskDto) {
        return this.tasksService.create(req.user.userId, dto);
    }

    // GET /tasks
    // find all tasks for the authenticated user with optional filters for status, priority, and search query and return the list of tasks
    @Get()
    findAll(@Req() req: AuthRequest, @Query() query: FindTasksDto) {
        return this.tasksService.findAll(req.user.userId, query);
    }

    // GET /tasks/:id
    // find a single task by its ID for the authenticated user and return the task details 
    @Get(':id')
    findOne(@Req() req: AuthRequest, @Param('id') id: string) {
        return this.tasksService.findOne(req.user.userId, id);
    }

    // PUT /tasks/:id
    // update a task by its ID for the authenticated user with the provided data in the request body and return the updated task details
    @Put(':id')
    update(
        @Req() req: AuthRequest,
        @Param('id') id: string,
        @Body() dto: UpdateTaskDto,
    ) {
        return this.tasksService.update(req.user.userId, id, dto);
    }

    // DELETE /tasks/:id
    // delete a task by its ID for the authenticated user and return a confirmation of deletion
    @Delete(':id')
    async remove(@Req() req: AuthRequest, @Param('id') id: string) {
        await this.tasksService.delete(req.user.userId, id);
        return { deleted: true };
    }
}