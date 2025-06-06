import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  TextInput,
  ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

interface PhotoEditorProps {
  imageUri?: string
  onClose: () => void
  onPost: (options: PostOptions) => void
}

interface PostOptions {
  text?: string
  stickers: Sticker[]
  filters: string[]
  recipients: string[]
  isStory: boolean
}

interface Sticker {
  id: string
  type: 'emoji' | 'text'
  content: string
  x: number
  y: number
  scale: number
  rotation: number
}

const mockContacts = [
  { id: '1', name: 'Sarah Johnson', avatar: '👩‍🦱' },
  { id: '2', name: 'Mike Chen', avatar: '👨‍💻' },
  { id: '3', name: 'Emma Wilson', avatar: '👩‍🎨' },
  { id: '4', name: 'Alex Rivera', avatar: '👨‍🚀' },
  { id: '5', name: 'Luna Park', avatar: '👩‍🎤' },
]

const emojiStickers = ['😍', '🔥', '💯', '✨', '❤️', '😂', '🎉', '👀', '💪', '🌟', '💫', '🎯']

export default function PhotoEditor({ imageUri, onClose, onPost }: PhotoEditorProps) {
  const [activeTab, setActiveTab] = useState<'stickers' | 'text' | 'send'>('stickers')
  const [stickers, setStickers] = useState<Sticker[]>([])
  const [textInput, setTextInput] = useState('')
  const [showTextInput, setShowTextInput] = useState(false)
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null)
  const [bottomSheetExpanded, setBottomSheetExpanded] = useState(true)

  const slideAnim = useRef(new Animated.Value(screenHeight)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const bottomSheetAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
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
      })
    ]).start()
  }, [])

  useEffect(() => {
    Animated.timing(bottomSheetAnim, {
      toValue: bottomSheetExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }, [bottomSheetExpanded])

  const closeEditor = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      })
    ]).start(() => onClose())
  }

  const toggleBottomSheet = () => {
    setBottomSheetExpanded(!bottomSheetExpanded)
  }

  const addSticker = (content: string, type: 'emoji' | 'text' = 'emoji') => {
    const newSticker: Sticker = {
      id: Date.now().toString(),
      type,
      content,
      x: screenWidth / 2,
      y: screenHeight / 2,
      scale: 1,
      rotation: 0,
    }
    setStickers([...stickers, newSticker])
    setSelectedSticker(content)
  }

  const addTextSticker = () => {
    if (textInput.trim()) {
      addSticker(textInput, 'text')
      setTextInput('')
      setShowTextInput(false)
      setActiveTab('stickers')
    }
  }

  const toggleRecipient = (contactId: string) => {
    setSelectedRecipients(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    )
  }

  const handlePost = (isStory: boolean = false) => {
    const postOptions: PostOptions = {
      stickers,
      filters: [],
      recipients: selectedRecipients,
      isStory,
    }
    onPost(postOptions)
  }

  const renderBottomSheet = () => {
    switch (activeTab) {
      case 'stickers':
        return (
          <ScrollView style={styles.stickerGrid} showsVerticalScrollIndicator={false}>
            <View style={styles.stickerRow}>
              {emojiStickers.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.stickerItem,
                    selectedSticker === emoji && styles.selectedSticker
                  ]}
                  onPress={() => addSticker(emoji)}
                >
                  <Text style={styles.stickerEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )

      case 'text':
        return (
          <View style={styles.textContainer}>
            {showTextInput ? (
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Add text..."
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  value={textInput}
                  onChangeText={setTextInput}
                  autoFocus
                  multiline
                  maxLength={100}
                />
                <View style={styles.textActions}>
                  <TouchableOpacity
                    onPress={() => setShowTextInput(false)}
                    style={styles.textActionButton}
                  >
                    <Text style={styles.textActionText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={addTextSticker}
                    style={[styles.textActionButton, styles.textActionButtonPrimary]}
                  >
                    <Text style={[styles.textActionText, styles.textActionTextPrimary]}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addTextButton}
                onPress={() => setShowTextInput(true)}
              >
                <Ionicons name="text" size={24} color="white" />
                <Text style={styles.addTextButtonText}>Add Text</Text>
              </TouchableOpacity>
            )}
          </View>
        )

      case 'send':
        return (
          <ScrollView style={styles.contactsList} showsVerticalScrollIndicator={false}>
            <View style={styles.sendActions}>
              <TouchableOpacity
                style={styles.storyButton}
                onPress={() => handlePost(true)}
              >
                <LinearGradient
                  colors={['#FF6B6B', '#4ECDC4']}
                  style={styles.storyGradient}
                >
                  <Ionicons name="add" size={20} color="white" />
                  <Text style={styles.storyText}>My Story</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <Text style={styles.contactsHeader}>Send to Friends</Text>

            {mockContacts.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                style={[
                  styles.contactItem,
                  selectedRecipients.includes(contact.id) && styles.selectedContact
                ]}
                onPress={() => toggleRecipient(contact.id)}
              >
                <Text style={styles.contactAvatar}>{contact.avatar}</Text>
                <Text style={styles.contactName}>{contact.name}</Text>
                {selectedRecipients.includes(contact.id) && (
                  <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
                )}
              </TouchableOpacity>
            ))}

            {selectedRecipients.length > 0 && (
              <TouchableOpacity
                style={styles.sendButton}
                onPress={() => handlePost(false)}
              >
                <LinearGradient
                  colors={['#4ECDC4', '#45B7D1']}
                  style={styles.sendGradient}
                >
                  <Ionicons name="send" size={18} color="white" />
                  <Text style={styles.sendButtonText}>
                    Send to {selectedRecipients.length} friend{selectedRecipients.length > 1 ? 's' : ''}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </ScrollView>
        )
    }
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        }
      ]}
    >
      <LinearGradient
        colors={['#000', '#1a1a1a']}
        style={styles.background}
      >
        {/* Header */}
        <BlurView intensity={20} tint="dark" style={styles.header}>
          <TouchableOpacity onPress={closeEditor} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Edit Photo</Text>

          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="download" size={20} color="white" />
          </TouchableOpacity>
        </BlurView>

        {/* Photo Preview */}
        <Animated.View
          style={[
            styles.photoContainer,
            {
              flex: bottomSheetAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0.6],
              }),
            }
          ]}
        >
          <View style={styles.photoPreview}>
            <Text style={styles.photoPlaceholder}>📸</Text>
            <Text style={styles.photoText}>Photo Preview</Text>

            {/* Render stickers */}
            {stickers.map((sticker) => (
              <Animated.View
                key={sticker.id}
                style={[
                  styles.stickerOverlay,
                  {
                    left: sticker.x - 25,
                    top: sticker.y - 25,
                    transform: [
                      { scale: sticker.scale },
                      { rotate: `${sticker.rotation}deg` }
                    ]
                  }
                ]}
              >
                <Text style={[
                  sticker.type === 'emoji' ? styles.overlayEmoji : styles.overlayText
                ]}>
                  {sticker.content}
                </Text>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Collapse/Expand Button */}
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={toggleBottomSheet}
        >
          <BlurView intensity={40} tint="dark" style={styles.toggleButtonBlur}>
            <Ionicons
              name={bottomSheetExpanded ? "chevron-down" : "chevron-up"}
              size={20}
              color="white"
            />
          </BlurView>
        </TouchableOpacity>

        {/* Bottom Tabs Container */}
        <Animated.View
          style={[
            styles.tabsContainer,
            {
              height: bottomSheetAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [60, 280],
              }),
            }
          ]}
        >
          <BlurView intensity={40} tint="dark" style={styles.tabsBlur}>
            {/* Bottom Tabs */}
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'stickers' && styles.activeTab]}
                onPress={() => setActiveTab('stickers')}
              >
                <Ionicons
                  name="happy"
                  size={20}
                  color={activeTab === 'stickers' ? '#4ECDC4' : 'rgba(255,255,255,0.6)'}
                />
                <Text style={[
                  styles.tabText,
                  activeTab === 'stickers' && styles.activeTabText
                ]}>
                  Stickers
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tab, activeTab === 'text' && styles.activeTab]}
                onPress={() => setActiveTab('text')}
              >
                <Ionicons
                  name="text"
                  size={20}
                  color={activeTab === 'text' ? '#4ECDC4' : 'rgba(255,255,255,0.6)'}
                />
                <Text style={[
                  styles.tabText,
                  activeTab === 'text' && styles.activeTabText
                ]}>
                  Text
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tab, activeTab === 'send' && styles.activeTab]}
                onPress={() => setActiveTab('send')}
              >
                <Ionicons
                  name="send"
                  size={20}
                  color={activeTab === 'send' ? '#4ECDC4' : 'rgba(255,255,255,0.6)'}
                />
                <Text style={[
                  styles.tabText,
                  activeTab === 'send' && styles.activeTabText
                ]}>
                  Send
                </Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Sheet Content */}
            {bottomSheetExpanded && (
              <Animated.View
                style={[
                  styles.bottomSheet,
                  {
                    opacity: bottomSheetAnim,
                  }
                ]}
              >
                {renderBottomSheet()}
              </Animated.View>
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
    zIndex: 3000,
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  headerButton: {
    padding: 8,
  },
  photoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  photoPreview: {
    width: '100%',
    aspectRatio: 0.75,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  photoPlaceholder: {
    fontSize: 48,
    marginBottom: 10,
  },
  photoText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
  },
  stickerOverlay: {
    position: 'absolute',
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayEmoji: {
    fontSize: 24,
  },
  overlayText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  toggleButton: {
    alignSelf: 'center',
    marginBottom: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  toggleButtonBlur: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabsContainer: {
    paddingBottom: 40,
  },
  tabsBlur: {
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    borderRadius: 15,
  },
  tabText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4ECDC4',
  },
  bottomSheet: {
    height: 200,
    paddingHorizontal: 20,
  },
  stickerGrid: {
    flex: 1,
  },
  stickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  stickerItem: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    marginBottom: 10,
  },
  selectedSticker: {
    backgroundColor: 'rgba(78, 205, 196, 0.3)',
  },
  stickerEmoji: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    gap: 10,
  },
  addTextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  textInputContainer: {
    width: '100%',
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
    color: 'white',
    fontSize: 16,
    marginBottom: 15,
    maxHeight: 100,
  },
  textActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  textActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  textActionButtonPrimary: {
    backgroundColor: '#4ECDC4',
  },
  textActionText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  textActionTextPrimary: {
    color: 'white',
  },
  contactsList: {
    flex: 1,
  },
  sendActions: {
    marginBottom: 20,
  },
  storyButton: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  storyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8,
  },
  storyText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  contactsHeader: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  selectedContact: {
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
  },
  contactAvatar: {
    fontSize: 16,
    marginRight: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    textAlign: 'center',
    lineHeight: 30,
  },
  contactName: {
    flex: 1,
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  sendButton: {
    marginTop: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  sendGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
})
