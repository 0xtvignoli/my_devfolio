import { NextResponse } from 'next/server';
import { generateScenario } from '@/ai/flows/generate-scenario';

export async function GET() {
  try {
    const scenario = await generateScenario();
    return NextResponse.json(scenario, { status: 200 });
  } catch (e) {
    console.error('Error generating scenario', e);
    return NextResponse.json({ error: 'Failed to generate scenario' }, { status: 500 });
  }
}
