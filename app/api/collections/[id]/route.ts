import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import Collection from '@/app/lib/models/Collection';

// GET single collection by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    const collection = await Collection.findById(id).lean();
    
    if (!collection) {
      return NextResponse.json(
        { success: false, error: 'Collection not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: collection });
  } catch (error) {
    console.error('Error fetching collection:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch collection' },
      { status: 500 }
    );
  }
}

// PUT update collection
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const body = await request.json();
    
    const collection = await Collection.findByIdAndUpdate(
      id,
      { 
        ...body,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).lean();
    
    if (!collection) {
      return NextResponse.json(
        { success: false, error: 'Collection not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: collection });
  } catch (error) {
    console.error('Error updating collection:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update collection' },
      { status: 500 }
    );
  }
}

// DELETE collection
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    const collection = await Collection.findByIdAndDelete(id);
    
    if (!collection) {
      return NextResponse.json(
        { success: false, error: 'Collection not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Collection deleted successfully' });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete collection' },
      { status: 500 }
    );
  }
}
