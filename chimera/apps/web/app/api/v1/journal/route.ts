import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const MOCK_USER_ID = 'user_2a1b3c4d5e6f7g8h9i0j';
async function ensureMockUser() {
    const user = await prisma.user.findUnique({ where: { id: MOCK_USER_ID } });
    if (!user) { await prisma.user.create({ data: { id: MOCK_USER_ID, email: `mockuser@chimera.project`, name: 'Mock User' } }); }
}
export async function GET() {
  try {
    await ensureMockUser();
    const entries = await prisma.journalEntry.findMany({ where: { userId: MOCK_USER_ID }, orderBy: { createdAt: 'desc' } });
    return NextResponse.json(entries);
  } catch (error) { return new NextResponse('Internal Error', { status: 500 }); }
}
export async function POST(req: Request) {
  try {
    await ensureMockUser();
    const body = await req.json();
    const { observation, hypothesis, check_plan, tags } = body;
    if (!observation) return new NextResponse('Observation is required', { status: 400 });
    const newEntry = await prisma.journalEntry.create({ data: { userId: MOCK_USER_ID, observation, hypothesis, check_plan, tags } });
    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) { return new NextResponse('Internal Error', { status: 500 }); }
}
