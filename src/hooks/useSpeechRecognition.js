import { useState } from 'react';

export const useSpeechRecognition = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const performSpeechRecognition = () => {
    return new Promise((resolve, reject) => {
      console.log('=== 간단한 STT 시작 ===');
      
      // 브라우저 지원 확인
      if (!window.webkitSpeechRecognition && !window.SpeechRecognition) {
        reject(new Error('음성 인식이 지원되지 않습니다. 텍스트로 입력해주세요.'));
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      // 관대한 설정
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true; // 중간 결과 활성화
      recognition.maxAlternatives = 5; // 여러 대안 결과

      let hasResult = false;

      recognition.onstart = () => {
        console.log('음성 인식 시작');
        hasResult = false;
      };

      recognition.onerror = (event) => {
        console.error('음성 인식 오류:', event.error);
        reject(new Error('음성 인식에 실패했습니다. 텍스트로 입력해주세요.'));
      };

      recognition.onend = () => {
        console.log('음성 인식 종료');
        if (!hasResult) {
          reject(new Error('음성이 인식되지 않았습니다. 다시 말씀해주세요.'));
        }
      };

      // 15초 타임아웃 (더 긴 시간)
      const timeout = setTimeout(() => {
        if (!hasResult) {
          recognition.stop();
          reject(new Error('음성 인식 타임아웃 (15초)'));
        }
      }, 15000);

      recognition.onresult = (event) => {
        console.log('음성 인식 결과:', event);
        
        if (event.results.length > 0) {
          const result = event.results[event.results.length - 1];
          console.log('현재 결과:', result);
          
          // 최종 결과인 경우에만 처리
          if (result.isFinal) {
            // 모든 대안 결과 확인
            for (let i = 0; i < result.length; i++) {
              const transcript = result[i].transcript;
              const confidence = result[i].confidence;
              
              console.log(`대안 ${i + 1}: "${transcript}" (신뢰도: ${(confidence * 100).toFixed(1)}%)`);
              
              // 텍스트가 있고 공백이 아닌 경우
              if (transcript && transcript.trim() && transcript.trim().length > 0) {
                hasResult = true;
                clearTimeout(timeout);
                console.log('음성 인식 성공!');
                resolve({
                  text: transcript.trim(),
                  confidence: confidence
                });
                return;
              }
            }
          } else {
            // 중간 결과는 로그만 출력, 처리하지 않음
            const interimText = result[0].transcript;
            if (interimText && interimText.trim()) {
              console.log('중간 결과 (처리하지 않음):', interimText);
            }
          }
        }
      };

      // 음성 인식 시작
      console.log('이제 영어로 말씀해주세요!');
      recognition.start();
    });
  };

  const startRecording = async (membership, networkService) => {
    try {
      console.log('대화 시작 시도, 현재 멤버십:', membership);
      
      // 멤버십 확인 및 대화 횟수 체크
      if (membership) {
        const remainingConversations = membership.conversationLimit === -1 ? 
          Infinity : 
          ((Number(membership.conversationLimit) || 0) - (Number(membership.conversationUsed) || 0));
        
        console.log('남은 대화 횟수:', remainingConversations);
        
        if (remainingConversations <= 0) {
          console.log('대화 횟수가 없음, 멤버십 선택 모달 표시');
          return { success: false, reason: 'no_conversations' };
        }
      } else {
        console.log('멤버십이 없음, 멤버십 선택 모달 표시');
        return { success: false, reason: 'no_membership' };
      }

      console.log('대화 시작 가능, 실시간 STT 시작');
      
      // 마이크 권한 확인
      try {
        const micPermission = await navigator.permissions.query({ name: 'microphone' });
        if (micPermission.state === 'denied') {
          throw new Error('마이크 권한이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해주세요.');
        }
      } catch (error) {
        console.log('마이크 권한 확인 실패:', error);
      }
      
      // 네트워크 상태 확인
      if (networkService.isOffline()) {
        throw new Error('오프라인 상태입니다. 인터넷 연결을 확인해주세요.');
      }

      // 상태 업데이트
      setIsRecording(true);
      setIsProcessing(true);
      
      // 실시간 STT 시작
      const recognitionResult = await performSpeechRecognition();
      
      if (recognitionResult && recognitionResult.text && recognitionResult.text.trim()) {
        console.log('음성 인식 성공:', recognitionResult.text.trim());
        console.log('음성 인식 신뢰도:', (recognitionResult.confidence * 100).toFixed(1) + '%');
        
        return { 
          success: true, 
          text: recognitionResult.text.trim(),
          confidence: recognitionResult.confidence
        };
      } else {
        console.log('음성 인식 실패: 빈 텍스트');
        return { success: false, reason: 'empty_text' };
      }
      
    } catch (error) {
      console.error('음성 인식 실패:', error);
      return { success: false, reason: 'error', error: error.message };
    } finally {
      setIsRecording(false);
      setIsProcessing(false);
    }
  };

  const stopRecording = () => {
    console.log('음성 인식 중지');
    setIsRecording(false);
    setIsProcessing(false);
  };

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording
  };
}; 