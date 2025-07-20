// 오디오 서비스
class AudioService {
  constructor() {
    this.audioContext = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
    this.vadInterval = null;
    this.silenceTimer = null;
    this.lastVoiceTime = 0;
  }

  // 오디오 컨텍스트 초기화
  initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.audioContext;
  }

  // VAD (Voice Activity Detection) 구현 - 지속적 모니터링
  startVoiceActivityDetection(audioStream, onSilenceDetected) {
    const audioContext = this.initAudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(audioStream);
    
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    microphone.connect(analyser);
    
    console.log('VAD 시작됨');
    
    let previousHasVoice = false; // 이전 음성 감지 상태
    
    // VAD 간격 설정 (100ms마다 체크)
    this.vadInterval = setInterval(() => {
      analyser.getByteFrequencyData(dataArray);
      
      // 주파수 데이터에서 음성 활동 감지
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      
      // 임계값 설정 (조정 가능)
      const threshold = 10; // 더 민감하게 조정
      const hasVoice = average > threshold;
      
      console.log(`음성 레벨: ${average.toFixed(2)}, 임계값: ${threshold}, 음성감지: ${hasVoice}`);
      
      // 음성 감지 상태가 true에서 false로 바뀌면 즉시 중지
      if (previousHasVoice && !hasVoice) {
        console.log('음성 감지 중단됨 - 즉시 녹음 중지');
        this.stopVoiceActivityDetection(); // VAD 중지
        onSilenceDetected();
        return;
      }
      
      if (hasVoice) {
        // 음성 감지됨
        this.lastVoiceTime = Date.now();
        console.log('음성 감지됨');
        previousHasVoice = true;
        
        // 기존 무음 타이머 클리어
        if (this.silenceTimer) {
          clearTimeout(this.silenceTimer);
          this.silenceTimer = null;
        }
      } else {
        // 무음 감지됨
        previousHasVoice = false;
        const silenceDuration = Date.now() - this.lastVoiceTime;
        
        console.log(`무음 지속 시간: ${silenceDuration}ms`);
        
        // 0.5초 이상 무음이 지속되면 녹음 중지 (더 빠르게)
        if (silenceDuration > 500 && this.lastVoiceTime > 0) {
          if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
          }
          
          this.silenceTimer = setTimeout(() => {
            if (this.isRecording) {
              console.log('무음 지속으로 자동 녹음 중지 실행');
              this.stopVoiceActivityDetection(); // VAD 중지
              onSilenceDetected();
            }
          }, 500);
        }
      }
    }, 100);
  }

  // VAD 중지
  stopVoiceActivityDetection() {
    if (this.vadInterval) {
      clearInterval(this.vadInterval);
      this.vadInterval = null;
    }
    
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    
    this.lastVoiceTime = 0;
  }

  // 오디오 녹음 시작 (VAD 포함)
  async startRecording(onSilenceDetected) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.audioChunks = [];
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      this.lastVoiceTime = Date.now();

      console.log('녹음 시작됨');

      // VAD 시작 (무음 감지 시 콜백 호출)
      this.startVoiceActivityDetection(stream, onSilenceDetected);

      return stream;
    } catch (error) {
      console.error('오디오 녹음 시작 실패:', error);
      throw error;
    }
  }

  // 오디오 녹음 중지
  stopRecording() {
    return new Promise((resolve) => {
      if (this.mediaRecorder && this.isRecording) {
        this.mediaRecorder.onstop = () => {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          
          this.isRecording = false;
          this.stopVoiceActivityDetection();
          resolve({ audioBlob, audioUrl });
        };
        
        this.mediaRecorder.stop();
        this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
      } else {
        resolve(null);
      }
    });
  }

  // 오디오 재생
  async playAudio(audioUrl) {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      
      audio.onended = () => resolve();
      audio.onerror = (error) => reject(error);
      
      audio.play().catch(reject);
    });
  }

  // TTS 생성 (Web Speech API 사용)
  async textToSpeech(text, voice = 'en-US') {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error('TTS가 지원되지 않습니다.'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voice;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);

      speechSynthesis.speak(utterance);
    });
  }

  // TTS를 오디오 URL로 변환
  async textToSpeechURL(text, voice = 'en-US') {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error('TTS가 지원되지 않습니다.'));
        return;
      }

      // MediaRecorder를 사용하여 TTS를 녹음
      const stream = new MediaStream();
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        resolve(audioUrl);
      };

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voice;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        mediaRecorder.start();
      };

      utterance.onend = () => {
        mediaRecorder.stop();
      };

      utterance.onerror = (error) => {
        mediaRecorder.stop();
        reject(error);
      };

      speechSynthesis.speak(utterance);
    });
  }

  // 오디오 품질 최적화
  optimizeAudioQuality(audioBlob) {
    return new Promise((resolve) => {
      const audio = new Audio();
      
      audio.src = URL.createObjectURL(audioBlob);
      audio.onloadedmetadata = () => {
        // 오디오 품질 최적화 로직
        resolve(audioBlob);
      };
    });
  }
}

export default new AudioService(); 