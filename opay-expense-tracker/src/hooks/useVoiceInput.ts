import { useState, useEffect, useCallback } from 'react';
import type { VoiceExpenseData } from '../types';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

export const useVoiceInput = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedData, setParsedData] = useState<VoiceExpenseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if Speech Recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  const parseExpenseFromTextWithAI = async (text: string): Promise<VoiceExpenseData> => {
    // Call OpenAI-powered edge function for intelligent parsing
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/ai-voice-parser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voiceText: text }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          return result.data;
        }
      }
    } catch (error) {
      console.error('AI parsing failed, falling back to keyword matching:', error);
    }

    // Fallback to keyword matching if AI fails
    return parseExpenseFromTextFallback(text);
  };

  const parseExpenseFromTextFallback = (text: string): VoiceExpenseData => {
    // Enhanced NLU parser for expense and income data with better pattern matching
    // Expense examples:
    // "I spent 500 dollars on groceries at Whole Foods"
    // "Bought lunch for 25 dollars"
    // "50 dollars taxi"
    // "Paid 100 for dinner at McDonald's"
    // Income examples:
    // "I earned 5000 dollars from freelance"
    // "Received 3000 salary"
    // "Got paid 500 for consulting"

    const data: VoiceExpenseData = {
      amount: null,
      category: null,
      merchant: null,
      notes: null,
      type: 'expense',
      raw_transcript: text,
    };

    const lowerText = text.toLowerCase();

    // Detect if this is income or expense based on keywords
    const incomeKeywords = ['earned', 'received', 'got paid', 'salary', 'freelance', 'bonus', 'refund', 'income', 'payment received'];
    const expenseKeywords = ['spent', 'paid', 'bought', 'purchase', 'cost'];
    
    const hasIncomeKeyword = incomeKeywords.some(keyword => lowerText.includes(keyword));
    const hasExpenseKeyword = expenseKeywords.some(keyword => lowerText.includes(keyword));
    
    // Determine transaction type
    if (hasIncomeKeyword && !hasExpenseKeyword) {
      data.type = 'income';
    } else if (hasExpenseKeyword || (!hasIncomeKeyword && !hasExpenseKeyword)) {
      data.type = 'expense';
    }

    // Enhanced amount extraction with multiple patterns
    // Pattern 1: Number with currency symbols/words
    let amountMatch = text.match(/(\d+(?:\.\d{1,2})?)\s*(?:dollars?|bucks?|naira|₦|\$|usd|ngn)/i);
    
    // Pattern 2: Currency before number
    if (!amountMatch) {
      amountMatch = text.match(/(?:\$|₦)\s*(\d+(?:\.\d{1,2})?)/i);
    }
    
    // Pattern 3: "for X dollars" or "cost X"
    if (!amountMatch) {
      amountMatch = text.match(/(?:for|cost|paid|spent)\s+(\d+(?:\.\d{1,2})?)/i);
    }
    
    // Pattern 4: Just a number (fallback)
    if (!amountMatch) {
      amountMatch = text.match(/\b(\d+(?:\.\d{1,2})?)\b/);
    }
    
    if (amountMatch) {
      data.amount = parseFloat(amountMatch[1]);
    }

    // Enhanced merchant extraction with multiple patterns
    // Pattern 1: "at X" or "from X"
    let merchantMatch = text.match(/(?:at|from)\s+([A-Z][A-Za-z\s&'-]+?)(?:\s+for|\s+on|\s|$)/i);
    
    // Pattern 2: After category keywords
    if (!merchantMatch) {
      merchantMatch = text.match(/(?:groceries|food|lunch|dinner|breakfast|coffee)\s+(?:at|from)\s+([A-Z][A-Za-z\s&'-]+?)(?:\s|$)/i);
    }
    
    // Pattern 3: Common store/restaurant names (capitalized words)
    if (!merchantMatch) {
      const capitalizedWords = text.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/);
      if (capitalizedWords && capitalizedWords[1].length > 3) {
        merchantMatch = capitalizedWords;
      }
    }
    
    if (merchantMatch) {
      data.merchant = merchantMatch[1].trim();
    }

    // Enhanced category detection with expanded keywords for both income and expense
    const categoryKeywords = data.type === 'income' ? {
      salary: [
        'salary', 'wage', 'wages', 'paycheck', 'pay'
      ],
      freelance: [
        'freelance', 'freelancing', 'gig', 'contract', 'consulting', 'consultant'
      ],
      business: [
        'business', 'sales', 'revenue', 'client'
      ],
      investment: [
        'investment', 'dividend', 'dividends', 'stock', 'crypto', 'trading', 'interest'
      ],
      rental: [
        'rental', 'rent income', 'lease', 'tenant'
      ],
      gifts: [
        'gift', 'bonus', 'bonuses', 'reward', 'prize', 'award'
      ],
      refunds: [
        'refund', 'refunded', 'reimbursement', 'returned'
      ],
      other: [
        'income', 'received', 'earned'
      ]
    } : {
      food: [
        'food', 'groceries', 'grocery', 'lunch', 'dinner', 'breakfast', 'brunch',
        'restaurant', 'cafe', 'coffee', 'meal', 'ate', 'eating', 'snack', 'pizza',
        'burger', 'sandwich', 'mcdonalds', 'kfc', 'subway', 'starbucks'
      ],
      transport: [
        'taxi', 'uber', 'lyft', 'bolt', 'bus', 'train', 'metro', 'transport',
        'gas', 'fuel', 'petrol', 'parking', 'toll', 'ride', 'drove', 'car'
      ],
      shopping: [
        'shopping', 'shop', 'clothes', 'clothing', 'bought', 'purchase', 'amazon',
        'store', 'mall', 'shoes', 'shirt', 'pants', 'dress', 'buy'
      ],
      entertainment: [
        'movie', 'cinema', 'game', 'entertainment', 'netflix', 'spotify',
        'concert', 'show', 'theater', 'fun', 'hobby', 'sport'
      ],
      bills: [
        'bill', 'utility', 'utilities', 'rent', 'electric', 'electricity',
        'water', 'internet', 'phone', 'subscription', 'insurance'
      ],
      health: [
        'health', 'doctor', 'hospital', 'pharmacy', 'medicine', 'medical',
        'dentist', 'clinic', 'prescription', 'drug', 'pills'
      ],
      personal: [
        'haircut', 'salon', 'barber', 'spa', 'gym', 'fitness', 'beauty'
      ],
      education: [
        'book', 'books', 'course', 'class', 'tuition', 'school', 'education'
      ]
    };

    // Find best matching category with scoring
    let bestMatch = { category: null, score: 0 };
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      let score = 0;
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          // Weight longer/more specific keywords higher
          score += keyword.length;
        }
      }
      if (score > bestMatch.score) {
        bestMatch = { category, score };
      }
    }
    
    if (bestMatch.category) {
      data.category = bestMatch.category;
    }

    // Extract description/notes (remove redundant info)
    let notes = text;
    if (data.amount) {
      notes = notes.replace(/(\d+(?:\.\d{1,2})?)\s*(?:dollars?|bucks?|naira|₦|\$|usd|ngn)/gi, '');
    }
    if (data.merchant) {
      notes = notes.replace(new RegExp(`(?:at|from)\\s+${data.merchant}`, 'gi'), '');
    }
    notes = notes.replace(/\s+/g, ' ').trim();
    data.notes = notes || text;

    return data;
  };

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    setError(null);
    setTranscript('');
    setParsedData(null);
    setIsListening(true);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = async () => {
      setIsListening(false);
      if (transcript) {
        setIsProcessing(true);
        const parsed = await parseExpenseFromTextWithAI(transcript);
        setParsedData(parsed);
        setIsProcessing(false);
      }
    };

    try {
      recognition.start();
    } catch (err) {
      setError('Failed to start speech recognition');
      setIsListening(false);
    }
  }, [isSupported, transcript]);

  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setParsedData(null);
    setError(null);
    setIsProcessing(false);
  }, []);

  return {
    isListening,
    isProcessing,
    transcript,
    parsedData,
    error,
    isSupported,
    startListening,
    stopListening,
    reset,
  };
};
