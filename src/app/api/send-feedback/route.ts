import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { feedback, url, userAgent } = await request.json();

    if (!feedback) {
      return NextResponse.json(
        { error: 'Feedback is required' },
        { status: 400 }
      );
    }

    // Send to FormSubmit using FormData (as they expect)
    const formData = new FormData();
    formData.append('message', feedback);
    formData.append('page_url', url || 'Unknown');
    formData.append('user_agent', userAgent || 'Unknown');
    formData.append('_subject', 'New SpecifyThat Feedback');
    formData.append('_template', 'table'); // Nice email formatting

    const response = await fetch('https://formsubmit.co/luke@modrynstudio.com', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      console.error('FormSubmit response not ok:', response.status);
      throw new Error('FormSubmit failed');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json(
      { error: 'Failed to send feedback' },
      { status: 500 }
    );
  }
}
