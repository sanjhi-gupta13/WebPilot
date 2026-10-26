import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Volume2, ShieldAlert, Sparkles, Send } from 'lucide-react';
import { api } from '../services/api';
import { WebPilotTask } from '../types';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: WebPilotTask;
  onStartWithPrompt?: (prompt: string) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  task,
  onStartWithPrompt,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState(
    'ProofFlow Voice Agent online. How can I assist with your competitive intelligence research?'
  );
  const [safetyAlert, setSafetyAlert] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          setTranscript(text);
          handleVoiceCommand(text);
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [task]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported on this browser. You can type commands below.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setSafetyAlert(null);
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleVoiceCommand = async (text: string) => {
    if (!text.trim()) return;
    setIsProcessing(true);
    setSafetyAlert(null);

    try {
      const res = await api.sendVoiceCommand(text, task?.id);
      const { result } = res;

      if (result.action === 'REJECT_APPROVAL') {
        setSafetyAlert(result.spokenResponse);
        speakResponse(result.spokenResponse);
      } else {
        setAiResponse(result.spokenResponse);
        speakResponse(result.spokenResponse);

        if (result.action === 'START' && onStartWithPrompt && !task) {
          onStartWithPrompt('Research five AI startups, compare their products and pricing, build an Excel spreadsheet with source URLs, and prepare a launch kit.');
        }
      }
    } catch (e: any) {
      setAiResponse(`Voice note: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              ElevenLabs Voice Agent & Policy Guard
            </h3>
          </div>
          <button
            onClick={() => {
              if (recognitionRef.current) recognitionRef.current.stop();
              window.speechSynthesis?.cancel();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col items-center text-center space-y-5">
          {/* Pulsing Visualizer */}
          <div className="relative">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                isListening
                  ? 'bg-blue-100 ring-8 ring-blue-50 scale-105'
                  : 'bg-slate-100 border border-slate-200'
              }`}
            >
              <button
                onClick={toggleListening}
                className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-md transition-transform ${
                  isListening
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 animate-pulse'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                title={isListening ? 'Click to stop listening' : 'Click to speak'}
              >
                {isListening ? <Mic className="w-8 h-8 text-white" /> : <MicOff className="w-8 h-8 text-white" />}
              </button>
            </div>
            {isListening && (
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[11px] font-semibold text-blue-600 whitespace-nowrap animate-pulse">
                Listening to your voice...
              </span>
            )}
          </div>

          {/* Transcript / Spoken Status */}
          <div className="w-full space-y-2.5 mt-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs min-h-[50px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Live Transcript:</span>
              <p className="text-slate-700 italic">
                {transcript || (isListening ? 'Speak now into your microphone...' : 'Press the microphone or choose a quick prompt below.')}
              </p>
            </div>

            {/* Safety Policy Alert Banner if User tried to voice-approve */}
            {safetyAlert && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-left text-xs text-rose-800 flex items-start gap-2.5 shadow-sm">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block text-rose-900">Safety Policy Enforced:</strong>
                  <span>{safetyAlert}</span>
                </div>
              </div>
            )}

            {/* AI Agent Spoken Response */}
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-left text-xs text-slate-800 flex items-start gap-2.5">
              <Volume2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-700 block mb-0.5">Agent Response:</span>
                <p className="leading-relaxed">{aiResponse}</p>
              </div>
            </div>
          </div>

          {/* Quick Voice Command Chips */}
          <div className="w-full text-left">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Example Voice Commands:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Start research on AI startups',
                'What is the current status?',
                'Explain failure and recovery',
                'Summarize verified results',
                'Approve this plan (Safety Test)',
                'Cancel current task',
              ].map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => {
                    setTranscript(cmd);
                    handleVoiceCommand(cmd);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 border border-slate-200 transition-colors"
                >
                  "{cmd}"
                </button>
              ))}
            </div>
          </div>

          {/* Text input fallback */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVoiceCommand(transcript);
            }}
            className="w-full flex items-center gap-2"
          >
            <input
              type="text"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Or type voice command manually..."
              className="flex-1 px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
            <button
              type="submit"
              disabled={isProcessing || !transcript.trim()}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
