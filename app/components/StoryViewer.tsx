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

interface StoryViewerProps {
  stories: Story[]
  initialIndex: number
  onClose: () => void
  onReply: (storyId: string, message: string) => void
}

const mockStories: Story[] = [
  {
    id: '1',
    username: 'sarah_j',
    avatar: '👩‍🦱',
    content: '🌅',
    timestamp: new Date(Date.now() - 1800000),
    isViewed: false
  },
  {
    id: '2',
    username: 'sarah_j',
    avatar: '👩‍🦱',
    content: '🏖️',
    timestamp: new Date(Date.now() - 900000),
    isViewed: false
  },
  {
    id: '3',
    username: 'sarah_j',
    avatar: '👩‍🦱',
    content: '🍹',
    timestamp: new Date(Date.now() - 300000),
    isViewed: false
  }
]

export default function StoryViewer({
  stories = mockStories,
  initialIndex = 0,
  onClose,
  onReply
}: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [replyMessage, setReplyMessage] = useState('')

  const progressAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(1.1)).current

  const storyDuration = 5000 // 5 seconds per story

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
    if (currentIndex < stories.length) {
      startStoryProgress()
    }
  }, [currentIndex])

  const startStoryProgress = () => {
    if (isPaused) return

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
    const currentProgress = progress

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: (1 - currentProgress) * storyDuration,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !isPaused) {
        nextStory()
      }
    })
  }

  const nextStory = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1)
      Animated.timing(slideAnim, {
        toValue: -(currentIndex + 1) * screenWidth,
        duration: 300,
        useNativeDriver: true,
      }).start()
    } else {
      closeViewer()
    }
  }

  const prevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      Animated.timing(slideAnim, {
        toValue: -(currentIndex - 1) * screenWidth,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
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
    if (replyMessage.trim()) {
      onReply(stories[currentIndex].id, replyMessage)
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

  const currentStory = stories[currentIndex]

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
          {stories.map((_, index) => (
            <View key={index} style={styles.progressBarBackground}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: index === currentIndex
                      ? progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%']
                      })
                      : index < currentIndex ? '100%' : '0%'
                  }
                ]}
              />
            </View>
          ))}
        </View>

        {/* Header */}
        <BlurView intensity={20} tint="dark" style={styles.header}>
          <View style={styles.userInfo}>
            <Text style={styles.avatar}>{currentStory.avatar}</Text>
            <View>
              <Text style={styles.username}>{currentStory.username}</Text>
              <Text style={styles.timestamp}>
                {formatTime(currentStory.timestamp)}
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
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
          <Animated.View
            style={[
              styles.storiesSlider,
              { transform: [{ translateX: slideAnim }] }
            ]}
          >
            {stories.map((story, index) => (
              <View key={story.id} style={styles.storySlide}>
                <TouchableOpacity
                  style={styles.storyContent}
                  onPressIn={pauseStory}
                  onPressOut={resumeStory}
                  activeOpacity={1}
                >
                  <View style={styles.contentCenter}>
                    <Text style={styles.storyEmoji}>{story.content}</Text>
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
            ))}
          </Animated.View>
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
                  placeholder={`Reply to ${currentStory.username}...`}
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
    gap: 10,
  },
  headerButton: {
    padding: 8,
  },
  contentContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  storiesSlider: {
    flexDirection: 'row',
    height: '100%',
  },
  storySlide: {
    width: screenWidth,
    height: '100%',
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
