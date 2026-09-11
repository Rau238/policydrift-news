import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !body.metadata || !body.canvas) {
      return NextResponse.json({ error: 'Invalid project payload' }, { status: 400 });
    }

    const projectId = body.metadata.id || `proj-${Date.now()}`;
    const projectRecord = {
      ...body,
      metadata: {
        ...body.metadata,
        id: projectId,
        updatedAt: new Date().toISOString(),
      },
    };

    return NextResponse.json({
      success: true,
      projectId,
      project: projectRecord,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save project' },
      { status: 500 }
    );
  }
}
