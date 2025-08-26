import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CHAOS_ATOMS = [
  { source: 'Heraclitus', content: 'No man ever steps in the same river twice, for it''s not the same river and he''s not the same man.' },
  { source: 'Gödel', content: 'Either mathematics is too big for the human mind or the human mind is more than a machine.' },
  { source: 'Shakespeare', content: 'We are such stuff as dreams are made on, and our little life is rounded with a sleep.' },
  { source: 'Nietzsche', content: 'And those who were seen dancing were thought to be insane by those who could not hear the music.' },
  { source: 'Philip K. Dick', content: 'Reality is that which, when you stop believing in it, doesn''t go away.' },
];

// In a real scenario, this would be a protected endpoint.
export async function GET() {
  try {
    const randomIndex = Math.floor(Math.random() * CHAOS_ATOMS.length);
    const atom = CHAOS_ATOMS[randomIndex];

    const newMemory = await prisma.systemMemory.create({
      data: {
        type: 'chaos_atom',
        content: atom.content,
        source: atom.source,
      },
    });

    return NextResponse.json({ success: true, injected_atom: newMemory });
  } catch (error) {
    console.error('[CHAOS_API]', error);
    return new NextResponse('Internal Error while injecting chaos.', { status: 500 });
  }
}
