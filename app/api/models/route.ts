import { NextResponse } from 'next/server';
import { MODELS, getModelsByCategory } from '@/lib/models';

export async function GET() {
  try {
    const modelsByCategory = MODELS.reduce((acc, model) => {
      model.category.forEach(cat => {
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(model);
      });
      return acc;
    }, {} as Record<string, typeof MODELS>);

    return NextResponse.json({
      models: MODELS,
      categories: Object.keys(modelsByCategory),
      modelsByCategory,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}