import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import FormLayout from '@/app/lib/models/FormLayout';

// GET all form layouts
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const layoutType = searchParams.get('type');
    const category = searchParams.get('category');
    
    const query: Record<string, any> = {};
    if (layoutType) {
      query.layoutType = layoutType;
    }
    if (category) {
      query.category = category;
    }
    
    const layouts = await FormLayout.find(query)
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json({ success: true, data: layouts });
  } catch (error) {
    console.error('Error fetching form layouts:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch form layouts';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// POST create new form layout
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { layoutName, layoutType, category, fields } = body;
    
    if (!layoutName || !layoutType) {
      return NextResponse.json(
        { success: false, error: 'Layout name and type are required' },
        { status: 400 }
      );
    }
    
    if (!['form-group', 'box-layout'].includes(layoutType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid layout type. Must be "form-group" or "box-layout"' },
        { status: 400 }
      );
    }
    
    // Check if layout name already exists
    const existingLayout = await FormLayout.findOne({ layoutName });
    if (existingLayout) {
      return NextResponse.json(
        { success: false, error: 'A layout with this name already exists' },
        { status: 400 }
      );
    }
    
    const layout = await FormLayout.create({
      layoutName,
      layoutType,
      category,
      fields: fields || [],
    });
    
    return NextResponse.json({ success: true, data: layout }, { status: 201 });
  } catch (error) {
    console.error('Error creating form layout:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create form layout';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
