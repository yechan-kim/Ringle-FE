import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { Crown, ShoppingCart, Users, MessageCircle, Star, CreditCard, Key } from 'lucide-react';
import { backendService } from '../services/backendService';
import geminiService from '../services/geminiService';

const HomeContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 40px;
`;

const Logo = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 10px;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 20px;
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
  flex-wrap: wrap;
`;

const NavButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  padding: 12px 20px;
  border-radius: 25px;
  color: white;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;

const MembershipCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  margin: 20px auto;
  max-width: 500px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const MembershipTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const MembershipInfo = styled.div`
  margin-bottom: 20px;
`;

const MembershipType = styled.div`
  font-size: 1.1rem;
  margin-bottom: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
`;

const RemainingSessions = styled.div`
  font-size: 1rem;
  color: #ffd700;
  margin-bottom: 15px;
`;

const Button = styled(motion.button)`
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  margin: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 40px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
`;

const FeatureCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 25px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const FeatureIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 15px;
  color: #ffd700;
`;

const FeatureTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 10px;
`;

const FeatureDescription = styled.p`
  font-size: 0.9rem;
  opacity: 0.8;
  line-height: 1.5;
`;

const PurchaseModal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  color: #333;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 20px;
  text-align: center;
  color: #333;
`;

const MembershipOption = styled.div`
  border: 2px solid #e0e0e0;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #667eea;
    background: #f8f9ff;
  }
  
  &.selected {
    border-color: #667eea;
    background: #f0f2ff;
  }
`;

const MembershipOptionTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 10px;
  color: #333;
`;

const MembershipOptionPrice = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 10px;
`;

const MembershipOptionFeatures = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 15px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #333;
  }
`;

const CancelButton = styled.button`
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  color: #6c757d;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  margin-top: 15px;
  width: 100%;
  
  &:hover {
    background: #e9ecef;
    color: #495057;
  }
`;

const PaymentForm = styled.div`
  margin-top: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const CardNumberInput = styled(Input)`
  letter-spacing: 2px;
`;

const CardExpiryInput = styled(Input)`
  width: 60%;
`;

const CardCvcInput = styled(Input)`
  width: 35%;
  margin-left: 5%;
`;

const PaymentButton = styled.button`
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  margin-top: 15px;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const PaymentSummary = styled.div`
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #e9ecef;
`;

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
    font-weight: bold;
    font-size: 1.1rem;
    color: #667eea;
  }
`;

const ApiKeySection = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  margin: 20px auto;
  max-width: 500px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ApiKeyTitle = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ApiKeyInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.9rem;
  margin-bottom: 15px;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
  
  &:focus {
    outline: none;
    border-color: #ffd700;
  }
`;

const ApiKeyButton = styled(motion.button)`
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  color: #333;
  border: none;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  margin-right: 10px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 215, 0, 0.3);
  }
`;

const ApiKeyStatus = styled.div`
  font-size: 0.95rem;
  margin-top: 15px;
  padding: 12px 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  backdrop-filter: blur(10px);
  border: 1px solid;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  &.valid {
    background: rgba(76, 175, 80, 0.15);
    color: white;
    border-color: rgba(76, 175, 80, 0.4);
  }
  
  &.invalid {
    background: rgba(244, 67, 54, 0.15);
    color: white;
    border-color: rgba(244, 67, 54, 0.4);
  }
  
  &.loading {
    background: rgba(33, 150, 243, 0.15);
    color: white;
    border-color: rgba(33, 150, 243, 0.4);
  }
`;

const PaymentMethodGroup = styled.div`
  margin-bottom: 20px;
`;

const PaymentMethodLabel = styled.label`
  display: block;
  margin-bottom: 10px;
  font-weight: 500;
  color: #333;
`;

const PaymentMethodOptions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const PaymentMethodOption = styled.div`
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #667eea;
    background: #f8f9ff;
  }
  
  &.selected {
    border-color: #667eea;
    background: #f0f2ff;
    color: #667eea;
    font-weight: bold;
  }
`;

