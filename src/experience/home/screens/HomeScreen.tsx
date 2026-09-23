import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
  Animated,
  Modal,
  Easing,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNavBar from '../../../components/BottomNavBar';
import LinearGradient from 'react-native-linear-gradient';
import InsufficientBalanceModal from '../../../components/InsufficientBalanceModal';
import {
  enableCallSpeaker,
  resetCallAudioRoute,
} from '../../../services/audioRoute';
import Video from 'react-native-video';
import {
  MediaStream,
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  mediaDevices,
} from 'react-native-webrtc';
import {
  FallbackVideo,
  MatchRoom,
  CallKind,
  chargeCallMinute,
  endBilledCall,
  getHomeAvailability,
  heartbeatUser,
  joinMatchmaking,
  leaveMatchmaking,
  pickUnseenFallbackVideo,
  pollMatchmaking,
  pullCallSignals,
  pushCallSignal,
  startBilledCall,
} from '../../../services/videoMatchService';

const { width, height } = Dimensions.get('window');
const MATCH_COST = 3;
const FIRST_PERIOD_MS = 30_000;
const MINUTE_COST = 5;
const RECURRING_PERIOD_MS = 60_000;

const wait = (milliseconds: number) =>
  new Promise<void>(resolve => setTimeout(resolve, milliseconds));

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as {message?: unknown}).message ?? '');
  }
  return '';
};

interface OnlineUser {
  id: string;
  name: string;
  age: number;
  country: string;
  flag: string;
  avatar: string;
  videoUrl?: string;
  bio: string;
}

const ORBIT_USERS: OnlineUser[] = [
  {
    id: 'u1',
    name: 'Sophia',
    age: 22,
    country: 'United States',
    flag: '🇺🇸',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    bio: 'Music lover & gamer 🎧',
  },
  {
    id: 'u2',
    name: 'Elena',
    age: 24,
    country: 'Spain',
    flag: '🇪🇸',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    bio: 'Traveling the world ✈️',
  },
  {
    id: 'u3',
    name: 'Chloe',
    age: 21,
    country: 'Canada',
    flag: '🇨🇦',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    bio: 'Coffee & late night chats ☕',
  },
  {
    id: 'u4',
    name: 'Mia',
    age: 23,
    country: 'United Kingdom',
    flag: '🇬🇧',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
    bio: 'Let us talk about movies 🎬',
  },
  {
    id: 'u5',
    name: 'Amara',
    age: 20,
    country: 'Brazil',
    flag: '🇧🇷',
    avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&auto=format&fit=crop&q=80',
    bio: 'Dance & fitness enthusiast 💃',
  },
  {
    id: 'u6',
    name: 'Aria',
    age: 22,
    country: 'France',
    flag: '🇫🇷',
    avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&auto=format&fit=crop&q=80',
    bio: 'Art student in Paris 🎨',
  },
];

