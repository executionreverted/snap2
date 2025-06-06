import React from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'

interface ChatItem {
  id: string
  name: string
  lastMessage: string
  timestamp: string
  avatar: string
  unread: boolean
  isTyping?: boolean
}

const mockChats: ChatItem[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    lastMessage: '📸 Sent a photo',
    timestamp: '2m',
    avatar: '👩‍🦱',
    unread: true,
  },
  {
    id: '2',
    name: 'Mike Chen',
    lastMessage: 'Hey! How was your day?',
    timestamp: '1h',
    avatar: '👨‍💻',
    unread: false,
    isTyping: true,
  },
  {
    id: '3',
    name: 'Emma Wilson',
    lastMessage: '🔥 Amazing sunset tonight!',
    timestamp: '3h',
    avatar: '👩‍🎨',
    unread: false,
  },
  {
    id: '4',
    name: 'Alex Rivera',
    lastMessage: 'Thanks for the help today',
    timestamp: '1d',
    avatar: '👨‍🚀',
    unread: true,
  },
  {
    id: '5',
    name: 'Luna Park',
    lastMessage: 'See you tomorrow! 🎉',
    timestamp: '2d',
    avatar: '👩‍🎤',
    unread: false,
  },
]

export default function ChatScreen() {
  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      style={styles.container}
    >
      <View style={styles.header}>
        <BlurView intensity={20} tint="light" style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Chats</Text>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="search" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>

      <ScrollView style={styles.chatList} showsVerticalScrollIndicator={false}>
        {mockChats.map((chat) => (
          <TouchableOpacity key={chat.id} style={styles.chatItem}>
            <BlurView intensity={30} tint="light" style={styles.chatItemBlur}>
              <View style={styles.chatContent}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatar}>{chat.avatar}</Text>
                  {chat.unread && <View style={styles.unreadDot} />}
                </View>

                <View style={styles.chatInfo}>
                  <View style={styles.chatHeader}>
                    <Text style={styles.chatName}>{chat.name}</Text>
                    <Text style={styles.timestamp}>{chat.timestamp}</Text>
                  </View>
                  <View style={styles.messageContainer}>
                    <Text style={[
                      styles.lastMessage,
                      chat.unread && styles.unreadMessage
                    ]}>
                      {chat.isTyping ? '💬 typing...' : chat.lastMessage}
                    </Text>
                    {chat.unread && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadCount}>1</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </BlurView>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.fab}>
        <LinearGradient
          colors={['#FF6B6B', '#4ECDC4']}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 70,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  headerButton: {
    padding: 8,
  },
  chatList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  chatItem: {
    marginBottom: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  chatItemBlur: {
    overflow: 'hidden',
  },
  chatContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    fontSize: 24,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    textAlign: 'center',
    lineHeight: 50,
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF6B6B',
    borderWidth: 2,
    borderColor: 'white',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  timestamp: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  messageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    flex: 1,
  },
  unreadMessage: {
    fontWeight: '600',
    color: 'white',
  },
  unreadBadge: {
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 120,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
