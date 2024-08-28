import { NextResponse } from 'next/server'
import PipelineSingleton from './pipeline.js';
import { cryptoCategorizer, getSentiment } from './sentimentAnalysis.js';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

export async function GET(request) {
    const text = request.nextUrl.searchParams.get('text');
    
    if (text) {
        // Sentiment analysis
        const classifier = await PipelineSingleton.getInstance();
        const sentimentResult = await classifier(text);

        // Crypto categorization
        const categories = await cryptoCategorizer(text);

        // Get sentiment explanation
        const explanation = await getSentiment(text, sentimentResult[0].score);

        return NextResponse.json({
            sentiment: sentimentResult[0],
            categories,
            explanation
        });
    } else {
        // Fetch articles
        const csvPath = path.join(process.cwd(), 'public', 'cryptocurrency_news.csv');
        const csvData = fs.readFileSync(csvPath, 'utf8');
        const parsedData = await new Promise((resolve) => {
            Papa.parse(csvData, {
                header: true,
                complete: (result) => resolve(result.data),
            });
        });
        return NextResponse.json(parsedData);
    }
}