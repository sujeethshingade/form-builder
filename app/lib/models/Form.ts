import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILOVItem {
  code: string;
  shortName: string;
  description?: string;
  seamlessMapping?: string;
  status: 'Active' | 'Inactive';
}

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
  widthColumns?: number;
  name?: string;
  default?: any;
  disabled?: boolean;
  readonly?: boolean;

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
  // Custom field reference for LOV-based fields (dropdown, checkbox, radio)
  customFieldId?: string;
  lovItems?: ILOVItem[];
}

export interface IFormStyles {
  backgroundColor: string;
  textColor: string;
  primaryColor: string;
  borderRadius: number;
  fontFamily: string;
}

export interface IFormJson {
  fields: IFormField[];
  styles: IFormStyles;
}

export interface IForm extends Document {
  collectionName: string;
  formName: string;
  formJson: IFormJson;
  createdAt: Date;
  updatedAt: Date;
}

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
  formJson: {
    type: Schema.Types.Mixed,
    default: {
      fields: [],
      styles: {
        backgroundColor: '#ffffff',
        textColor: '#1e293b',
        primaryColor: '#0ea5e9',
        borderRadius: 8,
        fontFamily: 'Inter, sans-serif',
      },
    },
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
