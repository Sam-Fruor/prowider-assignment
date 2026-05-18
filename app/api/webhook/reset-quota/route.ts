import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { eventId, providerId } = await req.json();

  if (!eventId || !providerId) {
    return NextResponse.json({ error: 'Missing eventId or providerId' }, { status: 400 });
  }

  try {
    await prisma.processedWebhook.create({
      data: { eventId }
    });

    await prisma.provider.update({
      where: { id: providerId },
      data: { quota: 10 }
    });

    return NextResponse.json({ success: true, message: 'Quota reset successfully.' });

  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ success: true, message: 'Webhook already processed.' });
    }
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}