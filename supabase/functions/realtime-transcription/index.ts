import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Realtime transcription WebSocket function called')
    
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) {
      console.error('OPENAI_API_KEY not found')
      throw new Error('OpenAI API key not configured')
    }

    const upgradeHeader = req.headers.get('upgrade')
    if (upgradeHeader !== 'websocket') {
      return new Response('Expected websocket', { status: 400 })
    }

    const { socket, response } = Deno.upgradeWebSocket(req)
    
    let openaiWs: WebSocket | null = null

    socket.onopen = async () => {
      console.log('Client WebSocket connected')
      
      try {
        // Connect to OpenAI Realtime API
        openaiWs = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01', {
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'OpenAI-Beta': 'realtime=v1'
          }
        })

        openaiWs.onopen = () => {
          console.log('Connected to OpenAI Realtime API')
        }

        openaiWs.onmessage = (event) => {
          const data = JSON.parse(event.data)
          console.log('OpenAI message:', data.type)
          
          // Configure session for Telugu transcription AFTER receiving session.created
          if (data.type === 'session.created') {
            console.log('Session created, configuring for Telugu transcription')
            openaiWs?.send(JSON.stringify({
              type: 'session.update',
              session: {
                modalities: ['text', 'audio'],
                instructions: 'You are a helpful assistant that transcribes Telugu audio to Telugu text. Only return the transcribed text in Telugu script, nothing else.',
                voice: 'alloy',
                input_audio_format: 'pcm16',
                output_audio_format: 'pcm16',
                input_audio_transcription: {
                  model: 'whisper-1'
                },
                turn_detection: {
                  type: 'server_vad',
                  threshold: 0.5,
                  prefix_padding_ms: 300,
                  silence_duration_ms: 1000
                },
                temperature: 0.1,
                max_response_output_tokens: 1000
              }
            }))
          }
          
          // Forward relevant messages to client
          if (data.type === 'input_audio_buffer.speech_started' ||
              data.type === 'input_audio_buffer.speech_stopped' ||
              data.type === 'conversation.item.input_audio_transcription.completed' ||
              data.type === 'response.text.delta' ||
              data.type === 'response.text.done' ||
              data.type === 'session.updated') {
            socket.send(JSON.stringify(data))
          }
        }

        openaiWs.onerror = (error) => {
          console.error('OpenAI WebSocket error:', error)
          socket.send(JSON.stringify({ type: 'error', message: 'OpenAI connection error' }))
        }

        openaiWs.onclose = () => {
          console.log('OpenAI WebSocket closed')
          socket.close()
        }

      } catch (error) {
        console.error('Error connecting to OpenAI:', error)
        socket.send(JSON.stringify({ type: 'error', message: error.message }))
      }
    }

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('Client message type:', data.type)
        
        // Forward audio data to OpenAI
        if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
          openaiWs.send(JSON.stringify(data))
        }
      } catch (error) {
        console.error('Error processing client message:', error)
      }
    }

    socket.onclose = () => {
      console.log('Client WebSocket disconnected')
      if (openaiWs) {
        openaiWs.close()
      }
    }

    socket.onerror = (error) => {
      console.error('Client WebSocket error:', error)
      if (openaiWs) {
        openaiWs.close()
      }
    }

    return response
    
  } catch (error) {
    console.error('Realtime transcription error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})