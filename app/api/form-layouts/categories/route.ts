import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import FormLayout from '@/app/lib/models/FormLayout';

// GET all unique categories
export async function GET() {
  try {
    await connectDB();
    
    const categories = await FormLayout.distinct('category');
    
    // Filter out null/undefined/empty categories
    const validCategories = categories.filter((cat: any) => cat && cat.trim() !== '');
    
    return NextResponse.json({ success: true, data: validCategories });
  } catch (error) {
    console.error('Error fetching form layout categories:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch categories';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
