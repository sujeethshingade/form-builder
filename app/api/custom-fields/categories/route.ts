import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import CustomField from '@/app/lib/models/CustomField';

// GET all unique categories
export async function GET() {
  try {
    await connectDB();
    
    const categories = await CustomField.distinct('category');
    
    return NextResponse.json({ success: true, data: categories.sort() });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
