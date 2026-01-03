import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import Form from '@/app/lib/models/Form';

// GET all forms
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const collectionName = searchParams.get('collection');
    
    const query = collectionName ? { collectionName } : {};
    
    const forms = await Form.find(query)
      .sort({ createdAt: -1 })
      .select('collectionName formName createdAt updatedAt')
      .lean();
    
    return NextResponse.json({ success: true, data: forms });
  } catch (error) {
    console.error('Error fetching forms:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch forms' },
      { status: 500 }
    );
  }
}

// POST create new form
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { collectionName, formName, fields, styles, surveyJson } = body;
    
    if (!collectionName || !formName) {
      return NextResponse.json(
        { success: false, error: 'Collection name and form name are required' },
        { status: 400 }
      );
    }
    
    // Check if form name already exists
    const existingForm = await Form.findOne({ formName: formName });
    if (existingForm) {
      return NextResponse.json(
        { success: false, error: 'A form with this name already exists' },
        { status: 400 }
      );
    }
    
    const form = await Form.create({
      collectionName,
      formName: formName,
      fields: fields || [],
      styles: styles || {},
      surveyJson: surveyJson || null,
    });
    
    return NextResponse.json({ success: true, data: form }, { status: 201 });
  } catch (error) {
    console.error('Error creating form:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create form' },
      { status: 500 }
    );
  }
}
