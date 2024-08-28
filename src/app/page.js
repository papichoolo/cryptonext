'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

const NewsItem = ({ article, onAnalyzeSentiment }) => {
  const [sentimentInfo, setSentimentInfo] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyzeSentiment = async () => {
    setIsAnalyzing(true);
    try {
      const result = await onAnalyzeSentiment(article.description);
      setSentimentInfo(result);
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
    }
    setIsAnalyzing(false);
  };

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
            {sentimentInfo && (
              <div className="mt-4">
                <p className="font-semibold">Sentiment: {sentimentInfo.sentiment.label} ({(sentimentInfo.sentiment.score * 100).toFixed(2)}%)</p>
                <p className="mt-2"><strong>Categories:</strong></p>
                <ul className="list-disc pl-5">
                  {sentimentInfo.categories.map((category, index) => (
                    <li key={index}>{category.name} - {category.category}</li>
                  ))}
                </ul>
                <p className="mt-2"><strong>Explanation:</strong></p>
                <p className="text-sm">{sentimentInfo.explanation}</p>
              </div>
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
          onClick={handleAnalyzeSentiment}
          disabled={isAnalyzing}
          className="bg-blue-500 text-white py-1 px-3 rounded disabled:bg-gray-500"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Sentiment'}
        </button>
      </CardFooter>
    </Card>
  );
};

export default function Page() {
  const [articles, setArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/classify')
      .then(response => response.json())
      .then(data => setArticles(data))
      .catch(error => console.error('Error fetching articles:', error));
  }, []);

  const filteredArticles = articles.filter(article => 
    (article.title?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
    (article.description?.toLowerCase().includes(searchQuery.toLowerCase()) || '')
  );

  const analyzeSentiment = async (text) => {
    const response = await fetch(`/classify?text=${encodeURIComponent(text)}`);
    return response.json();
  };

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
          />
        ))
      )}
    </div>
  );
}