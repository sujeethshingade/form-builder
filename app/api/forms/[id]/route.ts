import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/app/lib/mongodb';
import Form from '@/app/lib/models/Form';

// GET single form by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const form = await Form.findById(id).lean();

    if (!form) {
      return NextResponse.json(
        { success: false, error: 'Form not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: form });
  } catch (error) {
    console.error('Error fetching form:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch form' },
      { status: 500 }
    );
  }
}

// PUT update form
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const { formJson } = body;

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (formJson) {
      updateData.formJson = formJson;
    }

    const form = await Form.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).lean();

    if (!form) {
      return NextResponse.json(
        { success: false, error: 'Form not found' },
        { status: 404 }
      );
    }

    const db = mongoose.connection.db;
    if (db && form.collectionName) {
      try {
        const targetCollection = db.collection(form.collectionName);
        await targetCollection.updateOne(
          { formId: new mongoose.Types.ObjectId(id) },
          {
            $set: {
              formJson: formJson,
              updatedAt: new Date()
            }
          }
        );
      } catch (updateError) {
        console.warn('Warning updating in collection:', updateError);
      }
    }

    return NextResponse.json({ success: true, data: form });
  } catch (error) {
    console.error('Error updating form:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update form' },
      { status: 500 }
    );
  }
}

// DELETE form
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const existingForm = await Form.findById(id);

    if (!existingForm) {
      return NextResponse.json(
        { success: false, error: 'Form not found' },
        { status: 404 }
      );
    }

    const collectionName = existingForm.collectionName;

    // Delete from Form model
    await Form.findByIdAndDelete(id);

    const db = mongoose.connection.db;
    if (db && collectionName) {
      try {
        const targetCollection = db.collection(collectionName);
        await targetCollection.deleteOne({ formId: new mongoose.Types.ObjectId(id) });
      } catch (deleteError) {
        console.warn('Warning deleting from collection:', deleteError);
      }
    }

    return NextResponse.json({ success: true, message: 'Form deleted successfully' });
  } catch (error) {
    console.error('Error deleting form:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete form' },
      { status: 500 }
    );
  }
}
