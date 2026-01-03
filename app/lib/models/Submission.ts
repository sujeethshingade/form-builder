import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubmission extends Document {
  formId: mongoose.Types.ObjectId;
  collectionName: string;
  formName: string;
  data: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>({
  formId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Form',
    required: true,
  },
  collectionName: { 
    type: String, 
    required: true,
    trim: true,
  },
  formName: { 
    type: String, 
    required: true,
    trim: true,
  },
  data: {
    type: Schema.Types.Mixed,
    required: true,
    default: {},
  },
}, {
  timestamps: true,
});

SubmissionSchema.index({ formId: 1 });
SubmissionSchema.index({ collectionName: 1 });
SubmissionSchema.index({ createdAt: -1 });

// Clear cached model to ensure schema changes are applied
if (mongoose.models.Submission) {
  delete mongoose.models.Submission;
}

// Create or retrieve the model
const Submission: Model<ISubmission> = mongoose.model<ISubmission>('Submission', SubmissionSchema);

export default Submission;
