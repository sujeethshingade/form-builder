import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILOVItem {
  code: string;
  shortName: string;
  description?: string;
  seamlessMapping?: string;
  status: 'Active' | 'Inactive';
}

export interface ICustomField extends Document {
  fieldName: string;
  fieldLabel: string;
  dataType: 'text' | 'textarea' | 'number' | 'email' | 'date' | 'select' | 'radio' | 'checkbox' | 'file' | 'url';
  className?: string;
  category: string;
  lovType?: 'user-defined' | 'api';
  lovItems?: ILOVItem[];
  createdAt: Date;
  updatedAt: Date;
}

const LOVItemSchema = new Schema({
  code: { type: String, required: true },
  shortName: { type: String, required: true },
  description: { type: String },
  seamlessMapping: { type: String },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
});

const CustomFieldSchema = new Schema<ICustomField>({
  fieldName: { 
    type: String, 
    required: true,
    unique: true,
    trim: true,
  },
  fieldLabel: { 
    type: String, 
    required: true,
    trim: true,
  },
  dataType: { 
    type: String, 
    required: true,
    enum: ['text', 'textarea', 'number', 'email', 'date', 'select', 'radio', 'checkbox', 'file', 'url'],
  },
  className: { 
    type: String,
    trim: true,
  },
  category: { 
    type: String, 
    required: true,
    trim: true,
  },
  lovType: {
    type: String,
    enum: ['user-defined', 'api'],
  },
  lovItems: [LOVItemSchema],
}, {
  timestamps: true,
});

// Prevent model recompilation error in Next.js
const CustomField: Model<ICustomField> = mongoose.models.CustomField || mongoose.model<ICustomField>('CustomField', CustomFieldSchema);

export default CustomField;
