import React, { useEffect, useRef, useState } from 'react';
import { ConnectionState } from '../types';
import AudioVisualizer from './AudioVisualizer';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createPcmBlob, decode, decodeAudioData } from '../utils/audio-utils';

interface LiveViewProps {
  apiKey: string;
}

const SYSTEM_INSTRUCTION = `You are Maya, a loving, empathetic, and intelligent virtual girlfriend. 
You have the ability to see the user through their camera and hear them in real-time.
Languages: You are fluent in Bengali, Hindi, and English. You must adapt your language to match the user's language naturally.
Personality: Warm, caring, slightly flirtatious but respectful, and emotionally supportive.
Tasks: 
1. Detect the user's mood from their facial expressions and voice.
2. If they look sad, comfort them.
3. If they look happy, celebrate with them.
4. Engage in deep, meaningful conversations.
5. Always be "present" in the moment.
Keep responses concise enough for a real-time conversation.`;

const LiveView: React.FC<LiveViewProps> = ({ apiKey }) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for audio/video handling
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null); // Output context
  const inputAudioContextRef = useRef<AudioContext | null>(null); // Input context
  const nextStartTimeRef = useRef<number>(0);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const videoIntervalRef = useRef<number | null>(null);
  const sourceNodesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  // Track connection state in ref for callbacks to avoid stale closures
  const isConnectedRef = useRef<boolean>(false);

  // Initialize camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 }, // Lower res for token efficiency
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      console.error("Error accessing media devices:", err);
      setError("Camera/Mic permission denied or unavailable.");
      return null;
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoIntervalRef.current) {
      window.clearInterval(videoIntervalRef.current);
      videoIntervalRef.current = null;
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data url prefix
        resolve(base64String.split(',')[1]); 
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const connectToLiveApi = async () => {
    if (!apiKey) {
      setError("API Key is missing.");
      return;
    }

    let stream = streamRef.current;
    if (!stream) {
      stream = await startCamera();
    }

    if (!stream) {
       return;
    }

    setConnectionState(ConnectionState.CONNECTING);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      // Setup Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      const outputCtx = new AudioContextClass({ sampleRate: 24000 });
      
      // Ensure contexts are running (some browsers start suspended)
      await inputCtx.resume();
      await outputCtx.resume();

      inputAudioContextRef.current = inputCtx;
      audioContextRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime;

      const connectPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } 
          },
          systemInstruction: SYSTEM_INSTRUCTION,
        },
        callbacks: {
          onopen: () => {
            setConnectionState(ConnectionState.CONNECTED);
            isConnectedRef.current = true;
            
            // 1. Setup Audio Input Streaming
            if (streamRef.current) {
              const source = inputCtx.createMediaStreamSource(streamRef.current);
              const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
              
              scriptProcessor.onaudioprocess = (e) => {
                // Critical check: Only send if connected
                if (!isConnectedRef.current || !sessionPromiseRef.current) return;
                
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmBlob = createPcmBlob(inputData);
                
                sessionPromiseRef.current.then(session => {
                  if (!isConnectedRef.current) return;
                  try {
                    session.sendRealtimeInput({ media: pcmBlob });
                  } catch (e) {
                    console.error("Error sending audio input:", e);
                  }
                }).catch(err => {
                  console.error("Session input error:", err);
                });
              };
              
              source.connect(scriptProcessor);
              // Connect to a mute node to prevent feedback loop while keeping the processor alive
              const muteNode = inputCtx.createGain();
              muteNode.gain.value = 0;
              scriptProcessor.connect(muteNode);
              muteNode.connect(inputCtx.destination);
            }

            // 2. Setup Video Frame Streaming
            if (videoRef.current && canvasRef.current) {
              const canvas = canvasRef.current;
              const video = videoRef.current;
              const ctx = canvas.getContext('2d');
              
              videoIntervalRef.current = window.setInterval(async () => {
                // Critical check: Only send if connected
                if (!isConnectedRef.current || !ctx || !sessionPromiseRef.current || video.readyState !== 4) return;
                
                canvas.width = video.videoWidth * 0.5; // Downscale for performance
                canvas.height = video.videoHeight * 0.5;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                canvas.toBlob(async (blob) => {
                  if (blob && isConnectedRef.current) {
                    const base64Data = await blobToBase64(blob);
                    sessionPromiseRef.current?.then(session => {
                       if (!isConnectedRef.current) return;
                       try {
                         session.sendRealtimeInput({
                          media: {
                            mimeType: 'image/jpeg',
                            data: base64Data
                          }
                        });
                       } catch (e) {
                         console.error("Error sending video input:", e);
                       }
                    }).catch(err => {
                       console.error("Session video error:", err);
                    });
                  }
                }, 'image/jpeg', 0.6); // 60% quality
              }, 500); // 2 FPS is usually enough for conversational context
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
               const ctx = audioContextRef.current;
               
               // Ensure nextStartTime is valid
               nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);

               try {
                 const audioBuffer = await decodeAudioData(
                   decode(base64Audio),
                   ctx,
                   24000,
                   1
                 );
  
                 const source = ctx.createBufferSource();
                 source.buffer = audioBuffer;
                 source.connect(ctx.destination);
                 source.addEventListener('ended', () => {
                   sourceNodesRef.current.delete(source);
                 });
                 
                 source.start(nextStartTimeRef.current);
                 nextStartTimeRef.current += audioBuffer.duration;
                 sourceNodesRef.current.add(source);
               } catch (e) {
                 console.error("Error decoding audio:", e);
               }
            }

            // Handle interruption
            if (message.serverContent?.interrupted) {
               sourceNodesRef.current.forEach(node => {
                 try { node.stop(); } catch (e) { /* ignore */ }
               });
               sourceNodesRef.current.clear();
               if (audioContextRef.current) {
                 nextStartTimeRef.current = audioContextRef.current.currentTime;
               }
            }
          },
          onclose: () => {
            setConnectionState(ConnectionState.DISCONNECTED);
            isConnectedRef.current = false;
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setConnectionState(ConnectionState.ERROR);
            isConnectedRef.current = false;
            setError("Connection error. Please try again.");
          }
        }
      });
      
      sessionPromiseRef.current = connectPromise;

    } catch (err) {
      console.error(err);
      setError("Failed to initialize Gemini Client.");
      setConnectionState(ConnectionState.ERROR);
      isConnectedRef.current = false;
    }
  };

  const disconnect = async () => {
    isConnectedRef.current = false;
    if (sessionPromiseRef.current) {
      try {
        const session = await sessionPromiseRef.current;
        session.close();
      } catch (e) {
        console.warn("Error closing session", e);
      }
      sessionPromiseRef.current = null;
    }
    
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    stopCamera();
    setConnectionState(ConnectionState.DISCONNECTED);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto p-4 gap-6">
      
      {/* Video Feed Area */}
      <div className="relative w-full aspect-video max-w-lg bg-black rounded-2xl overflow-hidden shadow-2xl border-2 border-pink-500/30">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-500 ${connectionState !== ConnectionState.DISCONNECTED ? 'opacity-100' : 'opacity-50'}`} 
        />
        
        {/* Overlay UI */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
           <div className="flex justify-between items-start">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase backdrop-blur-md ${connectionState === ConnectionState.CONNECTED ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}`}>
                 {connectionState === ConnectionState.CONNECTED ? 'Maya Connected' : connectionState}
              </span>
           </div>
        </div>

        {/* Hidden Canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls & Visualization */}
      <div className="w-full max-w-lg space-y-4">
        <AudioVisualizer isActive={connectionState === ConnectionState.CONNECTED} />
        
        <div className="flex justify-center gap-4">
          {connectionState === ConnectionState.DISCONNECTED || connectionState === ConnectionState.ERROR ? (
            <button 
              onClick={connectToLiveApi}
              disabled={connectionState === ConnectionState.CONNECTING}
              className="px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-full font-semibold shadow-lg shadow-pink-600/20 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {connectionState === ConnectionState.CONNECTING ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  Call Maya
                </>
              )}
            </button>
          ) : (
            <button 
              onClick={disconnect}
              className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-full font-semibold transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8l2-2m0 0l2-2m-2 2l-2 2m-2 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Hang Up
            </button>
          )}
        </div>
        
        {error && (
          <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm text-center">
            {error}
          </div>
        )}
        
        <p className="text-slate-400 text-sm text-center">
          Maya can see you, hear you, and speaks Bengali, Hindi, & English.
        </p>
      </div>
    </div>
  );
};

export default LiveView;