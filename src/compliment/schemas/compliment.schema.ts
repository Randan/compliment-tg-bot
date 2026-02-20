import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class ComplimentDoc extends Document {
  @Prop({ required: true })
  value: string;
}

export const ComplimentSchema = SchemaFactory.createForClass(ComplimentDoc);
