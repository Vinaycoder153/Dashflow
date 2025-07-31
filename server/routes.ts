import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertMessageSchema, insertUserSettingsSchema } from "@shared/schema";
import { generateAIResponse, analyzeUserIntent } from "./gemini";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time communication
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Store active WebSocket connections
  const clients = new Map<string, WebSocket>();

  wss.on('connection', (ws, req) => {
    const clientId = Math.random().toString(36).substring(7);
    clients.set(clientId, ws);

    console.log(`Client ${clientId} connected`);

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'chat' && message.sessionId && message.content) {
          // Store user message
          const userMessage = await storage.createMessage({
            sessionId: message.sessionId,
            content: message.content,
            sender: 'user',
            metadata: message.metadata || null,
          });

          // Broadcast user message to all clients
          const userResponse = {
            type: 'message',
            message: userMessage,
          };
          
          clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(userResponse));
            }
          });

          // Process with Gemini AI assistant
          const assistantContent = await generateAIResponse(message.content);
          
          // Store assistant response
          const assistantMessage = await storage.createMessage({
            sessionId: message.sessionId,
            content: assistantContent,
            sender: 'assistant',
            metadata: null,
          });

          // Broadcast assistant response
          const assistantResponse = {
            type: 'message',
            message: assistantMessage,
          };
          
          clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(assistantResponse));
            }
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      clients.delete(clientId);
      console.log(`Client ${clientId} disconnected`);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(clientId);
    });
  });

  // REST API endpoints
  app.post('/api/chat-session', async (req, res) => {
    try {
      const userId = req.body.userId || 'default-user';
      const session = await storage.createChatSession(userId);
      res.json({ session });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create chat session' });
    }
  });

  app.get('/api/messages/:sessionId', async (req, res) => {
    try {
      const messages = await storage.getMessages(req.params.sessionId);
      res.json({ messages });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  app.get('/api/settings/:userId', async (req, res) => {
    try {
      const settings = await storage.getUserSettings(req.params.userId);
      if (!settings) {
        // Return default settings
        const defaultSettings = {
          voiceSpeed: "1.0",
          voicePitch: "1.0",
          autoScroll: true,
          theme: "light",
        };
        res.json({ settings: defaultSettings });
      } else {
        res.json({ settings });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  app.post('/api/settings/:userId', async (req, res) => {
    try {
      const validation = insertUserSettingsSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.issues });
      }

      const settings = await storage.updateUserSettings(req.params.userId, validation.data);
      res.json({ settings });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update settings' });
    }
  });

  app.get('/api/status', (req, res) => {
    res.json({
      status: 'online',
      timestamp: new Date().toISOString(),
      features: [
        'voice_recognition',
        'text_to_speech',
        'weather_info',
        'time_info',
        'web_search',
        'email_sending',
        'reminders',
        'notes'
      ]
    });
  });

  // REST endpoint for AI chat (optional - WebSocket is primary)
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, sessionId } = req.body;
      if (!message || !sessionId) {
        return res.status(400).json({ error: 'Message and sessionId required' });
      }

      const response = await generateAIResponse(message);
      res.json({ response, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Chat API error:', error);
      res.status(500).json({ error: 'Failed to process message' });
    }
  });

  return httpServer;
}
