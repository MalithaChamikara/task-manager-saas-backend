import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = Document<User>;

@Schema({ timestamps: true })
export class User {
    @Prop({ type: String, required: true, unique: true, index: true })
    email: string;

    @Prop({ type: String, required: true, select: false })
    passwordHash: string;
    
    @Prop({ type: String, select: false, default: null })
    refreshTokenHash?: string | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
