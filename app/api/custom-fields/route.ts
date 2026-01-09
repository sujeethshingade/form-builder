import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import CustomField from '@/app/lib/models/CustomField';

// GET all custom fields (with optional category filter)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    let query: any = {};
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { fieldName: { $regex: search, $options: 'i' } },
        { fieldLabel: { $regex: search, $options: 'i' } },
      ];
    }
    
    const customFields = await CustomField.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: customFields });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch custom fields' },
      { status: 500 }
    );
  }
}

// POST create new custom field
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { fieldName, fieldLabel, dataType, className, category, lovEnabled, lovType, disableSorting, lovItems } = body;
    
    if (!fieldName || !fieldLabel || !dataType || !category) {
      return NextResponse.json(
        { success: false, error: 'Field name, label, data type, and category are required' },
        { status: 400 }
      );
    }
    
    const customField = await CustomField.create({
      fieldName,
      fieldLabel,
      dataType,
      className,
      category,
      lovEnabled: lovEnabled || false,
      lovType,
      disableSorting,
      lovItems: lovItems || [],
    });
    
    return NextResponse.json({ success: true, data: customField }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'A custom field with this name already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create custom field' },
      { status: 500 }
    );
  }
}
