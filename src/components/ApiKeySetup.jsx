import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { Key, CheckCircle, AlertCircle } from 'lucide-react';
import geminiService from '../services/geminiService';

const SetupContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const SetupCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const Description = styled.p`
  font-size: 1rem;
  margin-bottom: 30px;
  opacity: 0.9;
  line-height: 1.6;
`;

const Input = styled.input`
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 1rem;
  margin-bottom: 20px;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
  }
`;

const Button = styled(motion.button)`
  background: linear-gradient(45deg, #4ecdc4, #44a08d);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 auto;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatusMessage = styled.div`
  margin-top: 20px;
  padding: 15px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
`;

const SuccessMessage = styled(StatusMessage)`
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
`;

const ErrorMessage = styled(StatusMessage)`
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
`;

const Link = styled.a`
  color: #4ecdc4;
  text-decoration: none;
  font-weight: bold;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ApiKeySetup = () => {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setStatus('error');
      return;
    }

    setIsLoading(true);
    setStatus('');
    setErrorMessage('');
    
    try {
      // API 키 설정
      geminiService.setApiKey(apiKey.trim());
      
      // API 키 유효성 검증
      await geminiService.validateApiKey();
      
      setStatus('success');
      setTimeout(() => {
        navigate('/home');
      }, 2000);
    } catch (error) {
      console.error('API 키 테스트 실패:', error);
      setStatus('error');
      setErrorMessage(error.message || 'API 키가 유효하지 않습니다.');
      // API 키를 다시 초기화
      geminiService.setApiKey('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SetupContainer>
      <SetupCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Title>
          <Key size={32} />
          API 키 설정
        </Title>
        
        <Description>
          Gemini API 키를 입력하여 AI 영어 회화 튜터를 활성화하세요.
          <br />
          <Link href="https://makersuite.google.com/app/apikey" target="_blank">
            Google AI Studio에서 API 키 발급받기
          </Link>
        </Description>
        
        <form onSubmit={handleSubmit}>
          <Input
            type="password"
            placeholder="Gemini API 키를 입력하세요"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            disabled={isLoading}
          />
          
          <Button
            type="submit"
            disabled={isLoading || !apiKey.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? '테스트 중...' : 'API 키 설정'}
          </Button>
        </form>
        
        {status === 'success' && (
          <SuccessMessage>
            <CheckCircle size={20} />
            API 키가 성공적으로 설정되었습니다!
          </SuccessMessage>
        )}
        
        {status === 'error' && (
          <ErrorMessage>
            <AlertCircle size={20} />
            {errorMessage || 'API 키 설정에 실패했습니다. 키를 확인해주세요.'}
          </ErrorMessage>
        )}
      </SetupCard>
    </SetupContainer>
  );
};

export default ApiKeySetup; 