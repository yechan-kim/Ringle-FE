import networkService from './networkService';

// Gemini API 서비스
class GeminiService {
  constructor() {
    this.apiKey = null;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    this.conversationHistory = [];
    this.currentTopic = 'general';
    this.conversationContext = [];
    
    // 로컬 스토리지에서 API 키 로드
    this.loadApiKeyFromStorage();
  }

  // 로컬 스토리지에서 API 키 로드
  loadApiKeyFromStorage() {
    try {
      const storedApiKey = localStorage.getItem('gemini_api_key');
      if (storedApiKey) {
        this.apiKey = storedApiKey;
        console.log('API 키가 로컬 스토리지에서 로드되었습니다.');
      }
    } catch (error) {
      console.error('API 키 로드 실패:', error);
    }
  }

  // API 키 유효성 검증
  async validateApiKey(apiKey = null) {
    try {
      const keyToValidate = apiKey || this.apiKey;
      if (!keyToValidate) {
        throw new Error('API 키가 설정되지 않았습니다.');
      }

      // 간단한 테스트 요청으로 API 키 유효성 확인
      const testResponse = await fetch(`${this.baseUrl}?key=${keyToValidate}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: 'Hello' }]
          }]
        })
      });

      console.log('API 키 검증 요청 URL:', `${this.baseUrl}?key=${keyToValidate.substring(0, 10)}...`);
      console.log('API 키 검증 요청 바디:', JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: 'Hello' }]
        }]
      }));
      console.log('API 키 검증 응답 상태:', testResponse.status);
      console.log('API 키 검증 응답 헤더:', Object.fromEntries(testResponse.headers.entries()));

      if (!testResponse.ok) {
        let errorMessage = `API 요청 실패: ${testResponse.status}`;
        
        try {
          const errorData = await testResponse.json();
          if (errorData.error) {
            if (errorData.error.code === 400) {
              errorMessage = 'API 키가 유효하지 않습니다.';
            } else if (errorData.error.message) {
              errorMessage = errorData.error.message;
            }
          }
        } catch {
          // JSON 파싱 실패 시 상태 코드로 판단
          if (testResponse.status === 404) {
            errorMessage = 'API 엔드포인트를 찾을 수 없습니다. API 키를 확인해주세요.';
          } else if (testResponse.status === 403) {
            errorMessage = 'API 키가 유효하지 않거나 권한이 없습니다.';
          } else if (testResponse.status === 401) {
            errorMessage = 'API 키가 유효하지 않습니다.';
          }
        }
        
        throw new Error(errorMessage);
      }

      // 성공적인 응답인지 확인
      const responseData = await testResponse.json();
      if (!responseData.candidates || !responseData.candidates[0]) {
        throw new Error('API 응답이 올바르지 않습니다.');
      }

      return true;
    } catch (error) {
      console.error('API 키 검증 실패:', error);
      throw error;
    }
  }

  // Gemini API 호출
  async generateResponse(userText) {
    try {
      if (!this.apiKey) {
        throw new Error('Gemini API 키가 설정되지 않았습니다.');
      }

      // 대화 기록에 사용자 메시지 추가
      this.conversationHistory.push({
        role: 'user',
        parts: [{ text: userText }]
      });

      // 대화 컨텍스트 업데이트
      this.conversationContext.push({
        role: 'user',
        parts: [{ text: userText }]
      });

      // 최근 5개의 대화만 유지 (컨텍스트 길이 제한)
      if (this.conversationContext.length > 10) {
        this.conversationContext = this.conversationContext.slice(-10);
      }

      // Gemini API 요청 데이터 구성 (컨텍스트 포함)
      const requestData = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `당신은 영어 회화 튜터입니다. 사용자가 영어로 말하면 자연스럽고 도움이 되는 영어로 응답해주세요. 
                응답은 영어로 해주되, 한국어 사용자도 이해할 수 있도록 간단하고 명확하게 해주세요.
                사용자의 영어 실력을 향상시키는 데 도움이 되는 응답을 해주세요.
                이전 대화 컨텍스트를 참고하여 일관성 있는 대화를 유지해주세요.
                
                이전 대화:
                ${this.conversationContext.slice(0, -1).map(msg => 
                  `${msg.role === 'user' ? '사용자' : 'AI'}: ${msg.parts[0].text}`
                ).join('\n')}
                
                현재 사용자: ${userText}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

      // 네트워크 서비스를 사용한 안전한 API 호출
      const data = await networkService.post(`${this.baseUrl}?key=${this.apiKey}`, requestData);
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const aiResponse = data.candidates[0].content.parts[0].text;
        
        // 대화 기록에 AI 응답 추가
        this.conversationHistory.push({
          role: 'model',
          parts: [{ text: aiResponse }]
        });

        // 컨텍스트에도 AI 응답 추가
        this.conversationContext.push({
          role: 'model',
          parts: [{ text: aiResponse }]
        });

        return {
          text: aiResponse,
          audioUrl: null, // 나중에 TTS 추가 가능
          suggestions: this.generateSuggestions()
        };
      } else {
        console.error('API 응답 데이터:', data);
        throw new Error('API 응답 형식이 올바르지 않습니다. 응답에 candidates가 없습니다.');
      }
    } catch (error) {
      console.error('Gemini API 오류:', error);
      
      // API 오류 시 기본 응답 반환
      return {
        text: "I'm sorry, I'm having trouble connecting right now. Could you please try again?",
        audioUrl: null,
        suggestions: this.generateSuggestions(userText)
      };
    }
  }

  // 대화 제안 생성
  generateSuggestions() {
    const suggestions = [
      "Tell me about your favorite movie",
      "What's your dream job?",
      "Describe your hometown",
      "What's your biggest challenge in learning English?",
      "Talk about your family",
      "What do you like to do on weekends?",
      "What's your favorite food?",
      "How do you practice English?"
    ];
    
    return suggestions.slice(0, 3);
  }

  // 대화 기록 가져오기
  getConversationHistory() {
    return this.conversationHistory;
  }

  // 대화 기록 초기화
  clearConversationHistory() {
    this.conversationHistory = [];
  }

  // API 키 설정
  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  // API 키 확인
  hasApiKey() {
    return !!this.apiKey;
  }
}

const geminiService = new GeminiService();
export { geminiService };
export default geminiService; 