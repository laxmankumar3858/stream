import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface ChatDetailScreenProps {
  navigation?: any;
  route?: any;
}

const ChatDetailScreen: React.FC<ChatDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const chatUser = route?.params?.chatUser || {
    name: 'ANGELICA ANGELICA',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    isOnline: true,
  };

  const [messages, setMessages] = useState<
    { id: string; text: string; isUser: boolean; time: string }[]
  >([
    { id: 'm1', text: 'hola amor como estas', isUser: false, time: '01:45' },
    { id: 'm2', text: 'Hola! I am doing great, how about you?', isUser: true, time: '01:46' },
  ]);
  const [inputText, setInputText] = useState<string>('');

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const newMsg = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Simulated auto-reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: 'Que lindo! ❤️ Let us talk soon!',
          isUser: false,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1200);
  };

  return (
    <LinearGradient
      colors={['#0B132B', '#1C1035', '#4A0E4E']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />

        {/* Top Header Bar */}
        <View style={styles.chatHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation?.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerUserInfo}>
            <View style={[styles.avatarRing, chatUser.isOnline && styles.onlineRing]}>
              <Image source={{ uri: chatUser.avatar }} style={styles.headerUserAvatar} />
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.headerUserName}>{chatUser.name}</Text>
              <Text style={styles.headerUserStatus}>
                {chatUser.isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.headerCallBtn} activeOpacity={0.8}>
            <Image
              source={require('../../../assets/call.png')}
              style={{ width: 22, height: 22 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Messages Body */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={styles.messageList}
            contentContainerStyle={styles.messageContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageBubble,
                  msg.isUser ? styles.userBubble : styles.friendBubble,
                ]}
              >
                <Text style={styles.messageText}>{msg.text}</Text>
                <Text style={styles.messageTime}>{msg.time}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Bottom Chat Input Bar */}
          <View style={styles.inputBarContainer}>
            <TouchableOpacity style={styles.inputActionIcon}>
              <Ionicons name="happy-outline" size={24} color="rgba(255, 255, 255, 0.8)" />
            </TouchableOpacity>

            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={inputText}
              onChangeText={setInputText}
            />

            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
              activeOpacity={0.8}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.sendButtonText}>Send</Text>
                <Ionicons name="send" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
              </View>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '300',
    lineHeight: 34,
  },
  headerUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  avatarRing: {
    borderRadius: 22,
    padding: 2,
  },
  onlineRing: {
    borderWidth: 2,
    borderColor: '#10B981',
  },
  headerUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerUserName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  headerUserStatus: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '600',
  },
  headerCallBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageContent: {
    paddingVertical: 16,
  },
  messageBubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#FF2A85',
    borderBottomRightRadius: 4,
  },
  friendBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
  },
  messageTime: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  inputActionIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: 42,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 21,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#FF2A85',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginLeft: 10,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});

export default ChatDetailScreen;
