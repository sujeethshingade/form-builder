import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICollection extends Document {
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CollectionSchema = new Schema<ICollection>({
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
}, {
  timestamps: true,
});

CollectionSchema.index({ createdAt: -1 });

// Clear cached model to ensure schema changes are applied
if (mongoose.models.Collection) {
  delete mongoose.models.Collection;
}

// Create or retrieve the model
const Collection: Model<ICollection> = mongoose.model<ICollection>('Collection', CollectionSchema);

export default Collection;
