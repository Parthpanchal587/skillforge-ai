import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

const AIChatPage = () => {
  const { user } = useStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || streaming) return;

    const userMessage = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Try streaming first
      const response = await fetch('http://localhost:5000/api/ai/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          model: 'llama2' // In a real app, this could be configurable
        })
      });

      if (!response.ok) {
        throw new Error('Failed to connect to AI service');
      }

      // Set up streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = '';

      setStreaming(true);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (data === '[DONE]') {
              setStreaming(false);
              break;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.response) {
                accumulatedResponse += parsed.response;
                // Update the last message with accumulated response
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages.pop(); // Remove the temporary loading message
                  newMessages.push({
                    id: Date.now().toString(),
                    text: accumulatedResponse,
                    sender: 'ai',
                    timestamp: new Date()
                  });
                  return newMessages;
                });
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in AI chat:', error);
      // Fallback to non-streaming
      try {
        const response = await fetch('http://localhost:5000/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: input,
            model: 'llama2'
          })
        });

        const data = await response.json();
        if (data.response) {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text: data.response,
            sender: 'ai',
            timestamp: new Date()
          }]);
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: 'Sorry, I encountered an error. Please make sure the backend is running and Ollama is available.',
          sender: 'ai',
          timestamp: new Date()
        }]);
      }
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  };

  // Initialize with a welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        text: "Hello! I'm your AI mentor. I can help you with coding concepts, explain algorithms, review code, or answer any engineering questions you have. What would you like to learn about today?",
        sender: 'ai',
        timestamp: new Date()
      }]);
    }
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI Mentor Chat
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Get instant help with coding, concepts, and career advice
          </p>
        </div>

        {/* Chat Messages */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 h-[600px] overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-indigo-600 text-white self-end'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-100 dark:text-white self-start'
                }`}>
                  <div className="flex mb-1">
                    <span className="font-medium">
                      {message.sender === 'user' ? 'You' : 'AI Mentor'}
                    </span>
                    <span className="ml-2 text-xs text-opacity-75">
                      {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{message.text}</p>
                </div>
              </div>
            ))}
            {streaming && (
              <div className="flex justify-start">
                <div className="max-w-[80%] px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-100 dark:text-white self-start">
                  <div className="flex mb-1">
                    <span className="font-medium">AI Mentor</span>
                    <span className="ml-2 text-xs text-opacity-75">Typing...</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="animate-pulse">â—</span>
                    <span className="animate-pulse">â—</span>
                    <span className="animate-pulse">â—</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex space-x-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask me anything about coding, algorithms, career advice..."
            className="flex-1 min-h-[60px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            disabled={loading || streaming}
            rows={1}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading || streaming}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading || streaming ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                Sending...
              </>
            ) : (
              'Send'
            )}
          </button>
        </div>

        {/* Example Prompts */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Try asking:
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setInput('Explain the difference between REST and GraphQL')}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              REST vs GraphQL
            </button>
            <button
              onClick={() => setInput('How does a binary search algorithm work?')}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Binary Search
            </button>
            <button
              onClick={() => setInput('What are the SOLID principles in object-oriented design?')}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              SOLID Principles
            </button>
            <button
              onClick={() => setInput('Help me debug this Python code: [paste code here]')}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Code Debugging
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatPage;
