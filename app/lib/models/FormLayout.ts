import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFormLayoutField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  helper?: string;
  required?: boolean;
  options?: string[];
  width?: 'full' | 'half';
  widthPercent?: number;
  widthColumns?: number;
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

export interface IFormLayout extends Document {
  layoutName: string;
  layoutType: 'form-group' | 'grid-layout';
  category?: string;
  fields: IFormLayoutField[];
  createdAt: Date;
  updatedAt: Date;
}

const FormLayoutSchema = new Schema<IFormLayout>({
  layoutName: { 
    type: String, 
    required: true,
    unique: true,
    trim: true,
  },
  layoutType: { 
    type: String, 
    required: true,
    enum: ['form-group', 'grid-layout'],
  },
  category: {
    type: String,
    trim: true,
  },
  fields: {
    type: Schema.Types.Mixed,
    default: [],
  },
}, {
  timestamps: true,
});

FormLayoutSchema.index({ layoutType: 1 });
FormLayoutSchema.index({ category: 1 });
FormLayoutSchema.index({ createdAt: -1 });

// Clear cached model to ensure schema changes are applied
if (mongoose.models.FormLayout) {
  delete mongoose.models.FormLayout;
}

// Create or retrieve the model
const FormLayout: Model<IFormLayout> = mongoose.model<IFormLayout>('FormLayout', FormLayoutSchema);

export default FormLayout;