interface HomeScreenProps {
  navigation?: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user, deviceId, updateCoinBalance } = useAuth();
  const coins = user?.coinBalance ?? 0;
  const [isMatching, setIsMatching] = useState<boolean>(false);
  const [isCallActive, setIsCallActive] = useState<boolean>(false);
  const [showInsufficientModal, setShowInsufficientModal] = useState<boolean>(false);
  const [requiredBalance, setRequiredBalance] = useState(MATCH_COST);
  const [availableCount, setAvailableCount] = useState(0);
  const [fallbackVideo, setFallbackVideo] = useState<FallbackVideo | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMediaConnected, setIsMediaConnected] = useState(false);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const activeRoomRef = useRef<MatchRoom | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const signalTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const connectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSignalIdRef = useRef(0);
  const processingSignalsRef = useRef(false);
  const pendingCandidatesRef = useRef<RTCIceCandidate[]>([]);
  const chargeStartedRef = useRef(false);
  const fallbackSwitchingRef = useRef(false);
  const billedCallIdRef = useRef<string | null>(null);
  const billingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const billingInFlightRef = useRef(false);

  const handleTabChange = (tab: string) => {
    if (navigation && navigation.navigate) {
      if (tab === 'hot') {
        try { navigation.navigate('Home'); } catch (e) { navigation.navigate('MainTabs', { screen: 'Home' }); }
      } else if (tab === 'chat') {
        try { navigation.navigate('Chat'); } catch (e) { navigation.navigate('MainTabs', { screen: 'Chat' }); }
      } else if (tab === 'profile') {
        try { navigation.navigate('Profile'); } catch (e) { navigation.navigate('MainTabs', { screen: 'Profile' }); }
      } else if (tab === 'tokens') {
        navigation.navigate('GetTokens');
      }
    }
  };

  // Call features
  const [callTimer, setCallTimer] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFrontCamera, setIsFrontCamera] = useState<boolean>(true);
  const [showHearts, setShowHearts] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Radar Animation
  const scanAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  // Star Background animation & radar rotation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [floatAnim]);

  // Call Timer Effect
  useEffect(() => {
    let interval: any;
    if (isCallActive && isMediaConnected) {
      interval = setInterval(() => {
        setCallTimer((prev) => prev + 1);
      }, 1000);
    } else {
      setCallTimer(0);
    }
    return () => clearInterval(interval);
  }, [isCallActive, isMediaConnected]);

  useEffect(() => {
    if (!deviceId || !user?.gender) {
      return;
    }

    let isMounted = true;
    const refreshAvailability = async () => {
      try {
        await heartbeatUser(deviceId);
        const availability = await getHomeAvailability(deviceId);
        if (isMounted) {
          setAvailableCount(
            availability.videoCount + availability.activeUserCount,
          );
        }
      } catch {
        // Keep the last count while temporarily offline.
      }
    };

    refreshAvailability();
    const interval = setInterval(refreshAvailability, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [deviceId, user?.gender]);

  useEffect(() => () => {
    if (signalTimerRef.current) {
      clearInterval(signalTimerRef.current);
    }
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
    }
    if (billingTimerRef.current) {
      clearTimeout(billingTimerRef.current);
    }
    peerConnectionRef.current?.close();
    localStreamRef.current?.getTracks().forEach(track => track.stop());
  }, []);

  const stopMatchingAnimation = () => {
    scanAnim.stopAnimation();
    scanAnim.setValue(0);
  };

  const ensureMediaPermissions = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true;
    }

    const result = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    ]);

    return (
      result[PermissionsAndroid.PERMISSIONS.CAMERA] ===
        PermissionsAndroid.RESULTS.GRANTED &&
      result[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] ===
        PermissionsAndroid.RESULTS.GRANTED
    );
  };

  const openCamera = async (): Promise<MediaStream | null> => {
    const hasPermission = await ensureMediaPermissions();
    if (!hasPermission) {
      setStatusMessage('Camera and microphone permission is required');
      return null;
    }

    try {
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: {
          facingMode: 'user',
          frameRate: 24,
          width: 640,
          height: 480,
        },
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch {
      setStatusMessage('Camera start nahi ho saka');
      return null;
    }
  };

  const scheduleNextMinuteCharge = () => {
    if (billingTimerRef.current) {
      clearTimeout(billingTimerRef.current);
    }

    billingTimerRef.current = setTimeout(async () => {
      const callId = billedCallIdRef.current;
      if (!deviceId || !callId || billingInFlightRef.current) {
        return;
      }

      billingInFlightRef.current = true;
      try {
        const updatedBalance = await chargeCallMinute(deviceId, callId);
        await updateCoinBalance(updatedBalance);
        if (billedCallIdRef.current === callId) {
          scheduleNextMinuteCharge();
        }
      } catch (error) {
        if (billedCallIdRef.current !== callId) {
          return;
        }
        const message = getErrorMessage(error);
        endCall();
        if (message.includes('INSUFFICIENT_BALANCE')) {
          setStatusMessage('Coins khatam ho gaye. Call ended.');
          setRequiredBalance(MINUTE_COST);
          setShowInsufficientModal(true);
        } else {
          setStatusMessage('Billing connection failed. Call ended.');
        }
      } finally {
        billingInFlightRef.current = false;
      }
    }, billedCallIdRef.current ? RECURRING_PERIOD_MS : FIRST_PERIOD_MS);
  };

  const chargeAndStartTimer = async (
    callKind: CallKind,
    referenceId: string | null,
  ) => {
    if (chargeStartedRef.current || !deviceId) {
      return;
    }

    chargeStartedRef.current = true;
    try {
      const billedCall = await startBilledCall(
        deviceId,
        callKind,
        referenceId,
      );
      billedCallIdRef.current = billedCall.callId;
      await updateCoinBalance(billedCall.newBalance);
      await enableCallSpeaker().catch(() => {
        // Keep the call running if a device cannot change its audio route.
      });
      setIsMediaConnected(true);
      setStatusMessage('');
      // The 3-coin start charge covers 30 seconds; then 5 coins buys each minute.
      if (billingTimerRef.current) {
        clearTimeout(billingTimerRef.current);
      }
      billingTimerRef.current = setTimeout(async () => {
        const callId = billedCallIdRef.current;
        if (!deviceId || !callId || billingInFlightRef.current) {
          return;
        }

        billingInFlightRef.current = true;
        try {
          const updatedBalance = await chargeCallMinute(deviceId, callId);
          await updateCoinBalance(updatedBalance);
          if (billedCallIdRef.current === callId) {
            scheduleNextMinuteCharge();
          }
        } catch (error) {
          if (billedCallIdRef.current !== callId) {
            return;
          }
          const message = getErrorMessage(error);
          endCall();
          if (message.includes('INSUFFICIENT_BALANCE')) {
            setStatusMessage('Coins khatam ho gaye. Call ended.');
            setRequiredBalance(MINUTE_COST);
            setShowInsufficientModal(true);
          } else {
            setStatusMessage('Billing connection failed. Call ended.');
          }
        } finally {
          billingInFlightRef.current = false;
        }
      }, FIRST_PERIOD_MS);
    } catch (error) {
      chargeStartedRef.current = false;
      const message = getErrorMessage(error);
      endCall();
      if (message.includes('INSUFFICIENT_BALANCE')) {
        setRequiredBalance(MATCH_COST);
        setShowInsufficientModal(true);
      } else {
        setStatusMessage('Connection failed. Please try again.');
      }
    }
  };

  const stopPeerTransport = () => {
    if (signalTimerRef.current) {
      clearInterval(signalTimerRef.current);
      signalTimerRef.current = null;
    }
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    remoteStreamRef.current?.getTracks().forEach(track => track.stop());
    remoteStreamRef.current = null;
    setRemoteStream(null);
    pendingCandidatesRef.current = [];
  };

  const switchLiveCallToFallback = async () => {
    if (fallbackSwitchingRef.current || !deviceId) {
      return;
    }

    fallbackSwitchingRef.current = true;
    const room = activeRoomRef.current;
    if (room) {
      void pushCallSignal(deviceId, room, 'hangup', {}).catch(() => {
        // The peer may already have closed and removed this room.
      });
    }
    stopPeerTransport();
    activeRoomRef.current = null;
    await leaveMatchmaking(deviceId).catch(() => {});

    try {
      const selectedVideo = await pickUnseenFallbackVideo(deviceId);
      if (!selectedVideo) {
        endCall(false);
        setStatusMessage('Anyone not online');
        return;
      }

      setFallbackVideo(selectedVideo);
      setStatusMessage('');
    } catch {
      endCall(false);
      setStatusMessage('Connection failed. Please try again.');
    } finally {
      fallbackSwitchingRef.current = false;
    }
  };

  const startPeerConnection = async (
    room: MatchRoom,
    stream: MediaStream,
  ) => {
    if (!deviceId) {
      return;
    }

    const peerConnection = new RTCPeerConnection({
      iceServers: [
        {urls: 'stun:stun.l.google.com:19302'},
        {urls: 'stun:stun1.l.google.com:19302'},
        {urls: 'stun:stun.cloudflare.com:3478'},
      ],
    });
    peerConnectionRef.current = peerConnection;
    lastSignalIdRef.current = 0;
    pendingCandidatesRef.current = [];

    stream.getTracks().forEach(track => {
      peerConnection.addTrack(track, stream);
    });

    (peerConnection as any).ontrack = (event: any) => {
      const [incomingStream] = event.streams;
      if (incomingStream) {
        remoteStreamRef.current = incomingStream;
        setRemoteStream(incomingStream);
      }
    };

    (peerConnection as any).onicecandidate = (event: any) => {
      if (event.candidate) {
        void pushCallSignal(
          deviceId,
          room,
          'candidate',
          {
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
            usernameFragment: event.candidate.usernameFragment,
          },
        ).catch(() => {
          // Ignore candidates emitted while either side is closing the room.
        });
      }
    };

    (peerConnection as any).onconnectionstatechange = () => {
      const connectionState = peerConnection.connectionState;
      if (connectionState === 'connected') {
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }
        void chargeAndStartTimer('live', room.roomId);
      } else if (connectionState === 'failed') {
        void switchLiveCallToFallback();
      }
    };

    (peerConnection as any).oniceconnectionstatechange = () => {
      const iceState = peerConnection.iceConnectionState;
      if (iceState === 'connected' || iceState === 'completed') {
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }
        void chargeAndStartTimer('live', room.roomId);
      } else if (iceState === 'failed') {
        void switchLiveCallToFallback();
      }
    };

    const processSignals = async () => {
      if (processingSignalsRef.current) {
        return;
      }

      processingSignalsRef.current = true;
      try {
        const signals = await pullCallSignals(
          deviceId,
          room.roomId,
          lastSignalIdRef.current,
        );

        for (const signal of signals) {
          lastSignalIdRef.current = Math.max(lastSignalIdRef.current, signal.id);

          if (signal.signalType === 'offer') {
            await peerConnection.setRemoteDescription(
              new RTCSessionDescription(signal.payload as any),
            );
            for (const candidate of pendingCandidatesRef.current) {
              await peerConnection.addIceCandidate(candidate);
            }
            pendingCandidatesRef.current = [];
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            await pushCallSignal(
              deviceId,
              room,
              'answer',
              {type: answer.type, sdp: answer.sdp},
            );
          } else if (signal.signalType === 'answer') {
            await peerConnection.setRemoteDescription(
              new RTCSessionDescription(signal.payload as any),
            );
            for (const candidate of pendingCandidatesRef.current) {
              await peerConnection.addIceCandidate(candidate);
            }
            pendingCandidatesRef.current = [];
          } else if (signal.signalType === 'candidate') {
            const candidate = new RTCIceCandidate(signal.payload as any);
            if ((peerConnection as any).remoteDescription) {
              await peerConnection.addIceCandidate(candidate);
            } else {
              pendingCandidatesRef.current.push(candidate);
            }
          } else if (signal.signalType === 'hangup') {
            endCall(false);
          }
        }
      } catch {
        // The next polling cycle can recover from a temporary network failure.
      } finally {
        processingSignalsRef.current = false;
      }
    };

    signalTimerRef.current = setInterval(processSignals, 400);
    await processSignals();

    if (room.isInitiator) {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      await pushCallSignal(
        deviceId,
        room,
        'offer',
        {type: offer.type, sdp: offer.sdp},
      );
    }

    connectionTimeoutRef.current = setTimeout(() => {
      if (!chargeStartedRef.current) {
        void switchLiveCallToFallback();
      }
    }, 12000);
  };

  const handleStartMatching = async () => {
    if (isMatching) {
      return;
    }

    if (coins < MATCH_COST) {
      setRequiredBalance(MATCH_COST);
      setShowInsufficientModal(true);
      return;
    }

    if (!deviceId || !user?.gender) {
      setStatusMessage('Please complete your profile first');
      return;
    }

    setIsMatching(true);
    setIsMediaConnected(false);
    setCallTimer(0);
    chargeStartedRef.current = false;
    fallbackSwitchingRef.current = false;
    setStatusMessage('');

    // Start scanning animation
    Animated.loop(
      Animated.timing(scanAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    let cameraStream: MediaStream | null = null;
    try {
      cameraStream = await openCamera();
      if (!cameraStream) {
        return;
      }

      let room = await joinMatchmaking(deviceId);
      for (let attempt = 0; !room && attempt < 6; attempt += 1) {
        await wait(1000);
        room = await pollMatchmaking(deviceId);
      }

      if (room) {
        activeRoomRef.current = room;
        setFallbackVideo(null);
        setIsCallActive(true);
        await startPeerConnection(room, cameraStream);
        return;
      }

      await leaveMatchmaking(deviceId);
      const selectedVideo = await pickUnseenFallbackVideo(deviceId);

      if (!selectedVideo) {
        cameraStream.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
        setLocalStream(null);
        setStatusMessage('Anyone not online');
        return;
      }

      setFallbackVideo(selectedVideo);
      activeRoomRef.current = null;
      setIsCallActive(true);
    } catch (error) {
      const message = getErrorMessage(error);
      if (message.includes('INSUFFICIENT_BALANCE')) {
        setShowInsufficientModal(true);
      } else {
        setStatusMessage('Connection failed. Please try again.');
      }
      cameraStream?.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    } finally {
      setIsMatching(false);
      stopMatchingAnimation();
    }
  };

  const handleNextMatch = () => {
    endCall();
    setTimeout(() => {
      void handleStartMatching();
    }, 400);
  };

  function endCall(notifyPeer = true) {
    const room = activeRoomRef.current;
    const billedCallId = billedCallIdRef.current;
    billedCallIdRef.current = null;
    if (billingTimerRef.current) {
      clearTimeout(billingTimerRef.current);
      billingTimerRef.current = null;
    }
    if (deviceId) {
      if (billedCallId) {
        void endBilledCall(deviceId, billedCallId).catch(() => {
          // The next call start also closes any stale active history row.
        });
      }

      void (async () => {
        if (notifyPeer && room) {
          try {
            await pushCallSignal(deviceId, room, 'hangup', {});
          } catch {
            // The peer may have already closed and removed this room.
          }
        }

        await leaveMatchmaking(deviceId).catch(() => {
          // Local teardown must still complete if backend cleanup is late.
        });
      })();
    }

    stopPeerTransport();
    void resetCallAudioRoute().catch(() => {});
    localStreamRef.current?.getTracks().forEach(track => track.stop());

    setIsCallActive(false);
    setFallbackVideo(null);
    activeRoomRef.current = null;
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    setIsMuted(false);
    setIsMediaConnected(false);
    setCallTimer(0);
    chargeStartedRef.current = false;
    billingInFlightRef.current = false;
    fallbackSwitchingRef.current = false;
  }

  const handleEndCall = () => {
    endCall();
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    localStreamRef.current?.getAudioTracks().forEach(track => {
      track.enabled = !nextMuted;
    });
    setIsMuted(nextMuted);
  };

  const switchCamera = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0] as
      | ({_switchCamera?: () => void})
      | undefined;
    videoTrack?._switchCamera?.();
    setIsFrontCamera(value => !value);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const triggerHeartEffect = () => {
    setShowHearts(true);
    setTimeout(() => setShowHearts(false), 1500);
  };

  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-6, 6],
  });

  return (
    <LinearGradient
      colors={['#0B132B', '#1C1035', '#4A0E4E', '#80065D']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        {/* Top Header Bar */}
        <View style={styles.topHeader}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.headerIconButton}
              activeOpacity={0.7}
              onPress={() => navigation?.navigate('History')}
            >
              <Image
                source={require('../../../assets/history.png')}
                style={{ width: 15, height: 15 }}
                resizeMode="contain"
              />
            </TouchableOpacity>

          </View>

          <TouchableOpacity
            style={styles.coinPill}
            onPress={() => navigation?.navigate('GetTokens')}
            activeOpacity={0.8}
          >
            <View style={styles.coinIconCircle}>
              <Text style={{ fontSize: 13 }}>🪙</Text>
            </View>
            <Text style={styles.coinText}>{coins}</Text>
            <Text style={styles.coinPlusText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Main Radar / Cosmic Space Area */}
        <View style={styles.spaceContainer}>
          {/* Status Toast Message */}
          {statusMessage ? (
            <View style={styles.toastContainer}>
              <Text style={styles.toastText}>{statusMessage}</Text>
            </View>
          ) : null}

          {/* Floating Stars Effect (Decorative background elements) */}
          <View style={[styles.star, { top: '10%', left: '15%', opacity: 0.7 }]} />
          <View style={[styles.star, { top: '25%', left: '80%', opacity: 0.9 }]} />
          <View style={[styles.star, { top: '50%', left: '10%', opacity: 0.5 }]} />
          <View style={[styles.star, { top: '70%', left: '85%', opacity: 0.8 }]} />
          <View style={[styles.star, { top: '80%', left: '30%', opacity: 0.6 }]} />

          {/* 3D Cosmic Orbital Radar Rings */}
          <View style={styles.orbitContainer}>
            {/* Inner & Outer Glowing Ellipses */}
            <View style={[styles.orbitEllipse, styles.orbitOuter]} />
            <View style={[styles.orbitEllipse, styles.orbitMiddle]} />
            <View style={[styles.orbitEllipse, styles.orbitInner]} />

            {/* Pulse Beam on Matching */}
            {isMatching && (
              <Animated.View
                style={[
                  styles.radarPulseWave,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              />
            )}

            {/* Floating User Avatars on Radar */}
            <Animated.View
              style={[
                styles.avatarBubbleContainer,
                { top: '8%', left: '32%', transform: [{ translateY: floatY }] },
              ]}
            >
              <Image source={{ uri: ORBIT_USERS[0].avatar }} style={styles.avatarBubble} />
            </Animated.View>

            <Animated.View
              style={[
                styles.avatarBubbleContainer,
                { top: '22%', left: '62%', transform: [{ translateY: Animated.multiply(floatY, -1) }] },
              ]}
            >
              <Image source={{ uri: ORBIT_USERS[1].avatar }} style={styles.avatarBubble} />
            </Animated.View>

            <Animated.View
              style={[
                styles.avatarBubbleContainer,
                { top: '28%', left: '18%', transform: [{ translateY: floatY }] },
              ]}
            >
              <Image source={{ uri: ORBIT_USERS[2].avatar }} style={styles.avatarBubbleSmall} />
            </Animated.View>

            <Animated.View
              style={[
                styles.avatarBubbleContainer,
                { top: '35%', left: '42%', transform: [{ translateY: Animated.multiply(floatY, -0.8) }] },
              ]}
            >
              <Image source={{ uri: ORBIT_USERS[3].avatar }} style={styles.avatarBubbleTiny} />
            </Animated.View>

            <Animated.View
              style={[
                styles.avatarBubbleContainer,
                { top: '38%', left: '72%', transform: [{ translateY: floatY }] },
              ]}
            >
              <Image source={{ uri: ORBIT_USERS[4].avatar }} style={styles.avatarBubble} />
            </Animated.View>

            <Animated.View
              style={[
                styles.avatarBubbleContainer,
                { top: '48%', left: '26%', transform: [{ translateY: Animated.multiply(floatY, -1.2) }] },
              ]}
            >
              <Image source={{ uri: ORBIT_USERS[5].avatar }} style={styles.avatarBubble} />
            </Animated.View>
          </View>

          {/* Floating Gift Box Badge with Timer */}
          <TouchableOpacity style={styles.giftFloatingBadge} activeOpacity={0.85}>
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4213/4213958.png' }}
              style={styles.giftIconImage}
            />
            <View style={styles.giftTimerTag}>
              <Text style={styles.giftTimerText}>00:59:56</Text>
            </View>
          </TouchableOpacity>

          {/* Users Counter & Status Text */}
          <View style={styles.usersCountContainer}>
            <Text style={styles.usersCountText}>
              <Text style={styles.usersCountNumber}>{availableCount}</Text> users ready to chat
            </Text>
          </View>

          {/* Call CTA Button */}
          <View style={styles.ctaWrapper}>
            <TouchableOpacity
              style={styles.startCallButton}
              onPress={handleStartMatching}
              disabled={isMatching}
              activeOpacity={0.85}
            >
              <View style={styles.btnContent}>
                <Text style={styles.cameraIcon}>
                  <Image
                    source={require('../../../assets/call.png')}
                    style={{ width: 20, height: 20 }}
                    resizeMode="contain"
                  />
                </Text>
                <Text style={styles.startBtnText}>
                  {isMatching ? 'Matching...' : 'Start'}
                </Text>
              </View>

              {/* Cost Pill Badge */}
              <View style={styles.costBadge}>
                <Text style={styles.costBadgeText}>🪙 3</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Custom Bottom Navigation Bar Component */}
        <BottomNavBar activeTab="hot" onTabChange={handleTabChange} />

        {/* FULL SCREEN RANDOM VIDEO CALL MODAL */}
        <Modal
          visible={isCallActive}
          animationType="slide"
          transparent={false}
          onRequestClose={handleEndCall}
        >
          <View style={styles.callScreenContainer}>
            <StatusBar barStyle="light-content" />

            {/* Remote peer, or opposite-gender fallback video. */}
            {fallbackVideo ? (
              <Video
                source={{uri: fallbackVideo.playbackUrl}}
                style={styles.remoteVideoImage}
                resizeMode="cover"
                controls={false}
                repeat={false}
                paused={!isMediaConnected}
                onLoad={() => {
                  void chargeAndStartTimer('fallback', fallbackVideo.id);
                }}
                onEnd={handleEndCall}
                onError={() => {
                  setStatusMessage('Video play nahi ho saka');
                  handleEndCall();
                }}
              />
            ) : remoteStream ? (
              <RTCView
                streamURL={remoteStream.toURL()}
                style={styles.remoteVideoImage}
                objectFit="cover"
                zOrder={0}
              />
            ) : (
              <View style={styles.remoteVideoWaiting}>
                <ActivityIndicator size="large" color="#FF2A85" />
                <Text style={styles.remoteVideoWaitingText}>Connecting...</Text>
              </View>
            )}

            {/* Overlay Gradient Protection */}
            <View style={styles.callOverlayGradient} />

            {/* Floating Hearts Animation */}
            {showHearts && (
              <View style={styles.heartsContainer}>
                <Text style={styles.floatingHeart}>❤️</Text>
                <Text style={[styles.floatingHeart, { left: 40, fontSize: 32 }]}>💖</Text>
                <Text style={[styles.floatingHeart, { left: 80, fontSize: 40 }]}>💕</Text>
              </View>
            )}

            {/* Top User Info Bar */}
            <SafeAreaView style={styles.callTopHeader}>
              <View style={styles.remoteUserInfoPill}>
                <View style={styles.callUserTextCol}>
                  <View style={styles.callUserNameRow}>
                    <Text style={styles.callUserName}>
                      {fallbackVideo ? 'Video match' : 'Live user'}
                    </Text>
                  </View>
                  <Text style={styles.callUserBio} numberOfLines={1}>
                    {fallbackVideo ? 'Fallback connection' : 'Peer-to-peer call'}
                  </Text>
                </View>
              </View>

              {/* Call Timer */}
              <View style={styles.callTimerBadge}>
                <View style={styles.redLiveDot} />
                <Text style={styles.callTimerText}>
                  {isMediaConnected ? formatTimer(callTimer) : 'Connecting'}
                </Text>
              </View>
            </SafeAreaView>

            {/* PIP Self Camera View (Top Right Corner) */}
            <View style={styles.pipCameraContainer}>
              {localStream ? (
                <RTCView
                  streamURL={localStream.toURL()}
                  objectFit="cover"
                  mirror={isFrontCamera}
                  zOrder={1}
                  style={styles.pipCameraImage}
                />
              ) : null}
              <View style={styles.pipLabel}>
                <Text style={styles.pipLabelText}>You</Text>
              </View>
            </View>

            {/* Bottom Action Controls */}
            <View style={styles.callBottomControls}>
              <TouchableOpacity
                style={[styles.callControlBtn, isMuted && styles.callControlBtnActive]}
                onPress={toggleMute}
                activeOpacity={0.8}
              >
                <Text style={styles.controlIcon}>{isMuted ? '🔇' : '🎙️'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.callControlBtn}
                onPress={triggerHeartEffect}
                activeOpacity={0.8}
              >
                <Text style={styles.controlIcon}>💖</Text>
              </TouchableOpacity>

              {/* End Call Button */}
              <TouchableOpacity
                style={styles.endCallButton}
                onPress={handleEndCall}
                activeOpacity={0.85}
              >
                <Text style={styles.endCallIcon}>📞</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.callControlBtn}
                onPress={switchCamera}
                activeOpacity={0.8}
              >
                <Text style={styles.controlIcon}>🔄</Text>
              </TouchableOpacity>

              {/* Next Match Button */}
              <TouchableOpacity
                style={styles.nextMatchBtn}
                onPress={handleNextMatch}
                activeOpacity={0.85}
              >
                <Text style={styles.nextMatchText}>Next ⏭️</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* INSUFFICIENT BALANCE MODAL */}
        <InsufficientBalanceModal
          visible={showInsufficientModal}
          currentBalance={coins}
          requiredBalance={requiredBalance}
          onClose={() => setShowInsufficientModal(false)}
          onGetTokens={() => {
            setShowInsufficientModal(false);
            navigation?.navigate('GetTokens');
          }}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    gap: 12,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerIconText: {
    fontSize: 18,
  },
  coinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  coinIconCircle: {
    marginRight: 6,
  },
  coinText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
    marginRight: 4,
  },
  coinPlusText: {
    color: '#FBBF24',
    fontSize: 16,
    fontWeight: '900',
  },
  spaceContainer: {
    flex: 1,
    position: 'relative',
    justifyContent: 'space-between',
  },
  toastContainer: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 100,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  star: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#FFFFFF',
  },
  orbitContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: -20,
  },
  orbitEllipse: {
    position: 'absolute',
    borderRadius: 200,
    borderWidth: 1.5,
    transform: [{ rotateX: '68deg' }],
  },
  orbitOuter: {
    width: width * 1.1,
    height: width * 1.1,
    borderColor: 'rgba(255, 42, 133, 0.4)',
    shadowColor: '#FF2A85',
    shadowRadius: 15,
    shadowOpacity: 0.8,
  },
  orbitMiddle: {
    width: width * 0.85,
    height: width * 0.85,
    borderColor: 'rgba(236, 72, 153, 0.6)',
  },
  orbitInner: {
    width: width * 0.6,
    height: width * 0.6,
    borderColor: 'rgba(219, 39, 119, 0.8)',
  },
  radarPulseWave: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
    backgroundColor: 'rgba(255, 42, 133, 0.25)',
  },
  avatarBubbleContainer: {
    position: 'absolute',
  },
  avatarBubble: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: '#FF2A85',
  },
  avatarBubbleSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#EC4899',
  },
  avatarBubbleTiny: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#F472B6',
  },
  giftFloatingBadge: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    alignItems: 'center',
  },
  giftIconImage: {
    width: 48,
    height: 48,
    marginBottom: -4,
  },
  giftTimerTag: {
    backgroundColor: '#FF2A85',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  giftTimerText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  usersCountContainer: {
    alignItems: 'center',
    marginBottom: 14,
  },
  usersCountText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 14,
    fontWeight: '500',
  },
  usersCountNumber: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  ctaWrapper: {
    alignItems: 'center',
    paddingHorizontal: 30,
    marginBottom: 16,
  },
  startCallButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF1493',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#FF1493',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cameraIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  costBadge: {
    position: 'absolute',
    top: -8,
    right: 20,
    backgroundColor: '#21ebc5ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2
  },
  costBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
  },

  // CALL MODAL STYLES
  callScreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
  },
  remoteVideoImage: {
    width: width,
    height: height,
    position: 'absolute',
  },
  remoteVideoWaiting: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#05030A',
  },
  remoteVideoWaitingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 12,
  },
  callOverlayGradient: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  callTopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  remoteUserInfoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  callUserAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  callUserTextCol: {
    justifyContent: 'center',
  },
  callUserNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callUserName: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  callUserBio: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 11,
    maxWidth: 140,
  },
  callTimerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  redLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 6,
  },
  callTimerText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  pipCameraContainer: {
    position: 'absolute',
    top: 90,
    right: 16,
    width: 100,
    height: 145,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 30,
    backgroundColor: '#111111',
  },
  pipCameraImage: {
    width: '100%',
    height: '100%',
  },
  pipLabel: {
    position: 'absolute',
    bottom: 4,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pipLabelText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  heartsContainer: {
    position: 'absolute',
    bottom: 120,
    left: 40,
    zIndex: 20,
  },
  floatingHeart: {
    fontSize: 36,
    position: 'absolute',
    bottom: 0,
  },
  callBottomControls: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  callControlBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callControlBtnActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
  },
  controlIcon: {
    fontSize: 20,
  },
  endCallButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  endCallIcon: {
    fontSize: 26,
  },
  nextMatchBtn: {
    backgroundColor: '#FF2A85',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
  },
  nextMatchText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});

export default HomeScreen;
