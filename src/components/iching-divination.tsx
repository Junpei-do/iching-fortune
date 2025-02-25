// iching-divination.tsx を開いて次のように修正してください

"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Papa from 'papaparse';

// CSVデータの型を定義
interface FortuneData {
  hexagram_id: number;
  hexagram_name: string;
  line_number: number;
  fortune_value: number;
  fortune_text: string;
  interpretation: string;
}

export function IChingDivination() {
  // 型を明示的に指定
  const [fortuneData, setFortuneData] = useState<FortuneData[]>([]);
  const [currentResult, setCurrentResult] = useState<FortuneData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/utf_ekikyo_data.csv');
        const text = await response.text();
        
        Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            // 型アサーションを使用
            const data = results.data as FortuneData[];
            setFortuneData(data.filter(row => row.hexagram_id));
            setLoading(false);
          }
        });
      } catch (error) {
        console.error('データの読み込みエラー:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const castDivination = () => {
    // 全64卦から一つをランダムに選ぶ
    const allHexagrams = [...new Set(fortuneData.map(row => row.hexagram_id))];
    const randomHexagramId = allHexagrams[Math.floor(Math.random() * allHexagrams.length)];
    
    // 選ばれた卦の6つの爻から一つをランダムに選ぶ
    const hexagramLines = fortuneData.filter(row => row.hexagram_id === randomHexagramId);
    const randomLine = hexagramLines[Math.floor(Math.random() * hexagramLines.length)];
    
    setCurrentResult(randomLine);
  };

  const getFortuneBgColor = (fortune_value) => {
    switch (fortune_value) {
      case 2: return 'bg-red-50 border-red-200';  // 大吉
      case 1: return 'bg-orange-50 border-orange-200';  // 吉
      case 0: return 'bg-slate-50 border-slate-200';  // 平
      case -1: return 'bg-blue-50 border-blue-200';  // 凶
      default: return 'bg-white';
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4">
        <Card>
          <CardContent>
            <div className="text-center p-8">易経データを読み込んでいます...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <Card className="bg-slate-50">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold text-slate-800">易経占い</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-6">
            <Button 
              onClick={castDivination}
              className="w-full max-w-xs text-lg bg-red-800 hover:bg-red-900 transition-colors"
            >
              占いを始める
            </Button>

            {currentResult && (
              <div className={`w-full p-6 rounded-lg border ${getFortuneBgColor(currentResult.fortune_value)} transition-all duration-300`}>
                <div className="text-2xl font-bold mb-4 text-center border-b pb-4">
                  第{currentResult.hexagram_id}卦：{currentResult.hexagram_name}
                </div>
                <div className="text-xl mb-2 text-slate-700">
                  第{currentResult.line_number}爻
                </div>
                <div className="text-2xl font-bold text-red-800 mb-4 text-center">
                  {currentResult.fortune_text}
                </div>
                <div className="text-lg leading-relaxed whitespace-pre-wrap text-slate-600">
                  {currentResult.interpretation}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}