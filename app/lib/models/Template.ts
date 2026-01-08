import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITemplateField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  helper?: string;
  required?: boolean;
  options?: string[];
  width?: 'full' | 'half';
  widthPercent?: number;
  name?: string;
  default?: any;
  disabled?: boolean;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  inputType?: string;
  addons?: { before?: string; after?: string };
  min?: number | string | null;
  max?: number | string | null;
  step?: number;
  format?: string;
  minDate?: string;
  maxDate?: string;
  items?: { value: string | number; label: string; disabled?: boolean }[];
  view?: 'tabs' | 'blocks' | 'default';
  labelPosition?: 'left' | 'right';
  content?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  align?: 'left' | 'center' | 'right';
  height?: string;
  columns?: any[];
  rows?: Record<string, any>[];
}

export interface ITemplate extends Document {
  name: string;
  description?: string;
  category: string;
  fields: ITemplateField[];
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema = new Schema<ITemplate>({
  name: { 
    type: String, 
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: { 
    type: String, 
    required: true,
    trim: true,
  },
  fields: {
    type: Schema.Types.Mixed,
    default: [],
  },
}, {
  timestamps: true,
});

TemplateSchema.index({ category: 1 });
TemplateSchema.index({ name: 1 });
TemplateSchema.index({ createdAt: -1 });

// Clear cached model to ensure schema changes are applied
if (mongoose.models.Template) {
  delete mongoose.models.Template;
}

// Create or retrieve the model
const Template: Model<ITemplate> = mongoose.model<ITemplate>('Template', TemplateSchema);

export default Template;
