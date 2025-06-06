import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import ChatView from './ChatView'

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

interface ChatScreenProps {
  onOpenCamera?: () => void
}

export default function ChatScreen({ onOpenCamera }: ChatScreenProps) {
  const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null)

  const handleChatPress = (chat: ChatItem) => {
    setSelectedChat(chat)
  }

  const handleBackFromChat = () => {
    setSelectedChat(null)
  }

  const handleCameraFromChat = () => {
    setSelectedChat(null)
    onOpenCamera?.()
  }

  if (selectedChat) {
    return (
      <ChatView
        contactName={selectedChat.name}
        contactAvatar={selectedChat.avatar}
        onBack={handleBackFromChat}
        onCamera={handleCameraFromChat}
      />
    )
  }

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      style={styles.container}
    >
      <View style={styles.header}>
        <BlurView intensity={20} tint="light" style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Chats</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerButton}>
                <Ionicons name="search" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton}>
                <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </View>

      <ScrollView
        style={styles.chatList}
        contentContainerStyle={styles.chatListContent}
        showsVerticalScrollIndicator={false}
      >
        {mockChats.map((chat) => (
          <TouchableOpacity
            key={chat.id}
            style={styles.chatItem}
            onPress={() => handleChatPress(chat)}
            activeOpacity={0.8}
          >
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

                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color="rgba(255,255,255,0.5)"
                />
              </View>
            </BlurView>
          </TouchableOpacity>
        ))}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <BlurView intensity={20} tint="light" style={styles.quickActionsBlur}>
            <View style={styles.quickActionsContent}>
              <Text style={styles.quickActionsTitle}>Quick Actions</Text>

              <View style={styles.quickActionsGrid}>
                <TouchableOpacity
                  style={styles.quickActionItem}
                  onPress={onOpenCamera}
                >
                  <LinearGradient
                    colors={['#FF6B6B', '#4ECDC4']}
                    style={styles.quickActionGradient}
                  >
                    <Ionicons name="camera" size={20} color="white" />
                  </LinearGradient>
                  <Text style={styles.quickActionText}>Send Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.quickActionItem}>
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.quickActionGradient}
                  >
                    <Ionicons name="people" size={20} color="white" />
                  </LinearGradient>
                  <Text style={styles.quickActionText}>Group Chat</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.quickActionItem}>
                  <LinearGradient
                    colors={['#f093fb', '#f5576c']}
                    style={styles.quickActionGradient}
                  >
                    <Ionicons name="scan" size={20} color="white" />
                  </LinearGradient>
                  <Text style={styles.quickActionText}>Scan Code</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.quickActionItem}>
                  <LinearGradient
                    colors={['#4facfe', '#00f2fe']}
                    style={styles.quickActionGradient}
                  >
                    <Ionicons name="location" size={20} color="white" />
                  </LinearGradient>
                  <Text style={styles.quickActionText}>Share Location</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.quickActionItem}>
                  <LinearGradient
                    colors={['#a8edea', '#fed6e3']}
                    style={styles.quickActionGradient}
                  >
                    <Ionicons name="gift" size={20} color="white" />
                  </LinearGradient>
                  <Text style={styles.quickActionText}>Send Gift</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.quickActionItem}>
                  <LinearGradient
                    colors={['#ffecd2', '#fcb69f']}
                    style={styles.quickActionGradient}
                  >
                    <Ionicons name="musical-notes" size={20} color="white" />
                  </LinearGradient>
                  <Text style={styles.quickActionText}>Voice Note</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <BlurView intensity={20} tint="light" style={styles.activityBlur}>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Recent Activity</Text>

              <TouchableOpacity style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons name="camera" size={16} color="#4ECDC4" />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityText}>Posted to My Story</Text>
                  <Text style={styles.activityTime}>2 hours ago</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons name="heart" size={16} color="#FF6B6B" />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityText}>3 people viewed your story</Text>
                  <Text style={styles.activityTime}>4 hours ago</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons name="people" size={16} color="#45B7D1" />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityText}>Added to group chat</Text>
                  <Text style={styles.activityTime}>1 day ago</Text>
                </View>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
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
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    padding: 8,
  },
  chatList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  chatListContent: {
    paddingBottom: 160, // Proper bottom padding for nav + extra space
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
  quickActions: {
    marginTop: 20,
    marginBottom: 20,
  },
  quickActionsBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  quickActionsContent: {
    padding: 20,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 15,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionItem: {
    alignItems: 'center',
    width: '30%', // 3 items per row with spacing
  },
  quickActionGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  quickActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  activitySection: {
    marginBottom: 40,
  },
  activityBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  activityContent: {
    padding: 20,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 15,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  activityTime: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
})
