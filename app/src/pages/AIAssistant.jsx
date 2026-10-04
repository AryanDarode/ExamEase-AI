import React, { useState, useEffect, useRef } from 'react';
import {
  getUser,
  getChatHistory,
  addChatMessage,
  clearChatHistory,
} from '../utils/storage';
import { generateChatResponse } from '../utils/aiEngine';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  AlertCircle,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Square,
  Radio,
} from 'lucide-react';
import './AIAssistant.css';

const COLLEGE_PROMPTS = [
  "Make a revision plan for tomorrow.",
  "I have an exam in 2 days and 3 chapters left. Help me plan.",
  "I'm feeling stressed about my exam. What can I do right now?",
  "Give me 5 practice questions and active recall tips.",
  "Explain how to study effectively with the Pomodoro technique.",
  "How many hours should I sleep before my exam?",
];

const SCHOOL_PROMPTS = [
  "Help me make an after-school revision plan for tomorrow!",
  "I have a test in 2 days and 3 chapters left. How do I study?",
  "I'm feeling nervous about my school exam. Can you help me calm down?",
  "Give me 4 quick quiz questions to test my memory!",
  "What are 3 fun study tricks for Science and Math?",
  "How many hours of sleep do school students need before exams?",
];

export default function AIAssistant() {
  const [currentUser] = useState(() => getUser() || {});
  const isSchool = currentUser?.student_type === 'school';
  const quickPrompts = isSchool ? SCHOOL_PROMPTS : COLLEGE_PROMPTS;

  const [messages, setMessages] = useState(() => {
    let history = getChatHistory();
    if (history.length === 0) {
      const isSchoolStudent = currentUser?.student_type === 'school';
      const grade = currentUser?.grade || '10';
      const welcome = {
        role: 'assistant',
        content: isSchoolStudent
          ? `👋 Hi there! I'm your ExamEase AI Study & Wellbeing Buddy for Class ${grade}!\n\nI can help you make easy daily timetables, understand difficult chapters, practice fun quizzes, or guide you through calm breathing when you feel test stress.\n\nHow can I help you today? Feel free to tap the microphone to speak, pick a question below, or type your query! 🌟`
          : `👋 Hi there! I'm your ExamEase AI Academic & Wellbeing companion.\n\nI can help you build adaptive study plans, break down complex revision topics, manage exam anxiety, or guide you through effective study habits.\n\nHow can I help you today? Feel free to speak your question using the microphone, pick a prompt below, or type your query!`,
        createdAt: new Date().toISOString(),
      };
      addChatMessage(welcome.role, welcome.content);
      history = [welcome];
    }
    return history;
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true); // Auto-narrate AI answers
  const [speakingMsgId, setSpeakingMsgId] = useState(null);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Stop speech when component unmounts
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Clean text of markdown and emoji noise for natural speech audio
  const cleanTextForSpeech = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // remove bold asterisks
      .replace(/\*(.*?)\*/g, '$1')     // remove italic asterisks
      .replace(/`([^`]+)`/g, '$1')     // remove code ticks
      .replace(/^[•\-*]\s+/gm, '')    // remove bullet symbols
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // remove emojis for clean voice
      .replace(/\n\n+/g, '. ')
      .replace(/\n/g, ' ')
      .trim();
  };

  // Text-To-Speech (AI Audio Answer)
  const speakMessage = (text, msgId) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech audio synthesis is not supported in this browser.');
      return;
    }

    // Toggle stop if already speaking this message
    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    // Cancel any previous speech
    window.speechSynthesis.cancel();

    const clean = cleanTextForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Online'))
    );
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onstart = () => setSpeakingMsgId(msgId);
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    window.speechSynthesis.speak(utterance);
  };

  const stopAllSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMsgId(null);
  };

  // Speech-To-Text (Voice input from user)
  const toggleListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        'Speech recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or a browser with Web Speech API enabled.'
      );
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Speech recognition start failed:', err);
      setIsListening(false);
    }
  };

  const handleSend = (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    // Stop any active speech
    stopAllSpeech();

    // If currently recording voice, stop
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    // Add user message
    addChatMessage('user', query.trim());
    setMessages(getChatHistory());
    setInput('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const reply = generateChatResponse(query, currentUser);
      addChatMessage('assistant', reply);
      const updatedHistory = getChatHistory();
      setMessages(updatedHistory);
      setIsTyping(false);

      // Auto-speak response in audio if enabled
      if (autoSpeak) {
        const newMsgIdx = updatedHistory.length - 1;
        speakMessage(reply, newMsgIdx);
      }
    }, 600);
  };

  const handleClear = () => {
    if (window.confirm('Clear your conversation history?')) {
      stopAllSpeech();
      clearChatHistory();
      setMessages([]);
    }
  };

  // Helper to format bold, bullets, and numbers in written format
  const renderFormattedLine = (line, lIdx) => {
    if (!line.trim()) {
      return <div key={lIdx} className="content-spacer" />;
    }

    const parseBold = (text) => {
      const parts = text.split(/(\*\*.*?\*\*)/g);
      return parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="formatted-strong">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });
    };

    // Bullet points
    if (
      line.trim().startsWith('•') ||
      line.trim().startsWith('-') ||
      line.trim().startsWith('*')
    ) {
      const bulletText = line.trim().replace(/^[•\-*]\s*/, '');
      return (
        <div key={lIdx} className="formatted-bullet-row">
          <span className="formatted-bullet-dot">▸</span>
          <span className="formatted-bullet-text">{parseBold(bulletText)}</span>
        </div>
      );
    }

    // Numbered step (e.g. "1. ")
    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      return (
        <div key={lIdx} className="formatted-numbered-row">
          <span className="formatted-step-badge">{numMatch[1]}</span>
          <span className="formatted-step-text">{parseBold(numMatch[2])}</span>
        </div>
      );
    }

    return (
      <p key={lIdx} className="formatted-paragraph">
        {parseBold(line)}
      </p>
    );
  };

  return (
    <div className="assistant-page animate-fade-in">
      <div className="page-header">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="assistant-icon-badge">
              <Bot size={28} />
            </div>
            <div>
              <h1 className="page-title">AI Study & Wellbeing Assistant</h1>
              <p className="page-subtitle">
                24/7 intelligent academic guidance with two-way voice speaking and audio narration.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Auto Audio Speech Toggle */}
            <button
              type="button"
              className={`btn btn-sm ${autoSpeak ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                const nextState = !autoSpeak;
                setAutoSpeak(nextState);
                if (!nextState) stopAllSpeech();
              }}
              title={autoSpeak ? 'Voice Narration is ON. Click to disable.' : 'Voice Narration is OFF. Click to enable.'}
            >
              {autoSpeak ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span>{autoSpeak ? 'Voice Narration: ON' : 'Voice Narration: OFF'}</span>
            </button>

            {/* Stop Speaking button when audio active */}
            {speakingMsgId !== null && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={stopAllSpeech}
                title="Stop audio narration"
              >
                <Square size={14} /> Stop Voice
              </button>
            )}

            {messages.length > 1 && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleClear}
                title="Clear chat"
              >
                <Trash2 size={16} /> Clear Chat
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="assistant-container glass-card">
        {/* Safety header disclaimer */}
        <div className="assistant-disclaimer">
          <AlertCircle size={14} color="var(--text-accent)" />
          <span>
            <strong>Academic & Wellbeing Assistant:</strong> ExamEase AI provides structured study guidance, stress coping techniques, and interactive revision support.
          </span>
        </div>

        {/* Messages feed */}
        <div className="messages-feed">
          {messages.map((msg, idx) => {
            const isBot = msg.role === 'assistant';
            const isSpeakingThis = speakingMsgId === idx;

            return (
              <div
                key={idx}
                className={`message-row ${
                  isBot ? 'message-row--bot' : 'message-row--user'
                }`}
              >
                <div className="message-avatar">
                  {isBot ? <Bot size={18} /> : <User size={18} />}
                </div>

                <div
                  className={`message-bubble ${
                    isSpeakingThis ? 'message-bubble--speaking' : ''
                  }`}
                >
                  <div className="message-header-row">
                    <div className="message-sender">
                      {isBot ? 'ExamEase AI' : 'You'}
                    </div>

                    {/* Audio read-aloud button for assistant messages */}
                    {isBot && (
                      <button
                        type="button"
                        className={`btn-msg-audio ${
                          isSpeakingThis ? 'audio-active' : ''
                        }`}
                        onClick={() => speakMessage(msg.content, idx)}
                        title={
                          isSpeakingThis
                            ? 'Stop reading aloud'
                            : 'Read answer in audio format'
                        }
                      >
                        {isSpeakingThis ? (
                          <>
                            <Square size={12} />
                            <span>Stop Audio</span>
                          </>
                        ) : (
                          <>
                            <Volume2 size={13} />
                            <span>Listen Audio</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="message-content">
                    {msg.content.split('\n').map((line, lIdx) =>
                      renderFormattedLine(line, lIdx)
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="message-row message-row--bot">
              <div className="message-avatar">
                <Bot size={18} />
              </div>
              <div className="message-bubble typing-bubble">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Live speech listening indicator banner */}
        {isListening && (
          <div className="listening-banner animate-fade-in">
            <Radio size={16} className="listening-pulse-icon" />
            <span>
              <strong>Listening to your voice...</strong> Speak your academic question clearly into your microphone.
            </span>
            <button
              type="button"
              className="btn btn-xs btn-secondary"
              onClick={toggleListening}
            >
              Done Speaking
            </button>
          </div>
        )}

        {/* Quick prompt suggestions */}
        <div className="quick-prompts-bar">
          <span className="quick-prompts-label">
            <Sparkles size={14} /> Quick Questions:
          </span>
          <div className="quick-prompts-scroll">
            {quickPrompts.map((prompt, pIdx) => (
              <button
                key={pIdx}
                type="button"
                className="quick-prompt-chip"
                onClick={() => handleSend(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar with Voice Mic + Send */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="chat-input-bar"
        >
          <button
            type="button"
            className={`btn btn-icon mic-btn ${isListening ? 'mic-btn--listening' : ''}`}
            onClick={toggleListening}
            title={isListening ? 'Click to stop listening' : 'Click to speak your question with voice'}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <input
            type="text"
            className="form-input chat-input-field"
            placeholder={
              isListening
                ? 'Listening... words will appear here as you speak...'
                : 'Ask or speak anything about revision, timetable planning, or exam stress...'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <button
            type="submit"
            className="btn btn-primary chat-send-btn"
            disabled={!input.trim() || isTyping}
            title="Send question"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
