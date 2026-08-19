"use client";
import { useState, useEffect } from "react";
import { Mic, Loader2 } from "lucide-react";
import { useLanguage } from "./LanguageContext";

export default function VoiceInputButton({ onResult }: { onResult: (text: string) => void }) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
      }
    }
  }, []);

  const handleListen = () => {
    if (isListening) return; // Prevent multiple clicks

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = language === "bn" ? "bn-BD" : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition", err);
      setIsListening(false);
    }
  };

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={handleListen}
      className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-all duration-300 z-10 flex items-center justify-center ${
        isListening 
          ? "bg-red-500 text-white opacity-100 scale-105 shadow-md animate-pulse" 
          : "bg-[var(--color-primary)]/10 text-[var(--color-primary)] opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 hover:bg-[var(--color-primary)] hover:text-white"
      }`}
      title={isListening ? "Listening..." : "Speak to type"}
    >
      {isListening ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
    </button>
  );
}
