import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILOVItem {
  code: string;
  shortName: string;
  description?: string;
  seamlessMapping?: string;
  status: 'Active' | 'Inactive';
}

export interface IBoxLayoutColumn {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'select' | 'date' | 'checkbox' | 'phone' | 'textarea' | 'url';
  placeholder?: string;
  width?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  phoneConfig?: {
    defaultCountry?: string;
    showCountryCode?: boolean;
  };
}

export interface ICustomField extends Document {
  fieldName: string;
  fieldLabel: string;
  dataType: 'text' | 'number' | 'email' | 'date' | 'select' | 'radio' | 'checkbox' | 'file' | 'url' | 'heading' | 'divider' | 'spacer' | 'table' | 'box-layout';
  className?: string;
  category: string;
  lovType?: 'user-defined' | 'api';
  lovItems?: ILOVItem[];
  boxLayoutColumns?: IBoxLayoutColumn[];
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

const BoxLayoutColumnSchema = new Schema({
  name: { type: String, required: true },
  label: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['text', 'number', 'email', 'select', 'date', 'checkbox', 'phone', 'textarea', 'url'],
    default: 'text'
  },
  placeholder: { type: String },
  width: { type: String },
  required: { type: Boolean, default: false },
  options: [{
    value: { type: String },
    label: { type: String }
  }],
  phoneConfig: {
    defaultCountry: { type: String, default: 'US' },
    showCountryCode: { type: Boolean, default: true }
  }
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
    enum: ['text', 'number', 'email', 'date', 'select', 'radio', 'checkbox', 'file', 'url', 'heading', 'divider', 'spacer', 'table', 'box-layout'],
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
  boxLayoutColumns: [BoxLayoutColumnSchema],
}, {
  timestamps: true,
});

// Prevent model recompilation error in Next.js
const CustomField: Model<ICustomField> = mongoose.models.CustomField || mongoose.model<ICustomField>('CustomField', CustomFieldSchema);

export default CustomField;
