import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

interface Story {
  id: string
  username: string
  avatar: string
  content: string
  timestamp: Date
  isViewed: boolean
}

interface UserStories {
  username: string
  avatar: string
  stories: Story[]
  hasUnviewed: boolean
}

interface StoryViewerProps {
  userStories: UserStories
  allUserStories: UserStories[]
  onClose: () => void
  onReply: (storyId: string, message: string) => void
}

export default function StoryViewer({
  userStories,
  allUserStories,
  onClose,
  onReply
}: StoryViewerProps) {
  const [currentUserIndex, setCurrentUserIndex] = useState(() =>
    allUserStories.findIndex(user => user.username === userStories.username)
  )
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [replyMessage, setReplyMessage] = useState('')

  const progressAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(1.1)).current

  const storyDuration = 5000 // 5 seconds per story
  const currentUser = allUserStories[currentUserIndex]
  const currentStory = currentUser?.stories[currentStoryIndex]

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start()

    startStoryProgress()
  }, [])

  useEffect(() => {
    if (currentUser && currentStory) {
      startStoryProgress()
    }
  }, [currentUserIndex, currentStoryIndex])

  const startStoryProgress = () => {
    if (isPaused || !currentStory) return

    progressAnim.setValue(0)
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: storyDuration,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !isPaused) {
        nextStory()
      }
    })
  }

  const pauseStory = () => {
    setIsPaused(true)
    progressAnim.stopAnimation()
  }

  const resumeStory = () => {
    setIsPaused(false)

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: storyDuration * 0.8, // Resume with some time left
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !isPaused) {
        nextStory()
      }
    })
  }

  const nextStory = () => {
    if (currentStoryIndex < currentUser.stories.length - 1) {
      // Next story in current user's stories
      setCurrentStoryIndex(currentStoryIndex + 1)
    } else if (currentUserIndex < allUserStories.length - 1) {
      // Move to next user's first story
      setCurrentUserIndex(currentUserIndex + 1)
      setCurrentStoryIndex(0)
    } else {
      // No more stories, close viewer
      closeViewer()
    }
  }

  const prevStory = () => {
    if (currentStoryIndex > 0) {
      // Previous story in current user's stories
      setCurrentStoryIndex(currentStoryIndex - 1)
    } else if (currentUserIndex > 0) {
      // Move to previous user's last story
      const prevUserIndex = currentUserIndex - 1
      const prevUser = allUserStories[prevUserIndex]
      setCurrentUserIndex(prevUserIndex)
      setCurrentStoryIndex(prevUser.stories.length - 1)
    }
    // If at first story of first user, do nothing
  }

  const closeViewer = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => onClose())
  }

  const handleReply = () => {
    if (replyMessage.trim() && currentStory) {
      onReply(currentStory.id, replyMessage)
      setReplyMessage('')
      setShowReplyInput(false)
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60))
      return `${minutes}m`
    }
    return `${hours}h`
  }

  if (!currentUser || !currentStory) {
    return null
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      <LinearGradient
        colors={['#000', '#1a1a1a', '#000']}
        style={styles.background}
      >
        {/* Progress Bars */}
        <View style={styles.progressContainer}>
          {currentUser.stories.map((_, index) => (
            <View key={index} style={styles.progressBarBackground}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: index === currentStoryIndex
                      ? progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%']
                      })
                      : index < currentStoryIndex ? '100%' : '0%'
                  }
                ]}
              />
            </View>
          ))}
        </View>

        {/* Header */}
        <BlurView intensity={20} tint="dark" style={styles.header}>
          <View style={styles.userInfo}>
            <Text style={styles.avatar}>{currentUser.avatar}</Text>
            <View>
              <Text style={styles.username}>{currentUser.username}</Text>
              <Text style={styles.timestamp}>
                {formatTime(currentStory.timestamp)}
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            {/* User indicator if multiple users */}
            {allUserStories.length > 1 && (
              <View style={styles.userIndicator}>
                <Text style={styles.userIndicatorText}>
                  {currentUserIndex + 1}/{allUserStories.length}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="ellipsis-horizontal" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={closeViewer} style={styles.headerButton}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </BlurView>

        {/* Story Content */}
        <View style={styles.contentContainer}>
          <TouchableOpacity
            style={styles.storyContent}
            onPressIn={pauseStory}
            onPressOut={resumeStory}
            activeOpacity={1}
          >
            <View style={styles.contentCenter}>
              <Text style={styles.storyEmoji}>{currentStory.content}</Text>
            </View>

            {/* Tap areas for navigation */}
            <TouchableOpacity
              style={styles.prevArea}
              onPress={prevStory}
              activeOpacity={1}
            />
            <TouchableOpacity
              style={styles.nextArea}
              onPress={nextStory}
              activeOpacity={1}
            />
          </TouchableOpacity>
        </View>

        {/* Bottom Actions */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.bottomContainer}
        >
          {showReplyInput ? (
            <BlurView intensity={40} tint="dark" style={styles.replyContainer}>
              <View style={styles.replyInputContainer}>
                <TextInput
                  style={styles.replyInput}
                  placeholder={`Reply to ${currentUser.username}...`}
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  value={replyMessage}
                  onChangeText={setReplyMessage}
                  autoFocus
                  multiline
                  maxLength={200}
                />
                <TouchableOpacity onPress={handleReply} style={styles.sendReplyButton}>
                  <Ionicons name="send" size={18} color="white" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => setShowReplyInput(false)}
                style={styles.cancelReplyButton}
              >
                <Text style={styles.cancelReplyText}>Cancel</Text>
              </TouchableOpacity>
            </BlurView>
          ) : (
            <BlurView intensity={20} tint="dark" style={styles.actionsContainer}>
              <TouchableOpacity
                onPress={() => setShowReplyInput(true)}
                style={styles.replyButton}
              >
                <Ionicons name="chatbubble" size={20} color="white" />
                <Text style={styles.replyButtonText}>Send Message</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="heart" size={24} color="white" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="paper-plane" size={20} color="white" />
              </TouchableOpacity>
            </BlurView>
          )}
        </KeyboardAvoidingView>
      </LinearGradient>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2000,
  },
  background: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    paddingTop: 50,
    paddingHorizontal: 15,
    gap: 4,
  },
  progressBarBackground: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1,
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginTop: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    fontSize: 18,
    marginRight: 10,
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    textAlign: 'center',
    lineHeight: 35,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  timestamp: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userIndicator: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  userIndicatorText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  headerButton: {
    padding: 8,
  },
  contentContainer: {
    flex: 1,
  },
  storyContent: {
    flex: 1,
    position: 'relative',
  },
  contentCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyEmoji: {
    fontSize: 120,
    textAlign: 'center',
  },
  prevArea: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '30%',
    height: '100%',
  },
  nextArea: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: '70%',
    height: '100%',
  },
  bottomContainer: {
    paddingBottom: 40,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 25,
    gap: 15,
  },
  replyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
  replyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  actionButton: {
    padding: 12,
  },
  replyContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 25,
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 10,
    gap: 10,
  },
  replyInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    maxHeight: 80,
    paddingVertical: 8,
  },
  sendReplyButton: {
    backgroundColor: '#4ECDC4',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelReplyButton: {
    alignSelf: 'center',
  },
  cancelReplyText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
})
