import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import FormLayout from '@/app/lib/models/FormLayout';

// GET single form layout by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    const layout = await FormLayout.findById(id).lean();
    
    if (!layout) {
      return NextResponse.json(
        { success: false, error: 'Form layout not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: layout });
  } catch (error) {
    console.error('Error fetching form layout:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch form layout' },
      { status: 500 }
    );
  }
}

// PUT update form layout
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const body = await request.json();
    const { layoutName, category, fields, layoutConfig } = body;
    
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };
    
    if (layoutName) {
      updateData.layoutName = layoutName;
    }
    if (category !== undefined) {
      updateData.category = category;
    }
    if (fields) {
      updateData.fields = fields;
    }
    if (layoutConfig !== undefined) {
      updateData.layoutConfig = layoutConfig;
    }
    
    const layout = await FormLayout.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).lean();
    
    if (!layout) {
      return NextResponse.json(
        { success: false, error: 'Form layout not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: layout });
  } catch (error) {
    console.error('Error updating form layout:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update form layout' },
      { status: 500 }
    );
  }
}

// DELETE form layout
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    const layout = await FormLayout.findByIdAndDelete(id);
    
    if (!layout) {
      return NextResponse.json(
        { success: false, error: 'Form layout not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Form layout deleted successfully' });
  } catch (error) {
    console.error('Error deleting form layout:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete form layout' },
      { status: 500 }
    );
  }
}
