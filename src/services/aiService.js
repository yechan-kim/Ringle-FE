// AI 서비스 시뮬레이션
class AIService {
  constructor() {
    this.conversationHistory = [];
    this.currentTopic = 'general';
  }

  // Speech-to-Text 시뮬레이션 (실제 구현은 Conversation 컴포넌트에서 처리)
  async speechToText(audioBlob) {
    // 실제로는 Conversation 컴포넌트에서 Web Speech API를 직접 사용
    // 여기서는 오디오 블롭을 받아서 처리하는 인터페이스만 제공
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 실제 구현에서는 이 부분이 Conversation 컴포넌트에서 처리됨
    return {
      text: "사용자 음성이 텍스트로 변환됩니다.",
      confidence: 0.9,
      language: 'en-US'
    };
  }

  // AI 응답 생성 시뮬레이션
  async generateResponse(userText, context = []) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 사용자 텍스트를 분석하여 적절한 응답 생성
    const responses = this.getContextualResponses(userText);
    const selectedResponse = responses[Math.floor(Math.random() * responses.length)];
    
    // 대화 기록 업데이트
    this.conversationHistory.push({
      role: 'user',
      content: userText,
      timestamp: new Date()
    });
    
    this.conversationHistory.push({
      role: 'assistant',
      content: selectedResponse,
      timestamp: new Date()
    });
    
    return {
      text: selectedResponse,
      audioUrl: null, // 실제로는 TTS로 생성된 오디오 URL
      suggestions: this.generateSuggestions(userText)
    };
  }

  getContextualResponses(userText) {
    const lowerText = userText.toLowerCase();
    
    if (lowerText.includes('hello') || lowerText.includes('hi')) {
      return [
        "Hello! It's great to meet you. I'm here to help you practice your English. What would you like to work on today?",
        "Hi there! I'm excited to be your conversation partner. How can I help you improve your English skills?",
        "Hello! Welcome to our English practice session. What topic would you like to discuss today?"
      ];
    }
    
    if (lowerText.includes('hobby') || lowerText.includes('like') || lowerText.includes('enjoy')) {
      return [
        "That sounds interesting! Hobbies are a great way to practice English. Can you tell me more about what you enjoy doing?",
        "I love hearing about people's interests! What made you start this hobby?",
        "That's wonderful! Hobbies can help you learn new vocabulary. What's your favorite part about it?"
      ];
    }
    
    if (lowerText.includes('pronunciation') || lowerText.includes('speak')) {
      return [
        "Pronunciation is very important! Let's practice some common phrases. Try repeating after me: 'How are you doing today?'",
        "Great focus on pronunciation! One tip is to listen carefully and practice slowly. What specific sounds do you find challenging?",
        "Excellent! Good pronunciation comes with practice. Let's work on some difficult words together."
      ];
    }
    
    if (lowerText.includes('weekend') || lowerText.includes('free time')) {
      return [
        "Weekends are perfect for relaxation and fun! What are your typical weekend activities?",
        "I love hearing about weekend plans! Do you usually stay home or go out?",
        "Weekends are great for recharging. What's your ideal way to spend a free day?"
      ];
    }
    
    // 기본 응답
    return [
      "That's very interesting! Can you tell me more about that?",
      "I'd love to hear more details about your experience.",
      "That sounds great! What else would you like to discuss?",
      "Thank you for sharing! Is there anything specific you'd like to practice?"
    ];
  }

  generateSuggestions(userText) {
    const suggestions = [
      "Tell me about your favorite movie",
      "What's your dream job?",
      "Describe your hometown",
      "What's your biggest challenge in learning English?",
      "Talk about your family"
    ];
    
    return suggestions.slice(0, 3);
  }

  // Text-to-Speech 시뮬레이션
  async textToSpeech(text) {
    // 실제로는 Web Speech API나 외부 TTS 서비스 사용
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 시뮬레이션된 오디오 URL 반환
    return {
      audioUrl: `data:audio/wav;base64,${btoa('simulated_audio_data')}`,
      duration: text.length * 0.1 // 대략적인 재생 시간
    };
  }

  // VAD (Voice Activity Detection) 시뮬레이션
  async detectVoiceActivity(audioData) {
    // 실제로는 Web Audio API를 사용한 VAD 구현
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      hasVoice: Math.random() > 0.3,
      confidence: Math.random() * 0.5 + 0.5
    };
  }

  // 대화 기록 가져오기
  getConversationHistory() {
    return this.conversationHistory;
  }

  // 대화 기록 초기화
  clearConversationHistory() {
    this.conversationHistory = [];
  }

  // 현재 주제 설정
  setTopic(topic) {
    this.currentTopic = topic;
  }

  // 현재 주제 가져오기
  getTopic() {
    return this.currentTopic;
  }
}

export default new AIService(); 