import { NextRequest, NextResponse } from 'next/server';
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
    
    const form = await Form.findByIdAndUpdate(
      id,
      { 
        ...body,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).lean();
    
    if (!form) {
      return NextResponse.json(
        { success: false, error: 'Form not found' },
        { status: 404 }
      );
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
    
    const form = await Form.findByIdAndDelete(id);
    
    if (!form) {
      return NextResponse.json(
        { success: false, error: 'Form not found' },
        { status: 404 }
      );
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
