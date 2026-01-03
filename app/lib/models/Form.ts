import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFormField {
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

export interface IFormStyles {
  backgroundColor: string;
  textColor: string;
  primaryColor: string;
  borderRadius: number;
  fontFamily: string;
}

export interface IForm extends Document {
  collectionName: string;
  formName: string;
  fields: IFormField[];
  styles: IFormStyles;
  surveyJson: any;
  createdAt: Date;
  updatedAt: Date;
}

const FormFieldSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  label: { type: String, required: true },
  placeholder: String,
  helper: String,
  required: Boolean,
  options: [String],
  width: { type: String, enum: ['full', 'half'] },
  widthPercent: Number,
  name: String,
  default: Schema.Types.Mixed,
  disabled: Boolean,
  readonly: Boolean,
  size: { type: String, enum: ['sm', 'md', 'lg'] },
  inputType: String,
  addons: {
    before: String,
    after: String,
  },
  min: Schema.Types.Mixed,
  max: Schema.Types.Mixed,
  step: Number,
  format: String,
  minDate: String,
  maxDate: String,
  items: [{
    value: Schema.Types.Mixed,
    label: String,
    disabled: Boolean,
  }],
  view: { type: String, enum: ['tabs', 'blocks', 'default'] },
  labelPosition: { type: String, enum: ['left', 'right'] },
  content: String,
  tag: { type: String, enum: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] },
  align: { type: String, enum: ['left', 'center', 'right'] },
  height: String,
  columns: [Schema.Types.Mixed],
  rows: [Schema.Types.Mixed],
}, { _id: false });

const FormStylesSchema = new Schema({
  backgroundColor: { type: String, default: '#ffffff' },
  textColor: { type: String, default: '#1e293b' },
  primaryColor: { type: String, default: '#0ea5e9' },
  borderRadius: { type: Number, default: 8 },
  fontFamily: { type: String, default: 'Inter, sans-serif' },
}, { _id: false });

const FormSchema = new Schema<IForm>({
  collectionName: { 
    type: String, 
    required: true,
    trim: true,
  },
  formName: { 
    type: String, 
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  fields: [FormFieldSchema],
  styles: {
    type: FormStylesSchema,
    default: () => ({}),
  },
  surveyJson: {
    type: Schema.Types.Mixed,
    default: null,
  },
}, {
  timestamps: true,
});

FormSchema.index({ collectionName: 1 });
FormSchema.index({ createdAt: -1 });

// Clear cached model to ensure schema changes are applied
if (mongoose.models.Form) {
  delete mongoose.models.Form;
}

// Create or retrieve the model
const Form: Model<IForm> = mongoose.model<IForm>('Form', FormSchema);

export default Form;
