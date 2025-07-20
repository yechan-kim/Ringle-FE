import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, ArrowLeft } from 'lucide-react';
import networkService from '../services/networkService';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useMessages } from '../hooks/useMessages';
import { useMembership } from '../hooks/useMembership';

// Styled Components
const ConversationContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const BackButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 10px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
`;

const SessionInfo = styled.div`
  font-size: 0.9rem;
  opacity: 0.8;
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Message = styled(motion.div)`
  display: flex;
  align-items: flex-start;
  gap: 15px;
  max-width: 80%;
  ${props => props.isUser ? 'margin-left: auto; flex-direction: row-reverse;' : ''}
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  ${props => props.isUser 
    ? 'background: linear-gradient(45deg, #ff6b6b, #ee5a24);' 
    : 'background: linear-gradient(45deg, #4ecdc4, #44a08d);'
  }
`;

const MessageContent = styled.div`
  background: ${props => props.isUser 
    ? 'rgba(255, 255, 255, 0.2)' 
    : 'rgba(255, 255, 255, 0.1)'
  };
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 15px 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 100%;
  word-wrap: break-word;
`;

const MessageText = styled.p`
  margin: 0;
  line-height: 1.5;
  font-size: 1rem;
`;

const MessageTime = styled.div`
  font-size: 0.8rem;
  opacity: 0.7;
  margin-top: 5px;
`;

const ControlsContainer = styled.div`
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
`;

const MicButton = styled(motion.button)`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: none;
  background: ${props => props.isRecording 
    ? 'linear-gradient(45deg, #ff6b6b, #ee5a24)' 
    : 'linear-gradient(45deg, #4ecdc4, #44a08d)'
  };
  color: white;
  font-size: 2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusText = styled.div`
  text-align: center;
  margin: 10px 0;
  font-size: 0.9rem;
  opacity: 0.8;
`;

const ProcessingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  margin: 10px 0;
`;

const Spinner = styled(motion.div)`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
`;

// Text Input Modal Components
const TextInputOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const TextInputCard = styled.div`
  background: white;
  color: #333;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;
`;

const SubmitButton = styled(motion.button)`
  flex: 1;
  background: linear-gradient(45deg, #4ecdc4, #44a08d);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(motion.button)`
  flex: 1;
  background: rgba(255, 255, 255, 0.2);
  color: #333;
  border: 1px solid #ddd;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

// Membership Modal Components
const MembershipModal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const MembershipCard = styled.div`
  background: white;
  color: #333;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const MembershipItem = styled.div`
  padding: 20px;
  border: 2px solid ${props => props.className === 'available' ? '#4ecdc4' : '#ddd'};
  border-radius: 15px;
  margin: 10px 0;
  cursor: ${props => props.className === 'available' ? 'pointer' : 'not-allowed'};
  transition: all 0.3s ease;
  background: ${props => props.className === 'available' ? 'rgba(78, 205, 196, 0.1)' : 'rgba(255, 255, 255, 0.5)'};

  &:hover {
    transform: ${props => props.className === 'available' ? 'translateY(-2px)' : 'none'};
    box-shadow: ${props => props.className === 'available' ? '0 5px 15px rgba(0, 0, 0, 0.1)' : 'none'};
  }
`;

const MembershipTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 1.2rem;
  font-weight: bold;
`;

const MembershipInfo = styled.div`
  margin: 5px 0;
  font-size: 0.9rem;
  color: #666;
`;

const MembershipStatus = styled.div`
  margin-top: 10px;
  font-weight: bold;
  color: ${props => props.className === 'available' ? '#4ecdc4' : '#ff6b6b'};
`;

