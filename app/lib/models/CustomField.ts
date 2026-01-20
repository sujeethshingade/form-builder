import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILOVItem {
  code: string;
  shortName: string;
  description?: string;
  seamlessMapping?: string;
  status: 'Active' | 'Inactive';
}

export interface ITableColumn {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  customFieldId?: string;
  options?: Array<{ value: string | number; label: string }> | ILOVItem[];
}

export interface ICustomField extends Document {
  fieldName: string;
  fieldLabel: string;
  dataType: 'text' | 'number' | 'email' | 'date' | 'dropdown' | 'radio' | 'checkbox' | 'heading' | 'divider' | 'spacer' | 'table';
  className?: string;
  category: string;
  lovType?: 'user-defined' | 'api';
  lovItems?: ILOVItem[];
  tableColumns?: ITableColumn[];
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

const TableColumnSchema = new Schema({
  name: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, required: true },
  required: { type: Boolean, default: false },
  customFieldId: { type: String },
  options: { type: Schema.Types.Mixed }, // Flexible to handle both LOV and VueformItem formats
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
    enum: ['text', 'number', 'email', 'date', 'dropdown', 'radio', 'checkbox', 'heading', 'divider', 'spacer', 'table'],
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
  tableColumns: [TableColumnSchema],
}, {
  timestamps: true,
});

// Clear cached model to ensure schema changes are applied
if (mongoose.models.CustomField) {
  delete mongoose.models.CustomField;
}

// Prevent model recompilation error in Next.js
const CustomField: Model<ICustomField> = mongoose.model<ICustomField>('CustomField', CustomFieldSchema);

export default CustomField;
