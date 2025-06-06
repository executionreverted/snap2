import React, { useRef, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

interface PostSuccessProps {
  visible: boolean
  postType: 'story' | 'message'
  recipientCount?: number
  onClose: () => void
  onViewPost?: () => void
  onTakeAnother?: () => void
}

export default function PostSuccess({
  visible,
  postType,
  recipientCount = 0,
  onClose,
  onViewPost,
  onTakeAnother
}: PostSuccessProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const checkmarkAnim = useRef(new Animated.Value(0)).current
  const bounceAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      // Entrance animation sequence
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(checkmarkAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(bounceAnim, {
          toValue: 1,
          tension: 150,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start()

      // Auto-close after 3 seconds
      const timer = setTimeout(() => {
        handleClose()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [visible])

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onClose())
  }

  const getSuccessMessage = () => {
    if (postType === 'story') {
      return {
        title: 'Story Posted!',
        subtitle: 'Your story is now live for 24 hours',
        icon: 'library' as const
      }
    } else {
      return {
        title: 'Photo Sent!',
        subtitle: `Sent to ${recipientCount} friend${recipientCount > 1 ? 's' : ''}`,
        icon: 'send' as const
      }
    }
  }

  const { title, subtitle, icon } = getSuccessMessage()

  if (!visible) return null

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
        }
      ]}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.9)']}
        style={styles.background}
      >
        <TouchableOpacity
          style={styles.backdrop}
          onPress={handleClose}
          activeOpacity={1}
        />

        <Animated.View
          style={[
            styles.successCard,
            {
              transform: [
                { scale: scaleAnim },
                {
                  scale: bounceAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.05],
                  })
                }
              ]
            }
          ]}
        >
          <BlurView intensity={40} tint="light" style={styles.cardBlur}>
            {/* Success Icon */}
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  transform: [
                    {
                      scale: checkmarkAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, 1.2, 1],
                      })
                    }
                  ]
                }
              ]}
            >
              <LinearGradient
                colors={['#4ECDC4', '#45B7D1']}
                style={styles.iconGradient}
              >
                <Ionicons name="checkmark" size={32} color="white" />
              </LinearGradient>
            </Animated.View>

            {/* Success Text */}
            <View style={styles.textContainer}>
              <Text style={styles.successTitle}>{title}</Text>
              <Text style={styles.successSubtitle}>{subtitle}</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              {postType === 'story' && onViewPost && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={onViewPost}
                >
                  <BlurView intensity={20} tint="dark" style={styles.actionBlur}>
                    <Ionicons name="eye" size={18} color="white" />
                    <Text style={styles.actionText}>View Story</Text>
                  </BlurView>
                </TouchableOpacity>
              )}

              {onTakeAnother && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={onTakeAnother}
                >
                  <BlurView intensity={20} tint="dark" style={styles.actionBlur}>
                    <Ionicons name="camera" size={18} color="white" />
                    <Text style={styles.actionText}>Take Another</Text>
                  </BlurView>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleClose}
              >
                <BlurView intensity={20} tint="dark" style={styles.actionBlur}>
                  <Ionicons name="close" size={18} color="white" />
                  <Text style={styles.actionText}>Close</Text>
                </BlurView>
              </TouchableOpacity>
            </View>

            {/* Stats (for stories) */}
            {postType === 'story' && (
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Ionicons name="eye" size={16} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.statText}>0 views</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="heart" size={16} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.statText}>0 likes</Text>
                </View>
              </View>
            )}
          </BlurView>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 6000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  successCard: {
    width: screenWidth * 0.85,
    borderRadius: 25,
    overflow: 'hidden',
  },
  cardBlur: {
    padding: 30,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4ECDC4',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  actionButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  actionBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  actionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '500',
  },
})