const Home = () => {
  const navigate = useNavigate();
  const [membership, setMembership] = useState(null);
  const [availableMemberships, setAvailableMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardExpiry: '',
    cardCvc: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [apiKey, setApiKey] = useState('');
  const [apiKeyStatus, setApiKeyStatus] = useState(''); // 'valid', 'invalid', 'loading', ''

  useEffect(() => {
    // 저장된 API 키 로드
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      geminiService.setApiKey(savedApiKey);
      setApiKeyStatus('valid');
    }

    // 멤버십 정보와 구매 가능한 멤버십 목록 가져오기
    const loadData = async () => {
      try {
        // 구매 가능한 멤버십 목록 가져오기
        const memberships = await backendService.getAllMemberships();
        console.log('멤버십 목록 응답:', memberships);
        
        // API 응답 구조에 따라 데이터 추출
        let membershipList = [];
        if (memberships && memberships.data) {
          membershipList = memberships.data;
        } else if (Array.isArray(memberships)) {
          membershipList = memberships;
        } else if (memberships && Array.isArray(memberships.result)) {
          membershipList = memberships.result;
        }
        
        console.log('처리된 멤버십 목록:', membershipList);
        setAvailableMemberships(membershipList);
        
        // 사용자의 현재 활성 멤버십 정보 가져오기 (userId=1로 고정)
        try {
          const userMemberships = await backendService.getActiveUserMemberships();
          console.log('사용자 멤버십 응답:', userMemberships);
          
          // API 응답 구조에 따라 데이터 추출
          let membershipList = [];
          if (userMemberships && userMemberships.data) {
            membershipList = userMemberships.data;
          } else if (Array.isArray(userMemberships)) {
            membershipList = userMemberships;
          } else if (userMemberships && Array.isArray(userMemberships.result)) {
            membershipList = userMemberships.result;
          }
          
          // 활성 멤버십이 있으면 첫 번째 것을 사용
          if (membershipList.length > 0) {
            const activeMembership = membershipList[0];
            console.log('활성 멤버십:', activeMembership);
            setMembership(activeMembership);
          } else {
            console.log('활성 멤버십이 없습니다.');
            setMembership(null);
          }
        } catch (error) {
          console.log('사용자 멤버십 조회 실패:', error);
          setMembership(null);
        }
      } catch (error) {
        console.error('멤버십 정보 로드 실패:', error);
        setAvailableMemberships([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleStartConversation = () => {
    console.log('대화 시작 버튼 클릭됨');
    console.log('현재 멤버십:', membership);
    
    if (!membership) {
      console.log('멤버십이 없음');
      alert('멤버십이 없습니다. 멤버십을 구매해주세요.');
      return;
    }
    
    // 무제한이거나 사용 가능한 횟수가 남아있는지 확인
    const remainingConversations = membership.conversationLimit === -1 ? 
      -1 : // 무제한
      ((Number(membership.conversationLimit) || 0) - (Number(membership.conversationUsed) || 0));
    
    console.log('남은 대화 횟수:', remainingConversations);
    
    if (remainingConversations === -1 || remainingConversations > 0) {
      console.log('대화 페이지로 이동');
      navigate('/conversation');
    } else {
      console.log('대화 횟수가 없음');
      alert('남은 대화 횟수가 없습니다. 멤버십을 구매해주세요.');
    }
  };

  const handleMembershipSelect = (membership) => {
    setSelectedMembership(membership);
    setShowPurchaseModal(false);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedMembership) return;
    
    // 입력 검증
    if (paymentMethod === 'CREDIT_CARD' || paymentMethod === 'CHECK_CARD') {
      if (!paymentInfo.cardNumber || !paymentInfo.cardExpiry || !paymentInfo.cardCvc) {
        alert('모든 결제 정보를 입력해주세요.');
        return;
      }
    }
    
    try {
      const paymentData = {
        membershipId: selectedMembership.id,
        paymentMethod: paymentMethod,
        cardNumber: paymentInfo.cardNumber,
        cardExpiry: paymentInfo.cardExpiry,
        cardCvc: paymentInfo.cardCvc
      };
      
      await backendService.processPayment(paymentData);
      alert('멤버십 구매가 완료되었습니다!');
      
      // 구매 후 멤버십 정보 새로고침
      const userMembership = await backendService.getMembership(1);
      if (userMembership && userMembership.data) {
        setMembership(userMembership.data);
      } else if (userMembership && userMembership.result) {
        setMembership(userMembership.result);
      } else {
        setMembership(userMembership);
      }
      
      // 모달 닫기 및 상태 초기화
      setShowPaymentModal(false);
      setSelectedMembership(null);
      setPaymentInfo({ cardNumber: '', cardExpiry: '', cardCvc: '' });
      setPaymentMethod('CREDIT_CARD');
    } catch (error) {
      console.error('멤버십 구매 실패:', error);
      alert('멤버십 구매에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
    setSelectedMembership(null);
    setPaymentInfo({ cardNumber: '', cardExpiry: '', cardCvc: '' });
    setPaymentMethod('CREDIT_CARD');
  };

  const handleApiKeyValidation = async () => {
    if (!apiKey.trim()) {
      setApiKeyStatus('invalid');
      return;
    }

    setApiKeyStatus('loading');
    
    try {
      // Gemini API 키 검증
      await geminiService.validateApiKey(apiKey);
      
      // API 키를 로컬 스토리지에 저장
      localStorage.setItem('gemini_api_key', apiKey);
      
      // Gemini 서비스에 API 키 설정
      geminiService.setApiKey(apiKey);
      
      setApiKeyStatus('valid');
    } catch (error) {
      console.error('API 키 검증 실패:', error);
      setApiKeyStatus('invalid');
    }
  };

  const handleApiKeyClear = () => {
    localStorage.removeItem('gemini_api_key');
    geminiService.setApiKey('');
    setApiKey('');
    setApiKeyStatus('');
  };

  if (loading) {
    return (
      <HomeContainer>
        <div style={{ textAlign: 'center', paddingTop: '100px' }}>
          <div style={{ fontSize: '2rem' }}>로딩 중...</div>
        </div>
      </HomeContainer>
    );
  }

  return (
    <HomeContainer>
      <Header>
        <Logo>Ringle Plus</Logo>
        <Subtitle>AI와 함께하는 영어 회화 연습</Subtitle>
        

      </Header>

      <MembershipCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <MembershipTitle>
          <Crown size={24} />
          멤버십 정보
        </MembershipTitle>
        
        <MembershipInfo>
          <MembershipType>
            {membership?.membershipName || '멤버십 없음'}
          </MembershipType>
          {membership ? (
            <>
              <RemainingSessions>
                사용한 대화 횟수: {membership.conversationUsed || 0} / {membership.conversationLimit === -1 ? '무제한' : membership.conversationLimit || 0}
              </RemainingSessions>
              {membership.analysisLimit && (
                <RemainingSessions>
                  사용한 분석 횟수: {membership.analysisUsed || 0} / {membership.analysisLimit === -1 ? '무제한' : membership.analysisLimit}
                </RemainingSessions>
              )}
              <RemainingSessions>
                만료일: {membership.endDate ? (() => {
                  const date = new Date(membership.endDate);
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  const hours = String(date.getHours()).padStart(2, '0');
                  const minutes = String(date.getMinutes()).padStart(2, '0');
                  return `${year}-${month}-${day} ${hours}:${minutes}`;
                })() : '없음'}
              </RemainingSessions>
            </>
          ) : (
            <RemainingSessions>
              멤버십을 구매하여 서비스를 이용하세요
            </RemainingSessions>
          )}
        </MembershipInfo>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <Button
            onClick={handleStartConversation}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!membership || (membership.conversationLimit !== -1 && ((Number(membership.conversationLimit) || 0) - (Number(membership.conversationUsed) || 0)) <= 0)}
          >
            <MessageCircle size={20} />
            대화 시작하기
          </Button>
          
          <Button
            onClick={() => setShowPurchaseModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ background: 'linear-gradient(45deg, #4ecdc4, #44a08d)' }}
          >
            <ShoppingCart size={20} />
            멤버십 구매
          </Button>
        </div>
      </MembershipCard>

      {/* API 키 설정 섹션 */}
      <ApiKeySection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <ApiKeyTitle>
          <Key size={24} />
          Gemini API 키 설정
        </ApiKeyTitle>
        
        <ApiKeyInput
          type="password"
          placeholder="Gemini API 키를 입력하세요"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <ApiKeyButton
            onClick={handleApiKeyValidation}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            API 키 설정
          </ApiKeyButton>
          
          <ApiKeyButton
            onClick={handleApiKeyClear}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)' }}
          >
            API 키 삭제
          </ApiKeyButton>
        </div>
        
        {apiKeyStatus && (
          <ApiKeyStatus className={apiKeyStatus}>
            {apiKeyStatus === 'loading' && '🔍 API 키 검증 중...'}
            {apiKeyStatus === 'valid' && '✅ API 키가 성공적으로 설정되었습니다'}
            {apiKeyStatus === 'invalid' && '❌ API 키를 입력하거나 유효하지 않습니다'}
          </ApiKeyStatus>
        )}
      </ApiKeySection>

      {/* 구매 모달 */}
      {showPurchaseModal && (
        <PurchaseModal
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ModalContent
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <CloseButton onClick={() => setShowPurchaseModal(false)}>×</CloseButton>
            <ModalTitle>멤버십 선택</ModalTitle>
            
            {availableMemberships.length > 0 ? (
              availableMemberships.map((membershipOption) => (
                <MembershipOption
                  key={membershipOption.id}
                  onClick={() => handleMembershipSelect(membershipOption)}
                >
                  <MembershipOptionTitle>{membershipOption.name}</MembershipOptionTitle>
                  <MembershipOptionPrice>₩{membershipOption.price?.toLocaleString() || 0}</MembershipOptionPrice>
                  <MembershipOptionFeatures>
                    <div>• 대화 횟수: {membershipOption.conversationLimit === -1 ? '무제한' : `${membershipOption.conversationLimit || 0}회`}</div>
                    <div>• 분석 횟수: {membershipOption.analysisLimit === -1 ? '무제한' : `${membershipOption.analysisLimit || 0}회`}</div>
                    <div>• 기간: {membershipOption.durationDays || 0}일</div>
                    <div>• {membershipOption.description || '설명 없음'}</div>
                  </MembershipOptionFeatures>
                </MembershipOption>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                구매 가능한 멤버십이 없습니다. (개수: {availableMemberships.length})
              </div>
            )}
            
            <CancelButton onClick={() => setShowPurchaseModal(false)}>
              취소
            </CancelButton>
          </ModalContent>
        </PurchaseModal>
      )}

      {/* 결제 모달 */}
      {showPaymentModal && selectedMembership && (
        <PurchaseModal
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ModalContent
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <CloseButton onClick={handlePaymentCancel}>×</CloseButton>
            <ModalTitle>결제 정보 입력</ModalTitle>
            
            <PaymentSummary>
              <SummaryItem>
                <span>선택한 멤버십:</span>
                <span>{selectedMembership.name}</span>
              </SummaryItem>
              <SummaryItem>
                <span>가격:</span>
                <span>₩{selectedMembership.price?.toLocaleString() || 0}</span>
              </SummaryItem>
            </PaymentSummary>
            
            <PaymentForm>
              <PaymentMethodGroup>
                <PaymentMethodLabel>결제 수단 선택</PaymentMethodLabel>
                <PaymentMethodOptions>
                  <PaymentMethodOption
                    className={paymentMethod === 'CREDIT_CARD' ? 'selected' : ''}
                    onClick={() => setPaymentMethod('CREDIT_CARD')}
                  >
                    신용카드
                  </PaymentMethodOption>
                  <PaymentMethodOption
                    className={paymentMethod === 'CHECK_CARD' ? 'selected' : ''}
                    onClick={() => setPaymentMethod('CHECK_CARD')}
                  >
                    체크카드
                  </PaymentMethodOption>
                  <PaymentMethodOption
                    className={paymentMethod === 'BANK_TRANSFER' ? 'selected' : ''}
                    onClick={() => setPaymentMethod('BANK_TRANSFER')}
                  >
                    계좌이체
                  </PaymentMethodOption>
                  <PaymentMethodOption
                    className={paymentMethod === 'EASY_PAY' ? 'selected' : ''}
                    onClick={() => setPaymentMethod('EASY_PAY')}
                  >
                    간편결제
                  </PaymentMethodOption>
                </PaymentMethodOptions>
              </PaymentMethodGroup>
              
              {(paymentMethod === 'CREDIT_CARD' || paymentMethod === 'CHECK_CARD') && (
                <>
                  <FormGroup>
                    <Label>카드 번호</Label>
                    <CardNumberInput
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={paymentInfo.cardNumber}
                      onChange={(e) => setPaymentInfo(prev => ({ ...prev, cardNumber: e.target.value }))}
                      maxLength="19"
                    />
                  </FormGroup>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <FormGroup style={{ flex: 1 }}>
                      <Label>만료일</Label>
                      <CardExpiryInput
                        type="text"
                        placeholder="MM/YY"
                        value={paymentInfo.cardExpiry}
                        onChange={(e) => setPaymentInfo(prev => ({ ...prev, cardExpiry: e.target.value }))}
                        maxLength="5"
                      />
                    </FormGroup>
                    
                    <FormGroup style={{ flex: 1 }}>
                      <Label>CVC</Label>
                      <CardCvcInput
                        type="text"
                        placeholder="123"
                        value={paymentInfo.cardCvc}
                        onChange={(e) => setPaymentInfo(prev => ({ ...prev, cardCvc: e.target.value }))}
                        maxLength="3"
                      />
                    </FormGroup>
                  </div>
                </>
              )}
              
              <PaymentButton onClick={handlePaymentSubmit}>
                결제하기
              </PaymentButton>
              
              <CancelButton onClick={handlePaymentCancel}>
                취소
              </CancelButton>
            </PaymentForm>
          </ModalContent>
        </PurchaseModal>
      )}

      <FeaturesGrid>
        <FeatureCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <FeatureIcon>🎤</FeatureIcon>
          <FeatureTitle>음성 인식</FeatureTitle>
          <FeatureDescription>
            실시간 음성 인식으로 자연스러운 영어 회화를 연습하세요
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <FeatureIcon>🤖</FeatureIcon>
          <FeatureTitle>AI 튜터</FeatureTitle>
          <FeatureDescription>
            개인화된 AI 튜터와 함께 영어 실력을 향상시키세요
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <FeatureIcon>📊</FeatureIcon>
          <FeatureTitle>진도 관리</FeatureTitle>
          <FeatureDescription>
            학습 진도를 추적하고 개선점을 확인하세요
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <FeatureIcon>⭐</FeatureIcon>
          <FeatureTitle>맞춤 학습</FeatureTitle>
          <FeatureDescription>
            개인 수준에 맞는 맞춤형 학습 콘텐츠를 제공합니다
          </FeatureDescription>
        </FeatureCard>
      </FeaturesGrid>
    </HomeContainer>
  );
};

export default Home; 