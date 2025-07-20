import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import networkService from '../services/networkService';

const StatusContainer = styled(motion.div)`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  padding: 10px 15px;
  border-radius: 25px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: bold;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const OnlineStatus = styled(StatusContainer)`
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
`;

const OfflineStatus = styled(StatusContainer)`
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
`;

const WarningStatus = styled(StatusContainer)`
  background: rgba(255, 152, 0, 0.2);
  color: #ff9800;
`;

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);
  const [statusType, setStatusType] = useState('online');

  useEffect(() => {
    const handleOnlineStatusChange = (online) => {
      setIsOnline(online);
      setShowStatus(true);
      setStatusType(online ? 'online' : 'offline');
      
      // 3초 후 상태 메시지 숨기기
      setTimeout(() => setShowStatus(false), 3000);
    };

    // 네트워크 상태 변경 감지
    const cleanup = networkService.onOnlineStatusChange(handleOnlineStatusChange);

    // 초기 네트워크 상태 확인
    const checkNetworkStatus = async () => {
      const isConnected = await networkService.checkConnectivity();
      if (!isConnected && isOnline) {
        handleOnlineStatusChange(false);
      }
    };

    checkNetworkStatus();

    return cleanup;
  }, []);

  const getStatusContent = () => {
    switch (statusType) {
      case 'online':
        return {
          icon: <Wifi size={16} />,
          text: '온라인',
          component: OnlineStatus
        };
      case 'offline':
        return {
          icon: <WifiOff size={16} />,
          text: '오프라인',
          component: OfflineStatus
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={16} />,
          text: '연결 불안정',
          component: WarningStatus
        };
      default:
        return {
          icon: <Wifi size={16} />,
          text: '온라인',
          component: OnlineStatus
        };
    }
  };

  const statusContent = getStatusContent();
  const StatusComponent = statusContent.component;

  return (
    <AnimatePresence>
      {showStatus && (
        <StatusComponent
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.3 }}
        >
          {statusContent.icon}
          {statusContent.text}
        </StatusComponent>
      )}
    </AnimatePresence>
  );
};

export default NetworkStatus; 