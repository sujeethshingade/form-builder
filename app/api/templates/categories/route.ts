import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import Template from '@/app/lib/models/Template';

// GET all unique categories
export async function GET() {
  try {
    await connectDB();
    
    const categories = await Template.distinct('category');
    
    return NextResponse.json({
      success: true,
      data: categories.sort(),
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
