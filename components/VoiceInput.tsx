'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaSpinner } from 'react-icons/fa';

interface VoiceInputProps {
  onResult: (transcript: string) => void;
  isListening: boolean;
  setIsListening: (v: boolean) => void;
}

export default function VoiceInput({ onResult, isListening, setIsListening }: VoiceInputProps) {
  const recognitionRef = useRef<any>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for Speech Recognition support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    setIsLoading(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setIsLoading(false);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        }
      }

      if (finalTranscript) {
        onResult(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setIsLoading(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setIsLoading(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [onResult, setIsListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, [setIsListening]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <button
        disabled
        className="p-2 text-dark-600 cursor-not-allowed"
        title="Speech recognition not supported in this browser"
      >
        <FaMicrophoneSlash />
      </button>
    );
  }

  return (
    <button
      onClick={toggleListening}
      className={`p-2 rounded-xl transition-all ${
        isListening
          ? 'bg-red-600 text-white animate-pulse'
          : 'text-dark-400 hover:text-white hover:bg-dark-800'
      }`}
      title={isListening ? 'Stop listening' : 'Start voice input'}
    >
      {isLoading ? (
        <FaSpinner className="spinner text-sm" />
      ) : isListening ? (
        <FaMicrophone />
      ) : (
        <FaMicrophone />
      )}
    </button>
  );
}
