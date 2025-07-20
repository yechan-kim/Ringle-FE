import { useState, useEffect } from 'react';
import backendService from '../services/backendService';

export const useMembership = () => {
  const [membership, setMembership] = useState(null);
  const [allMemberships, setAllMemberships] = useState([]);
  const [showMembershipModal, setShowMembershipModal] = useState(false);

  const loadMembership = async () => {
    try {
      console.log('멤버십 정보 로드 시작');
      
      // 활성 사용자 멤버십 조회
      const response = await backendService.getActiveUserMemberships();
      let membershipList = [];
      
      if (response && response.data) {
        membershipList = response.data;
      } else if (Array.isArray(response)) {
        membershipList = response;
      } else if (response && response.result) {
        membershipList = response.result;
      }
      
      console.log('로드된 멤버십 목록:', membershipList);
      setAllMemberships(membershipList);
      
      // 사용 가능한 멤버십 찾기
      const availableMembership = membershipList.find(m => {
        if (m.conversationLimit === -1) return true; // 무제한 멤버십
        const remaining = (Number(m.conversationLimit) || 0) - (Number(m.conversationUsed) || 0);
        return remaining > 0;
      });
      
      if (availableMembership) {
        console.log('사용 가능한 멤버십 설정:', availableMembership);
        setMembership(availableMembership);
      } else {
        console.log('사용 가능한 멤버십이 없음');
        setMembership(null);
      }
      
    } catch (error) {
      console.error('멤버십 정보 로드 실패:', error);
      setMembership(null);
    }
  };

  const reloadMembership = async () => {
    try {
      console.log('멤버십 정보 새로고침 시작');
      const response = await backendService.getActiveUserMemberships();
      let membershipList = [];
      if (response && response.data) {
        membershipList = response.data;
      } else if (Array.isArray(response)) {
        membershipList = response;
      } else if (response && response.result) {
        membershipList = response.result;
      }
      
      console.log('새로고침된 멤버십 목록:', membershipList);
      setAllMemberships(membershipList);
      
      // 사용 가능한 멤버십 찾기 (더 상세한 로깅)
      const availableMembership = membershipList.find(m => {
        if (m.conversationLimit === -1) {
          console.log(`무제한 멤버십 발견: ${m.membershipName}`);
          return true;
        }
        const remaining = (Number(m.conversationLimit) || 0) - (Number(m.conversationUsed) || 0);
        console.log(`멤버십 ${m.membershipName}: 제한 ${m.conversationLimit}, 사용 ${m.conversationUsed}, 남은 ${remaining}`);
        return remaining > 0;
      });
      
      if (availableMembership) {
        console.log('사용 가능한 멤버십 설정:', availableMembership);
        setMembership(availableMembership);
        setShowMembershipModal(false);
      } else {
        console.log('사용 가능한 멤버십이 없음');
        setMembership(null);
        setShowMembershipModal(true);
      }
    } catch (error) {
      console.error('멤버십 정보 다시 로드 실패:', error);
      setMembership(null);
      setShowMembershipModal(true);
    }
  };

  useEffect(() => {
    loadMembership();
  }, []);

  return {
    membership,
    allMemberships,
    showMembershipModal,
    setShowMembershipModal,
    setMembership,
    loadMembership,
    reloadMembership
  };
}; 