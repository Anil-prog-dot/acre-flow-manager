import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface RealtimeVoiceRecorderProps {
  onTranscription: (text: string) => void;
  placeholder?: string;
  className?: string;
}

class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  constructor(private onAudioData: (audioData: Float32Array) => void) {}

  async start() {
    try {
      // Check for microphone permissions first
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      console.log('Microphone permission status:', permissionStatus.state);
      
      if (permissionStatus.state === 'denied') {
        throw new Error('Microphone permission denied. Please allow microphone access in your browser settings.');
      }

      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      console.log('Microphone access granted, setting up audio context');
      
      this.audioContext = new AudioContext({
        sampleRate: 24000,
      });
      
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        this.onAudioData(new Float32Array(inputData));
      };
      
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
      
      console.log('Audio recording setup complete');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          throw new Error('Microphone permission denied. Please allow microphone access and try again.');
        } else if (error.name === 'NotFoundError') {
          throw new Error('No microphone found. Please connect a microphone and try again.');
        } else if (error.name === 'NotReadableError') {
          throw new Error('Microphone is being used by another application. Please close other apps and try again.');
        }
      }
      throw error;
    }
  }

  stop() {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

const encodeAudioForAPI = (float32Array: Float32Array): string => {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  
  const uint8Array = new Uint8Array(int16Array.buffer);
  let binary = '';
  const chunkSize = 0x8000;
  
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(binary);
};

export const RealtimeVoiceRecorder: React.FC<RealtimeVoiceRecorderProps> = ({
  onTranscription,
  placeholder = "Click mic to record in Telugu",
  className,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  
  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const transcriptionRef = useRef<string>('');

  const connectWebSocket = useCallback(() => {
    return new Promise<WebSocket>((resolve, reject) => {
      const projectId = 'gnndcsxcpsauvyiutfbf';
      const ws = new WebSocket(`wss://${projectId}.functions.supabase.co/functions/v1/realtime-transcription`);
      
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('WebSocket connection timeout. Please check your internet connection.'));
      }, 10000); // 10 second timeout
      
      ws.onopen = () => {
        console.log('Connected to realtime transcription');
        clearTimeout(timeout);
        resolve(ws);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message:', data.type);
          
          if (data.type === 'conversation.item.input_audio_transcription.completed') {
            const transcript = data.transcript || '';
            if (transcript.trim()) {
              transcriptionRef.current = transcript;
              onTranscription(transcript);
              toast({
                title: "Transcription Complete",
                description: `Transcribed: ${transcript}`,
              });
            }
          } else if (data.type === 'error') {
            console.error('WebSocket error:', data.message);
            toast({
              title: "Transcription Error",
              description: data.message,
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        clearTimeout(timeout);
        reject(new Error('Failed to connect to transcription service. Please check your internet connection.'));
      };
      
      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        clearTimeout(timeout);
        if (event.code !== 1000) { // 1000 is normal closure
          reject(new Error(`WebSocket connection closed unexpectedly: ${event.reason || 'Unknown reason'}`));
        }
      };
    });
  }, [onTranscription, toast]);

  const startRecording = useCallback(async () => {
    try {
      setIsConnecting(true);
      
      // Connect to WebSocket
      const ws = await connectWebSocket();
      wsRef.current = ws;
      
      // Start audio recording
      recorderRef.current = new AudioRecorder((audioData) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: encodeAudioForAPI(audioData)
          }));
        }
      });
      
      await recorderRef.current.start();
      setIsRecording(true);
      setIsConnecting(false);
      transcriptionRef.current = '';
      
      toast({
        title: "Recording Started",
        description: "Speak in Telugu...",
      });
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsConnecting(false);
      toast({
        title: "Recording Error",
        description: "Failed to start recording. Please check microphone permissions.",
        variant: "destructive",
      });
    }
  }, [connectWebSocket, toast]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
    }
    
    if (wsRef.current) {
      // Commit audio buffer for transcription
      wsRef.current.send(JSON.stringify({
        type: 'input_audio_buffer.commit'
      }));
      
      // Request response
      wsRef.current.send(JSON.stringify({
        type: 'response.create'
      }));
      
      // Close connection after a delay
      setTimeout(() => {
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
      }, 3000);
    }
    
    setIsRecording(false);
    
    toast({
      title: "Recording Stopped",
      description: "Processing Telugu transcription...",
    });
  }, [toast]);

  const handleToggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleToggleRecording}
        disabled={isConnecting}
        className={cn(
          "flex items-center space-x-1",
          isRecording && "bg-destructive/10 border-destructive text-destructive hover:bg-destructive/20",
          isConnecting && "opacity-50"
        )}
      >
        {isConnecting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isRecording ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
        <span className="text-xs">
          {isConnecting ? "Connecting..." : isRecording ? "Stop" : "Record"}
        </span>
      </Button>
      <span className="text-xs text-muted-foreground">{placeholder}</span>
    </div>
  );
};