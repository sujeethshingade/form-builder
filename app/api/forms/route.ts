import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import Form from '@/app/lib/models/Form';

// GET all forms
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const collectionName = searchParams.get('collection');
    const search = searchParams.get('search');

    const query: Record<string, any> = {};
    if (collectionName) {
      query.collectionName = collectionName;
    }
    if (search) {
      query.formName = { $regex: search, $options: 'i' };
    }

    const forms = await Form.find(query)
      .sort({ createdAt: -1 })
      .select('collectionName formName createdAt updatedAt')
      .lean();

    return NextResponse.json({ success: true, data: forms });
  } catch (error) {
    console.error('Error fetching forms:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch forms';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// POST create new form
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { collectionName, formName, formJson } = body;

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

    const defaultFormJson = {
      fields: [],
      styles: {
        backgroundColor: '#ffffff',
        textColor: '#1e293b',
        primaryColor: '#0ea5e9',
        borderRadius: 8,
        fontFamily: 'Inter, sans-serif',
      },
    };

    const form = await Form.create({
      collectionName,
      formName: formName,
      formJson: formJson || defaultFormJson,
    });

    return NextResponse.json({ success: true, data: form }, { status: 201 });
  } catch (error) {
    console.error('Error creating form:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create form';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
