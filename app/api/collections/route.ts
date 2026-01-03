import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import Collection from '@/app/lib/models/Collection';

// GET all collections
export async function GET() {
  try {
    await connectDB();
    
    const collections = await Collection.find()
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json({ success: true, data: collections });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}

// POST create new collection
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { name, description } = body;
    
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }
    
    // Check if collection name already exists
    const existingCollection = await Collection.findOne({ name: name });
    if (existingCollection) {
      return NextResponse.json(
        { success: false, error: 'A collection with this name already exists' },
        { status: 400 }
      );
    }
    
    const collection = await Collection.create({
      name: name,
      description,
    });
    
    return NextResponse.json({ success: true, data: collection }, { status: 201 });
  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create collection' },
      { status: 500 }
    );
  }
}