const Conversation = () => {
  const navigate = useNavigate();
  
  // 커스텀 훅 사용
  const { isRecording, isProcessing, startRecording, stopRecording } = useSpeechRecognition();
  const { messages, addUserMessage, generateAIResponse, addMessage, generateUniqueId, clearMessages } = useMessages();
  const { membership, allMemberships, showMembershipModal, setShowMembershipModal, setMembership, reloadMembership } = useMembership();
  
  // 로컬 상태
  const [recognizedText, setRecognizedText] = useState('');
  const [showRecognitionResult, setShowRecognitionResult] = useState(false);

  // 컴포넌트 마운트 시 초기 인사 메시지 추가
  useEffect(() => {
    if (messages.length === 0) {
      // AI가 먼저 인사 (한 번만 실행되도록 수정)
      const initialMessage = {
        id: generateUniqueId(),
        text: "Hello! I'm your English conversation partner. What topic would you like to discuss today?",
        isUser: false,
        timestamp: new Date()
      };
      
      // 즉시 메시지 추가 (setTimeout 제거)
      addMessage(initialMessage);
    }
  }, []); // 의존성 배열을 비워서 한 번만 실행

  const handleMicClick = async () => {
    console.log('마이크 버튼 클릭됨');
    console.log('isRecording:', isRecording);
    console.log('isProcessing:', isProcessing);
    console.log('현재 멤버십:', membership);
    console.log('모든 멤버십:', allMemberships);
    
    if (isRecording) {
      stopRecording();
      // 음성 인식 결과 모달 표시 (중단된 경우)
      if (!recognizedText) {
        setRecognizedText('');
        setShowRecognitionResult(true);
      }
    } else {
      const result = await startRecording(membership, networkService);
      
      if (result.success) {
        // 인식된 텍스트를 사용자에게 보여주고 확인 요청
        const userText = result.text;
        console.log('음성 인식 텍스트:', userText);
        
        // 인식된 텍스트를 상태에 저장하고 확인 모달 표시
        setRecognizedText(userText);
        setShowRecognitionResult(true);
      } else {
        // 에러 처리
        console.log('음성 인식 실패:', result.reason);
        if (result.reason === 'no_membership' || result.reason === 'no_conversations') {
          console.log('멤버십 문제로 모달 표시');
          setShowMembershipModal(true);
        } else if (result.reason === 'empty_text') {
          alert('음성을 인식하지 못했습니다. 텍스트로 입력해주세요.');
          setRecognizedText('');
          setShowRecognitionResult(true);
        } else {
          alert('음성 인식에 실패했습니다. 텍스트로 입력해주세요.');
          setRecognizedText('');
          setShowRecognitionResult(true);
        }
      }
    }
  };

  const handleRecognitionSubmit = async () => {
    if (recognizedText.trim() && recognizedText.trim().length >= 1) {
      setShowRecognitionResult(false);
      
      // 사용자 메시지 추가
      addUserMessage(recognizedText.trim());
      
      // AI 응답 생성
      await generateAIResponse(recognizedText.trim());
      
      setRecognizedText('');
    }
  };

  const handleRecognitionCancel = () => {
    setShowRecognitionResult(false);
    setRecognizedText('');
  };

  return (
    <ConversationContainer>
      <Header>
        <BackButton
          onClick={() => navigate('/home')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft size={20} />
        </BackButton>
        <div>
          <Title>AI 영어 회화</Title>
          <SessionInfo>
            {membership ? 
              `남은 대화: ${membership.conversationLimit === -1 ? '무제한' : 
                Math.max(0, (Number(membership.conversationLimit) || 0) - (Number(membership.conversationUsed) || 0))}회` : 
              '멤버십 없음'
            }
          </SessionInfo>
        </div>
        <ClearButton
          onClick={() => {
            if (window.confirm('모든 대화 내용을 삭제하시겠습니까?')) {
              clearMessages();
            }
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          🗑️
        </ClearButton>
        <div style={{ width: 40 }}></div>
      </Header>

      {/* 음성 인식 결과 오버레이 */}
      {showRecognitionResult && (
        <TextInputOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <TextInputCard>
            <h3>음성 인식 결과</h3>
            {recognizedText && (
              <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px', marginBottom: '20px' }}>
                인식된 텍스트: "{recognizedText}"
              </div>
            )}
            {!recognizedText && (
              <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px', marginBottom: '20px' }}>
                Please enter text in English.
              </div>
            )}
            <textarea
              placeholder="영어로 텍스트를 입력하세요..."
              value={recognizedText}
              onChange={(e) => {
                const value = e.target.value;
                // 한글 입력 방지 (영어, 숫자, 특수문자만 허용)
                const englishOnly = value.replace(/[^a-zA-Z0-9\s.,!?;:'"()-]/g, '');
                setRecognizedText(englishOnly);
              }}
              onKeyDown={(e) => {
                // Enter 키로 자동 제출 방지
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                }
              }}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '16px',
                lineHeight: '1.5',
                minHeight: '80px',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
            <ButtonGroup>
              <SubmitButton
                onClick={handleRecognitionSubmit}
                disabled={!recognizedText.trim() || recognizedText.trim().length < 1}
                whileHover={{ scale: (recognizedText.trim() && recognizedText.trim().length >= 1) ? 1.05 : 1 }}
                whileTap={{ scale: (recognizedText.trim() && recognizedText.trim().length >= 1) ? 0.95 : 1 }}
                style={{ 
                  opacity: (recognizedText.trim() && recognizedText.trim().length >= 1) ? 1 : 0.5,
                  cursor: (recognizedText.trim() && recognizedText.trim().length >= 1) ? 'pointer' : 'not-allowed'
                }}
              >
                {recognizedText && recognizedText.trim().length >= 1 ? '답변 완료' : '텍스트 입력 완료'}
              </SubmitButton>
              <CancelButton
                onClick={handleRecognitionCancel}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                다시 녹음
              </CancelButton>
            </ButtonGroup>
          </TextInputCard>
        </TextInputOverlay>
      )}

      <MessagesContainer>
        <AnimatePresence mode="wait">
          {messages.map((message, index) => (
            <Message
              key={`${message.id}-${index}`}
              isUser={message.isUser}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Avatar isUser={message.isUser}>
                {message.isUser ? '👤' : '🤖'}
              </Avatar>
              <MessageContent isUser={message.isUser}>
                <MessageText>{message.text}</MessageText>
                <MessageTime>
                  {message.timestamp ? message.timestamp.toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  }) : ''}
                </MessageTime>
              </MessageContent>
            </Message>
          ))}
        </AnimatePresence>

        {isProcessing && (
          <ProcessingIndicator>
            <Spinner animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
            <span>처리 중...</span>
          </ProcessingIndicator>
        )}
      </MessagesContainer>

      <ControlsContainer>
        <MicButton
          onClick={handleMicClick}
          isRecording={isRecording}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={false} // 항상 활성화
        >
          {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
        </MicButton>
        
        {isRecording && (
          <StatusText>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              🎤 영어로 말씀해주세요... (말을 끝내면 자동으로 완료됩니다)
            </motion.div>
          </StatusText>
        )}
        
        {!isRecording && !isProcessing && (
          <StatusText>
            {messages.length === 0 ? '마이크를 눌러서 대화를 시작하세요' : '마이크를 눌러서 영어로 말씀하세요'}
          </StatusText>
        )}
        
        {isProcessing && !isRecording && (
          <StatusText>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              🤖 AI가 응답을 생성하고 있습니다...
            </motion.div>
          </StatusText>
        )}
      </ControlsContainer>

      {/* 멤버십 선택 모달 */}
      {showMembershipModal && (
        <MembershipModal
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <MembershipCard>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
              멤버십 선택
            </h2>
            <p style={{ textAlign: 'center', marginBottom: '30px', color: '#666' }}>
              대화를 진행할 멤버십을 선택해주세요.
            </p>
            
            {allMemberships.length > 0 ? (
              allMemberships.map((membershipItem, index) => {
                const remaining = membershipItem.conversationLimit === -1 ? 
                  '무제한' : 
                  Math.max(0, (Number(membershipItem.conversationLimit) || 0) - (Number(membershipItem.conversationUsed) || 0));
                const isAvailable = membershipItem.conversationLimit === -1 || remaining > 0;
                
                return (
                  <MembershipItem
                    key={index}
                    className={isAvailable ? 'available' : 'unavailable'}
                    onClick={() => {
                      if (isAvailable) {
                        setMembership(membershipItem);
                        setShowMembershipModal(false);
                        console.log('선택된 멤버십:', membershipItem);
                      }
                    }}
                  >
                    <MembershipTitle>{membershipItem.membershipName || `멤버십 ${index + 1}`}</MembershipTitle>
                    <MembershipInfo>
                      대화 제한: {membershipItem.conversationLimit === -1 ? '무제한' : membershipItem.conversationLimit}회
                    </MembershipInfo>
                    <MembershipInfo>
                      사용된 대화: {membershipItem.conversationUsed || 0}회
                    </MembershipInfo>
                    <MembershipInfo>
                      남은 대화: {remaining}회
                    </MembershipInfo>
                    <MembershipInfo style={{ fontSize: '0.8rem', color: '#999' }}>
                      멤버십 ID: {membershipItem.id} | 사용자 ID: {membershipItem.userId}
                    </MembershipInfo>
                    <MembershipStatus className={isAvailable ? 'available' : 'unavailable'}>
                      {isAvailable ? '✅ 사용 가능' : '❌ 사용 불가'}
                    </MembershipStatus>
                  </MembershipItem>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', color: '#666' }}>
                멤버십이 없습니다. 홈 화면에서 멤버십을 구매해주세요.
              </div>
            )}
            
            <ButtonGroup>
              <SubmitButton
                onClick={async () => {
                  console.log('멤버십 새로고침 버튼 클릭');
                  // 멤버십 정보 다시 로드
                  await reloadMembership();
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                멤버십 새로고침
              </SubmitButton>
              <CancelButton
                onClick={() => navigate('/home')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                홈으로 돌아가기
              </CancelButton>
            </ButtonGroup>
          </MembershipCard>
        </MembershipModal>
      )}
    </ConversationContainer>
  );
};

export default Conversation; 