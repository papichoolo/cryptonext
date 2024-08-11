"use client";

import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

const NewsItem = ({ article, onAnalyzeSentiment, modelLoading }) => {
  const [sentiment, setSentiment] = useState(null);

  return (
    <Card className="mb-4 overflow-hidden">
      <div className="flex">
        <div className="flex-grow">
          <CardHeader className="p-4">
            <h2 className="text-xl font-bold">{article.title}</h2>
            <p className="text-sm text-gray-500">{article.source} • {new Date(article.publishedAt).toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-sm">{article.description}</p>
            {sentiment && (
              <p className="mt-2 text-sm font-semibold">
                Sentiment: {sentiment.label} ({(sentiment.score * 100).toFixed(2)}%)
              </p>
            )}
          </CardContent>
        </div>
        {article.urlToImage && (
          <div className="w-1/4 min-w-[100px] max-w-[200px] p-4 flex items-center">
            <img src={article.urlToImage} alt={article.title} className="w-full h-auto object-cover rounded" />
          </div>
        )}
      </div>
      <CardFooter className="p-4 flex justify-between items-center border-t">
        <div className="flex items-center space-x-2">
          <span className="text-sm">👍 {article.upvotes || 0}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm">💬 {article.comments || 0} comments</span>
        </div>
        <button
          onClick={() => onAnalyzeSentiment(article.description, setSentiment)}
          disabled={modelLoading}
          className="bg-blue-500 text-white py-1 px-3 rounded disabled:bg-gray-500"
        >
          {modelLoading ? 'Loading Model...' : 'Analyze Sentiment'}
        </button>
      </CardFooter>
    </Card>
  );
};

const Page = () => {
  const [articles, setArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modelLoading, setModelLoading] = useState(true);

  useEffect(() => {
    fetch('/cryptocurrency_news.csv')
      .then(response => response.text())
      .then(csvData => {
        Papa.parse(csvData, {
          header: true,
          complete: (result) => {
            const parsedArticles = result.data.map(article => ({
              ...article,
              upvotes: Number(article.upvotes),
              comments: Number(article.comments),
              source: article.source || '', // Ensure source is correctly passed
            }));
            setArticles(parsedArticles);
          },
        });
      })
      .catch(error => console.error('Error loading CSV:', error));
    
    // Initialize the worker and check if the model is loaded
    const worker = new Worker(new URL('worker.js', import.meta.url));
    worker.postMessage({ text: 'Test Model Loading' });
    worker.onmessage = (event) => {
      if (event.data.status === 'complete') {
        setModelLoading(false);
      }
    };

    // Cleanup the worker
    return () => worker.terminate();
  }, []);

  // Function to analyze sentiment
  const analyzeSentiment = (text, setSentiment) => {
    const worker = new Worker(new URL('worker.js', import.meta.url));
    worker.postMessage({ text });
    worker.onmessage = (event) => {
      if (event.data.status === 'complete') {
        setSentiment(event.data.output[0]);
      }
    };
    worker.onerror = (error) => {
      console.error('Worker error:', error);
    };
  };

  // Filter articles based on the search query
  const filteredArticles = articles.filter(article => 
    (article.title?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
    (article.description?.toLowerCase().includes(searchQuery.toLowerCase()) || '')
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Reddit-style News</h1>
      <input 
        type="text"
        placeholder="Search articles..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full p-2 mb-6 border border-gray-300 rounded"
      />
      {filteredArticles.length === 0 ? (
        <p>No articles found.</p>
      ) : (
        filteredArticles.map((article, index) => (
          <NewsItem 
            key={index} 
            article={article} 
            onAnalyzeSentiment={analyzeSentiment} 
            modelLoading={modelLoading} 
          />
        ))
      )}
    </div>
  );
};

export default Page;
