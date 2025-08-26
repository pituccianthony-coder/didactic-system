import { NextResponse } from 'next/server';
const SIM_LAB_HOST = process.env.SIM_LAB_HOST || 'http://sim-lab:8000';
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const simLabResponse = await fetch(`${SIM_LAB_HOST}/run/montecarlo`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!simLabResponse.ok) throw new Error('Sim-Lab service failed');
    const data = await simLabResponse.json();
    return NextResponse.json(data);
  } catch (error) { return new NextResponse('Internal Error', { status: 500 }); }
}
