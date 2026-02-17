import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type TaskDocument = Document<Task>;

export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

@Schema({ timestamps: true })
export class Task {
    @Prop({
        type: String,
        required: true,
        trim: true,
    })
    title: string;

    @Prop({
        type: String,
        default: null,
        trim: true,
    })
    description?: string | null;

    @Prop({
        type: String,
        enum: ['todo', 'in-progress', 'done'],
        default: 'todo',
    })
    status: TaskStatus;

    @Prop({
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
    })
    priority: TaskPriority;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    })
    userId: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);