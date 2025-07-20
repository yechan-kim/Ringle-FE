import { useState } from 'react';
import geminiService from '../services/geminiService';
import membershipService from '../services/membershipService';

export const useMessages = () => {
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // 고유한 ID 생성 함수
  const generateUniqueId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const addMessage = (message) => {
    setMessages(prev => {
      // 중복 메시지 방지 (같은 ID가 있으면 추가하지 않음)
      const isDuplicate = prev.some(existingMessage => 
        existingMessage.id === message.id || 
        (existingMessage.text === message.text && 
         existingMessage.isUser === message.isUser &&
         Math.abs(new Date(existingMessage.timestamp) - new Date(message.timestamp)) < 1000)
      );
      
      if (isDuplicate) {
        console.log('중복 메시지 감지, 추가하지 않음:', message);
        return prev;
      }
      
      return [...prev, message];
    });
  };

  const generateAIResponse = async (userText) => {
    setIsProcessing(true);
    
    try {
      // 대화 횟수 차감
      try {
        await membershipService.useFeature('CONVERSATION');
        console.log('대화 횟수 차감 완료');
      } catch (error) {
        console.error('대화 횟수 차감 실패:', error);
        alert('대화 횟수가 부족하거나 차감에 실패했습니다.');
        setIsProcessing(false);
        return;
      }

      // Gemini API를 사용한 응답 생성
      const aiResponse = await geminiService.generateResponse(userText);
      
      addMessage({
        id: generateUniqueId(),
        text: aiResponse.text,
        isUser: false,
        timestamp: new Date(),
        audioUrl: null // 실제로는 TTS로 생성된 오디오 URL
      });
      
      setIsProcessing(false);
    } catch (error) {
      console.error('AI 응답 생성 실패:', error);
      setIsProcessing(false);
      alert('AI 응답 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const addUserMessage = (text) => {
    addMessage({
      id: generateUniqueId(),
      text: text,
      isUser: true,
      timestamp: new Date()
    });
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    isProcessing,
    addMessage,
    addUserMessage,
    generateAIResponse,
    generateUniqueId,
    clearMessages
  };
}; 