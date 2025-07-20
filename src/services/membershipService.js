import { backendService } from './backendService';

// 멤버십 관리 서비스
class MembershipService {
  constructor() {
    this.membership = null;
  }

  // 로컬 스토리지에서 멤버십 정보 로드
  loadMembershipFromStorage() {
    try {
      const stored = localStorage.getItem('membership');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('멤버십 정보 로드 실패:', error);
    }
    
    // 기본 멤버십 정보
    return {
      type: 'free',
      remainingSessions: 3,
      totalSessions: 3,
      purchaseDate: null,
      expiryDate: null
    };
  }

  // 멤버십 정보를 로컬 스토리지에 저장
  saveMembershipToStorage(membership) {
    try {
      localStorage.setItem('membership', JSON.stringify(membership));
    } catch (error) {
      console.error('멤버십 정보 저장 실패:', error);
    }
  }

  // 멤버십 정보 가져오기
  async getMembership() {
    try {
      // 백엔드에서 사용자 활성 멤버십 정보 가져오기
      const response = await backendService.getActiveUserMemberships();
      console.log('멤버십 서비스 응답:', response);
      
      // API 응답 구조에 따라 데이터 추출
      let membershipList = [];
      if (response && response.data) {
        membershipList = response.data;
      } else if (Array.isArray(response)) {
        membershipList = response;
      } else if (response && response.result) {
        membershipList = response.result;
      }
      
      console.log('추출된 멤버십 목록:', membershipList);
      
      // 활성 멤버십이 있으면 첫 번째 것을 반환
      if (membershipList && membershipList.length > 0) {
        const selectedMembership = membershipList[0];
        console.log('선택된 멤버십:', selectedMembership);
        return selectedMembership;
      } else {
        console.log('활성 멤버십이 없습니다.');
        return null;
      }
    } catch (error) {
      console.error('멤버십 정보 가져오기 실패:', error);
      // 에러 발생 시 null 반환하여 앱이 계속 작동하도록 함
      return null;
    }
  }

  // 멤버십 구매
  async purchaseMembership(membershipId) {
    try {
      const paymentData = {
        membershipId: membershipId,
        paymentMethod: 'CARD',
        cardNumber: '1234567890123456',
        cardExpiry: '12/25',
        cardCvc: '123'
      };
      
      const result = await backendService.processPayment(paymentData);
      return result.data;
    } catch (error) {
      console.error('멤버십 구매 실패:', error);
      throw error;
    }
  }

  // 기능 사용 (대화/분석)
  async useFeature(featureType) {
    try {
      const response = await backendService.useFeature(featureType);
      console.log('기능 사용 응답:', response);
      return response;
    } catch (error) {
      console.error('기능 사용 실패:', error);
      throw error;
    }
  }
}

const membershipService = new MembershipService();
export { membershipService };
export default membershipService; 