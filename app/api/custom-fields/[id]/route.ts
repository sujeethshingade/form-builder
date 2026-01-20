import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import CustomField from '@/app/lib/models/CustomField';

// GET single custom field
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const customField = await CustomField.findById(id);

    if (!customField) {
      return NextResponse.json(
        { success: false, error: 'Custom field not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: customField });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch custom field' },
      { status: 500 }
    );
  }
}

// PUT update custom field
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const customField = await CustomField.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!customField) {
      return NextResponse.json(
        { success: false, error: 'Custom field not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: customField });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'A custom field with this name already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update custom field' },
      { status: 500 }
    );
  }
}

// DELETE custom field
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const customField = await CustomField.findByIdAndDelete(id);

    if (!customField) {
      return NextResponse.json(
        { success: false, error: 'Custom field not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: customField });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete custom field' },
      { status: 500 }
    );
  }
}
