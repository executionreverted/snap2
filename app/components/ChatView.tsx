import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

interface Message {
  id: string
  text?: string
  image?: string
  timestamp: Date
  isSent: boolean
  isRead: boolean
  type: 'text' | 'image' | 'voice'
}

interface ChatViewProps {
  contactName: string
  contactAvatar: string
  onBack: () => void
  onCamera: () => void
}

const mockMessages: Message[] = [
  {
    id: '1',
    text: 'Hey! How was your day?',
    timestamp: new Date(Date.now() - 3600000),
    isSent: false,
    isRead: true,
    type: 'text'
  },
  {
    id: '2',
    text: 'It was amazing! Just got back from the beach 🏖️',
    timestamp: new Date(Date.now() - 3500000),
    isSent: true,
    isRead: true,
    type: 'text'
  },
  {
    id: '3',
    image: '📸',
    timestamp: new Date(Date.now() - 3400000),
    isSent: false,
    isRead: true,
    type: 'image'
  },
  {
    id: '4',
    text: 'Wow! That sunset looks incredible 😍',
    timestamp: new Date(Date.now() - 3300000),
    isSent: true,
    isRead: true,
    type: 'text'
  },
  {
    id: '5',
    text: 'Want to go together next time?',
    timestamp: new Date(Date.now() - 300000),
    isSent: false,
    isRead: false,
    type: 'text'
  }
]

export default function ChatView({ contactName, contactAvatar, onBack, onCamera }: ChatViewProps) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState(mockMessages)
  const [isTyping, setIsTyping] = useState(false)
  const scrollViewRef = useRef<ScrollView>(null)
  const slideAnim = useRef(new Animated.Value(screenWidth)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Slide in animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message,
        timestamp: new Date(),
        isSent: true,
        isRead: false,
        type: 'text'
      }
      setMessages([...messages, newMessage])
      setMessage('')

      // Simulate typing indicator
      setTimeout(() => setIsTyping(true), 1000)
      setTimeout(() => {
        setIsTyping(false)
        // Simulate response
        const response: Message = {
          id: (Date.now() + 1).toString(),
          text: '👍',
          timestamp: new Date(),
          isSent: false,
          isRead: false,
          type: 'text'
        }
        setMessages(prev => [...prev, response])
      }, 3000)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const renderMessage = (msg: Message) => (
    <View
      key={msg.id}
      style={[
        styles.messageContainer,
        msg.isSent ? styles.sentMessage : styles.receivedMessage
      ]}
    >
      {msg.type === 'image' ? (
        <View style={styles.imageMessage}>
          <Text style={styles.imagePlaceholder}>{msg.image}</Text>
          <Text style={styles.imageSize}>Photo • 2.1 MB</Text>
        </View>
      ) : (
        <Text style={[
          styles.messageText,
          msg.isSent ? styles.sentText : styles.receivedText
        ]}>
          {msg.text}
        </Text>
      )}
      <View style={styles.messageFooter}>
        <Text style={styles.timestamp}>{formatTime(msg.timestamp)}</Text>
        {msg.isSent && (
          <Ionicons
            name={msg.isRead ? 'checkmark-done' : 'checkmark'}
            size={14}
            color={msg.isRead ? '#4ECDC4' : 'rgba(255,255,255,0.6)'}
          />
        )}
      </View>
    </View>
  )

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX: slideAnim }],
          opacity: fadeAnim,
        }
      ]}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.background}
      >
        {/* Header */}
        <BlurView intensity={30} tint="light" style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>

          <View style={styles.contactInfo}>
            <Text style={styles.contactAvatar}>{contactAvatar}</Text>
            <View>
              <Text style={styles.contactName}>{contactName}</Text>
              <Text style={styles.lastSeen}>last seen 2m ago</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="videocam" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="call" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </BlurView>

        {/* Messages */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.chatArea}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
          >
            {messages.map(renderMessage)}

            {isTyping && (
              <View style={[styles.messageContainer, styles.receivedMessage]}>
                <View style={styles.typingIndicator}>
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input Area */}
          <BlurView intensity={40} tint="light" style={styles.inputContainer}>
            <TouchableOpacity onPress={onCamera} style={styles.cameraButton}>
              <LinearGradient
                colors={['#FF6B6B', '#4ECDC4']}
                style={styles.cameraGradient}
              >
                <Ionicons name="camera" size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.messageInputContainer}>
              <TextInput
                style={styles.messageInput}
                placeholder="Send a message..."
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={message}
                onChangeText={setMessage}
                multiline
                maxLength={1000}
              />

              <TouchableOpacity style={styles.attachButton}>
                <Ionicons name="add" size={20} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={sendMessage}
              style={[
                styles.sendButton,
                message.trim() && styles.sendButtonActive
              ]}
            >
              <Ionicons
                name="send"
                size={18}
                color={message.trim() ? "white" : "rgba(255,255,255,0.5)"}
              />
            </TouchableOpacity>
          </BlurView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 45,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    marginRight: 15,
  },
  contactInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactAvatar: {
    fontSize: 20,
    marginRight: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    textAlign: 'center',
    lineHeight: 40,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  lastSeen: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    padding: 8,
  },
  chatArea: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 10,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  sentMessage: {
    alignSelf: 'flex-end',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  sentText: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    color: '#333',
  },
  receivedText: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: 'white',
  },
  imageMessage: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
  },
  imagePlaceholder: {
    fontSize: 48,
    marginBottom: 8,
  },
  imageSize: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    paddingHorizontal: 4,
    gap: 4,
  },
  timestamp: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
  typingIndicator: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: 35,
    gap: 12,
  },
  cameraButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  cameraGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  messageInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    paddingVertical: 8,
    maxHeight: 80,
  },
  attachButton: {
    padding: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#4ECDC4',
  },
})
