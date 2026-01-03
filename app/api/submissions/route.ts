import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import Submission from '@/app/lib/models/Submission';

// GET all submissions for a form
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('formId');
    const collectionName = searchParams.get('collection');
    
    const filter: any = {};
    if (formId) filter.formId = formId;
    if (collectionName) filter.collectionName = collectionName;
    
    const submissions = await Submission.find(filter)
      .sort({ createdAt: -1 })
      .limit(100);
    
    return NextResponse.json({ success: true, data: submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

// POST create a new submission
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { formId, collectionName, formName, data } = body;
    
    if (!formId || !collectionName || !formName) {
      return NextResponse.json(
        { success: false, error: 'Form ID, collection name, and form name are required' },
        { status: 400 }
      );
    }
    
    const submission = await Submission.create({
      formId,
      collectionName,
      formName,
      data: data || {},
    });
    
    return NextResponse.json({ success: true, data: submission }, { status: 201 });
  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create submission' },
      { status: 500 }
    );
  }
}
