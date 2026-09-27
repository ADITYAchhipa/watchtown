import { NextRequest, NextResponse } from 'next/server';
import { getReviews, addReview, deleteReview, updateReviews } from '@/lib/reviews';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const reviews = await getReviews();
    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    console.error('Failed to get reviews:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.watchImage && !body.url) {
      return NextResponse.json(
        { success: false, error: 'watchImage or url is required' },
        { status: 400 }
      );
    }

    const newReview = await addReview({
      watchImage: body.watchImage || body.url,
      watchModel: body.watchModel || body.caption || 'Luxury Timepiece',
      replyMessage: body.replyMessage || 'Parcel received safely! The finishing and weight are outstanding. 100% satisfied!',
      phone: body.phone,
      reaction: body.reaction,
    });

    const reviews = await getReviews();
    return NextResponse.json({ success: true, review: newReview, reviews });
  } catch (error: any) {
    console.error('Failed to add review:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add review' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');
    if (!idParam) {
      return NextResponse.json(
        { success: false, error: 'id query param is required' },
        { status: 400 }
      );
    }

    await deleteReview(Number(idParam));
    const reviews = await getReviews();
    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    console.error('Failed to delete review:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete review' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.reviews || !Array.isArray(body.reviews)) {
      return NextResponse.json(
        { success: false, error: 'reviews array is required' },
        { status: 400 }
      );
    }

    const reviews = await updateReviews(body.reviews);
    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    console.error('Failed to update reviews:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update reviews' },
      { status: 500 }
    );
  }
}
