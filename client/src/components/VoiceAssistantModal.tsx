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

  // Initialize Speech Recognition if supported
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
      alert('Speech Recognition is not supported on this browser. You can type voice commands below.');
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
      setAiResponse(`Voice service note: ${e.message}`);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#0F1626] border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0B0F19]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-ping"></div>
            <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              ElevenLabs Voice Agent & Guardrail
            </h3>
          </div>
          <button
            onClick={() => {
              if (recognitionRef.current) recognitionRef.current.stop();
              window.speechSynthesis?.cancel();
              onClose();
            }}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800"
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
                  ? 'bg-blue-600/30 ring-8 ring-blue-500/20 scale-105'
                  : 'bg-slate-800/80 border border-slate-700'
              }`}
            >
              <button
                onClick={toggleListening}
                className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-transform ${
                  isListening
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 animate-pulse'
                    : 'bg-blue-600 hover:bg-blue-500'
                }`}
                title={isListening ? 'Click to stop listening' : 'Click to speak'}
              >
                {isListening ? <Mic className="w-8 h-8 text-white" /> : <MicOff className="w-8 h-8 text-slate-200" />}
              </button>
            </div>
            {isListening && (
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[11px] font-mono text-blue-400 whitespace-nowrap animate-pulse">
                Listening to voice input...
              </span>
            )}
          </div>

          {/* Transcript / Spoken Status */}
          <div className="w-full space-y-2 mt-4">
            <div className="p-3 rounded-lg bg-[#070B14] border border-slate-800 text-left text-xs min-h-[50px]">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Live Transcript:</span>
              <p className="text-slate-200 italic font-mono">
                {transcript || (isListening ? 'Speak now into your microphone...' : 'Press microphone or choose a quick command below.')}
              </p>
            </div>

            {/* Safety Policy Alert Banner if User tried to voice-approve */}
            {safetyAlert && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-600/60 text-left text-xs text-rose-200 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block text-rose-300">Safety Policy Enforced:</strong>
                  <span>{safetyAlert}</span>
                </div>
              </div>
            )}

            {/* AI Agent Spoken Response */}
            <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-900/40 text-left text-xs text-slate-200 flex items-start gap-2">
              <Volume2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-mono text-blue-400 block mb-0.5">Agent Response:</span>
                <p>{aiResponse}</p>
              </div>
            </div>
          </div>

          {/* Quick Voice Command Chips */}
          <div className="w-full text-left">
            <span className="text-[10px] uppercase font-mono text-slate-400 block mb-2">Example Voice Commands:</span>
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
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700/80 text-[11px] text-slate-300 border border-slate-700 transition-colors"
                >
                  "{cmd}"
                </button>
              ))}
            </div>
          </div>

          {/* Text input fallback for keyboard users */}
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
              className="flex-1 px-3 py-2 rounded-md bg-[#070B14] border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-mono"
            />
            <button
              type="submit"
              disabled={isProcessing || !transcript.trim()}
              className="px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-medium flex items-center gap-1.5"
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
