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
  PanResponder,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import Svg, { Path } from 'react-native-svg'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

interface PhotoEditorProps {
  imageUri?: string
  onClose: () => void
  onPost: (options: PostOptions) => void
}

interface PostOptions {
  text?: string
  stickers: Sticker[]
  drawings: DrawingPath[]
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
  color?: string
  fontSize?: number
  fontWeight?: string
}

interface DrawingPath {
  id: string
  points: { x: number; y: number }[]
  color: string
  width: number
}

const mockContacts = [
  { id: '1', name: 'Sarah Johnson', avatar: '👩‍🦱' },
  { id: '2', name: 'Mike Chen', avatar: '👨‍💻' },
  { id: '3', name: 'Emma Wilson', avatar: '👩‍🎨' },
  { id: '4', name: 'Alex Rivera', avatar: '👨‍🚀' },
  { id: '5', name: 'Luna Park', avatar: '👩‍🎤' },
]

const emojiStickers = ['😍', '🔥', '💯', '✨', '❤️', '😂', '🎉', '👀', '💪', '🌟', '💫', '🎯', '🌈', '⚡', '🎨', '🎵', '🚀', '💖', '🎯', '🌸']
const drawingColors = ['#FFFFFF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#F093FB', '#FFD93D', '#6BCF7F', '#A8E6CF', '#FF9A9E', '#A8DADC']

export default function PhotoEditor({ imageUri, onClose, onPost }: PhotoEditorProps) {
  const [activeTab, setActiveTab] = useState<'stickers' | 'text' | 'draw' | 'send'>('stickers')
  const [stickers, setStickers] = useState<Sticker[]>([])
  const [drawings, setDrawings] = useState<DrawingPath[]>([])
  const [currentDrawing, setCurrentDrawing] = useState<DrawingPath | null>(null)
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawingColor, setDrawingColor] = useState('#FFFFFF')
  const [drawingWidth, setDrawingWidth] = useState(5)

  // Text editing states
  const [showTextEditor, setShowTextEditor] = useState(false)
  const [editingSticker, setEditingSticker] = useState<string | null>(null)
  const [textInput, setTextInput] = useState('')
  const [textColor, setTextColor] = useState('#FFFFFF')
  const [textSize, setTextSize] = useState(24)
  const [textStyle, setTextStyle] = useState<'normal' | 'bold' | 'italic'>('normal')

  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [bottomSheetExpanded, setBottomSheetExpanded] = useState(true)

  // Animation refs
  const slideAnim = useRef(new Animated.Value(screenHeight)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const bottomSheetAnim = useRef(new Animated.Value(1)).current
  const photoContainerRef = useRef<View>(null)

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

  const addSticker = (content: string, type: 'emoji' | 'text' = 'emoji') => {
    const newSticker: Sticker = {
      id: Date.now().toString(),
      type,
      content,
      x: screenWidth / 2,
      y: 200,
      scale: type === 'emoji' ? 1 : 0.8,
      rotation: 0,
      color: type === 'text' ? textColor : undefined,
      fontSize: type === 'text' ? textSize : undefined,
      fontWeight: textStyle === 'bold' ? 'bold' : 'normal',
    }
    setStickers([...stickers, newSticker])
    setSelectedSticker(newSticker.id)
  }

  const updateSticker = (id: string, updates: Partial<Sticker>) => {
    setStickers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  const deleteSticker = (id: string) => {
    setStickers(prev => prev.filter(s => s.id !== id))
    setSelectedSticker(null)
  }

  const createStickerPanResponder = (stickerId: string) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setSelectedSticker(stickerId)
      },
      onPanResponderMove: (evt, gestureState) => {
        const sticker = stickers.find(s => s.id === stickerId)
        if (sticker) {
          updateSticker(stickerId, {
            x: Math.max(50, Math.min(screenWidth - 50, sticker.x + gestureState.dx / 10)),
            y: Math.max(100, Math.min(400, sticker.y + gestureState.dy / 10))
          })
        }
      },
    })
  }

  const handleCanvasTouch = (event: any) => {
    if (activeTab !== 'draw') return

    const { locationX, locationY } = event.nativeEvent

    if (!isDrawing) {
      const newPath: DrawingPath = {
        id: Date.now().toString(),
        points: [{ x: locationX, y: locationY }],
        color: drawingColor,
        width: drawingWidth
      }
      setCurrentDrawing(newPath)
      setIsDrawing(true)
    } else if (currentDrawing) {
      setCurrentDrawing(prev => prev ? {
        ...prev,
        points: [...prev.points, { x: locationX, y: locationY }]
      } : null)
    }
  }

  const endDrawing = () => {
    if (currentDrawing && currentDrawing.points.length > 1) {
      setDrawings(prev => [...prev, currentDrawing])
      setCurrentDrawing(null)
    }
    setIsDrawing(false)
  }

  const openTextEditor = (stickerId?: string) => {
    if (stickerId) {
      const sticker = stickers.find(s => s.id === stickerId)
      if (sticker) {
        setTextInput(sticker.content)
        setTextColor(sticker.color || '#FFFFFF')
        setTextSize(sticker.fontSize || 24)
        setEditingSticker(stickerId)
      }
    } else {
      setTextInput('')
      setEditingSticker(null)
    }
    setShowTextEditor(true)
  }

  const saveText = () => {
    if (textInput.trim()) {
      if (editingSticker) {
        updateSticker(editingSticker, {
          content: textInput,
          color: textColor,
          fontSize: textSize,
          fontWeight: textStyle === 'bold' ? 'bold' : 'normal'
        })
      } else {
        addSticker(textInput, 'text')
      }
    }
    setShowTextEditor(false)
    setEditingSticker(null)
    setTextInput('')
  }

  const clearDrawings = () => {
    Alert.alert(
      'Clear All Drawings',
      'Are you sure you want to clear all drawings?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear', style: 'destructive', onPress: () => {
            setDrawings([])
            setCurrentDrawing(null)
          }
        }
      ]
    )
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
      drawings,
      filters: [],
      recipients: selectedRecipients,
      isStory,
    }
    onPost(postOptions)
  }

  const createSVGPath = (points: { x: number; y: number }[]) => {
    if (points.length < 2) return ''
    let path = `M ${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`
    }
    return path
  }

  const renderSticker = (sticker: Sticker) => {
    const panResponder = createStickerPanResponder(sticker.id)

    return (
      <Animated.View
        key={sticker.id}
        style={[
          styles.stickerContainer,
          {
            left: sticker.x - 25,
            top: sticker.y - 25,
            transform: [
              { scale: sticker.scale },
              { rotate: `${sticker.rotation}deg` }
            ],
            borderColor: selectedSticker === sticker.id ? '#4ECDC4' : 'transparent',
            borderWidth: selectedSticker === sticker.id ? 2 : 0,
          }
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          onPress={() => setSelectedSticker(sticker.id)}
          onLongPress={() => sticker.type === 'text' && openTextEditor(sticker.id)}
          activeOpacity={0.8}
        >
          <Text style={[
            sticker.type === 'emoji' ? styles.overlayEmoji : styles.overlayText,
            {
              color: sticker.color,
              fontSize: sticker.fontSize,
              fontWeight: sticker.fontWeight as any,
              fontStyle: textStyle === 'italic' ? 'italic' : 'normal'
            }
          ]}>
            {sticker.content}
          </Text>
        </TouchableOpacity>

        {selectedSticker === sticker.id && (
          <>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteSticker(sticker.id)}
            >
              <Ionicons name="close" size={12} color="white" />
            </TouchableOpacity>

            {/* Scale handles */}
            <TouchableOpacity
              style={styles.scaleHandle}
              onPress={() => updateSticker(sticker.id, {
                scale: Math.min(2, sticker.scale + 0.1)
              })}
            >
              <Ionicons name="add" size={10} color="white" />
            </TouchableOpacity>
          </>
        )}
      </Animated.View>
    )
  }

  const renderDrawings = () => (
    <View style={styles.drawingContainer}>
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
        {drawings.map((path) => (
          <Path
            key={path.id}
            d={createSVGPath(path.points)}
            stroke={path.color}
            strokeWidth={path.width}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {currentDrawing && (
          <Path
            d={createSVGPath(currentDrawing.points)}
            stroke={currentDrawing.color}
            strokeWidth={currentDrawing.width}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.8}
          />
        )}
      </Svg>
    </View>
  )

  const renderTextEditor = () => (
    <View style={styles.textEditorOverlay}>
      <BlurView intensity={40} tint="dark" style={styles.textEditorContainer}>
        <Text style={styles.textEditorTitle}>✏️ Edit Text</Text>

        <TextInput
          style={[styles.textEditorInput, {
            color: textColor,
            fontSize: textSize,
            fontWeight: textStyle === 'bold' ? 'bold' : 'normal',
            fontStyle: textStyle === 'italic' ? 'italic' : 'normal'
          }]}
          placeholder="Enter your text..."
          placeholderTextColor="rgba(255,255,255,0.5)"
          value={textInput}
          onChangeText={setTextInput}
          autoFocus
          multiline
          maxLength={100}
        />

        <View style={styles.textControls}>
          <Text style={styles.controlLabel}>Colors</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorPicker}>
            {drawingColors.map(color => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  textColor === color && styles.selectedColor
                ]}
                onPress={() => setTextColor(color)}
              />
            ))}
          </ScrollView>

          <Text style={styles.controlLabel}>Size</Text>
          <View style={styles.sizeControls}>
            <TouchableOpacity
              onPress={() => setTextSize(Math.max(16, textSize - 2))}
              style={styles.sizeButton}
            >
              <Ionicons name="remove" size={16} color="white" />
            </TouchableOpacity>
            <Text style={styles.sizeText}>{textSize}px</Text>
            <TouchableOpacity
              onPress={() => setTextSize(Math.min(40, textSize + 2))}
              style={styles.sizeButton}
            >
              <Ionicons name="add" size={16} color="white" />
            </TouchableOpacity>
          </View>

          <Text style={styles.controlLabel}>Style</Text>
          <View style={styles.styleControls}>
            {['normal', 'bold', 'italic'].map(style => (
              <TouchableOpacity
                key={style}
                style={[
                  styles.styleButton,
                  textStyle === style && styles.selectedStyleButton
                ]}
                onPress={() => setTextStyle(style as any)}
              >
                <Text style={[
                  styles.styleButtonText,
                  textStyle === style && styles.selectedStyleButtonText,
                  {
                    fontWeight: style === 'bold' ? 'bold' : 'normal',
                    fontStyle: style === 'italic' ? 'italic' : 'normal'
                  }
                ]}>
                  {style === 'normal' ? 'Aa' : style === 'bold' ? 'Aa' : 'Aa'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.textEditorActions}>
          <TouchableOpacity
            onPress={() => setShowTextEditor(false)}
            style={styles.textActionButton}
          >
            <Text style={styles.textActionText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={saveText}
            style={[styles.textActionButton, styles.textActionPrimary]}
          >
            <Text style={[styles.textActionText, styles.textActionTextPrimary]}>
              {editingSticker ? 'Update' : 'Add'}
            </Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  )

  const renderBottomSheet = () => {
    switch (activeTab) {
      case 'stickers':
        return (
          <ScrollView style={styles.stickerGrid} showsVerticalScrollIndicator={false}>
            <View style={styles.stickerRow}>
              {emojiStickers.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.stickerItem}
                  onPress={() => addSticker(emoji)}
                >
                  <Text style={styles.stickerEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.helpText}>Tap to add • Drag to move • Long press text to edit</Text>
          </ScrollView>
        )

      case 'text':
        return (
          <View style={styles.textContainer}>
            <TouchableOpacity
              style={styles.addTextButton}
              onPress={() => openTextEditor()}
            >
              <LinearGradient
                colors={['#4ECDC4', '#45B7D1']}
                style={styles.addTextGradient}
              >
                <Ionicons name="text" size={20} color="white" />
                <Text style={styles.addTextButtonText}>Add Text</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.textStats}>
              <Text style={styles.statsText}>
                📝 {stickers.filter(s => s.type === 'text').length} text elements
              </Text>
            </View>
          </View>
        )

      case 'draw':
        return (
          <View style={styles.drawContainer}>
            <View style={styles.drawControls}>
              <Text style={styles.controlLabel}>Brush Colors</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorPicker}>
                {drawingColors.map(color => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      drawingColor === color && styles.selectedColor
                    ]}
                    onPress={() => setDrawingColor(color)}
                  />
                ))}
              </ScrollView>

              <Text style={styles.controlLabel}>Brush Size: {drawingWidth}px</Text>
              <View style={styles.brushSizes}>
                {[3, 5, 8, 12, 16].map(size => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.brushSize,
                      {
                        width: Math.max(16, size * 1.5),
                        height: Math.max(16, size * 1.5),
                        backgroundColor: drawingColor
                      },
                      drawingWidth === size && styles.selectedBrush
                    ]}
                    onPress={() => setDrawingWidth(size)}
                  />
                ))}
              </View>

              <View style={styles.drawActions}>
                <TouchableOpacity onPress={clearDrawings} style={styles.clearButton}>
                  <Ionicons name="trash" size={18} color="white" />
                  <Text style={styles.clearButtonText}>Clear All</Text>
                </TouchableOpacity>

                <View style={styles.drawStats}>
                  <Text style={styles.statsText}>🎨 {drawings.length} drawings</Text>
                </View>
              </View>
            </View>
          </View>
        )

      case 'send':
        return (
          <ScrollView style={styles.contactsList} showsVerticalScrollIndicator={false}>
            <TouchableOpacity
              style={styles.previewButton}
              onPress={() => setShowPreview(true)}
            >
              <LinearGradient
                colors={['rgba(78, 205, 196, 0.2)', 'rgba(69, 183, 209, 0.2)']}
                style={styles.previewGradient}
              >
                <Ionicons name="eye" size={20} color="#4ECDC4" />
                <Text style={styles.previewButtonText}>Preview Final Result</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.storyButton}
              onPress={() => handlePost(true)}
            >
              <LinearGradient
                colors={['#FF6B6B', '#4ECDC4']}
                style={styles.storyGradient}
              >
                <Ionicons name="library" size={20} color="white" />
                <Text style={styles.storyText}>Add to My Story</Text>
              </LinearGradient>
            </TouchableOpacity>

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

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setActiveTab('send')}
          >
            <Ionicons name="arrow-forward" size={20} color="white" />
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
          <View
            style={styles.photoPreview}
            ref={photoContainerRef}
            onTouchStart={handleCanvasTouch}
            onTouchMove={handleCanvasTouch}
            onTouchEnd={endDrawing}
          >
            <Text style={styles.photoPlaceholder}>📸</Text>
            <Text style={styles.photoText}>Your amazing photo will appear here</Text>

            {/* Help text based on active tab */}
            <Text style={styles.helpText}>
              {activeTab === 'draw' ? '🎨 Touch and drag to draw beautiful lines' :
                activeTab === 'stickers' ? '😀 Tap emojis below to add fun stickers' :
                  activeTab === 'text' ? '✏️ Add custom text with colors and styles' :
                    '📤 Ready to share your masterpiece!'}
            </Text>

            {/* Render drawings */}
            {renderDrawings()}

            {/* Render stickers */}
            {stickers.map(renderSticker)}
          </View>
        </Animated.View>

        {/* Collapse/Expand Button */}
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setBottomSheetExpanded(!bottomSheetExpanded)}
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
                outputRange: [60, 320],
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
                style={[styles.tab, activeTab === 'draw' && styles.activeTab]}
                onPress={() => setActiveTab('draw')}
              >
                <Ionicons
                  name="brush"
                  size={20}
                  color={activeTab === 'draw' ? '#4ECDC4' : 'rgba(255,255,255,0.6)'}
                />
                <Text style={[
                  styles.tabText,
                  activeTab === 'draw' && styles.activeTabText
                ]}>
                  Draw
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

        {/* Text Editor Overlay */}
        {showTextEditor && renderTextEditor()}

        {/* Preview Modal */}
        {showPreview && (
          <View style={styles.previewOverlay}>
            <BlurView intensity={50} tint="dark" style={styles.previewContainer}>
              <Text style={styles.previewTitle}>✨ Final Preview</Text>
              <View style={styles.previewImage}>
                <Text style={styles.previewPlaceholder}>📸</Text>
                <Text style={styles.previewText}>Your masterpiece is ready!</Text>
                <View style={styles.previewStats}>
                  <Text style={styles.previewStatText}>🎯 {stickers.length} stickers</Text>
                  <Text style={styles.previewStatText}>🎨 {drawings.length} drawings</Text>
                  <Text style={styles.previewStatText}>✏️ {stickers.filter(s => s.type === 'text').length} texts</Text>
                </View>
              </View>
              <View style={styles.previewActions}>
                <TouchableOpacity
                  onPress={() => setShowPreview(false)}
                  style={styles.previewActionButton}
                >
                  <Text style={styles.previewActionText}>Keep Editing</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowPreview(false)
                    setActiveTab('send')
                  }}
                  style={[styles.previewActionButton, styles.previewActionButtonPrimary]}
                >
                  <Text style={[styles.previewActionText, styles.previewActionTextPrimary]}>
                    Perfect! 🚀
                  </Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        )}
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
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
  },
  photoPlaceholder: {
    fontSize: 48,
    marginBottom: 10,
  },
  photoText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  helpText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 16,
  },
  stickerContainer: {
    position: 'absolute',
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  overlayEmoji: {
    fontSize: 32,
    textAlign: 'center',
  },
  overlayText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scaleHandle: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawingContainer: {
    ...StyleSheet.absoluteFillObject,
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
    borderRadius: 15,
    gap: 6,
  },
  activeTab: {
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
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
    height: 240,
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
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  stickerEmoji: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  addTextButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  addTextGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
    gap: 10,
  },
  addTextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  textStats: {
    alignItems: 'center',
  },
  statsText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '500',
  },
  drawContainer: {
    flex: 1,
  },
  drawControls: {
    gap: 15,
    paddingVertical: 10,
  },
  controlLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  colorPicker: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#4ECDC4',
    borderWidth: 3,
  },
  brushSizes: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    alignItems: 'center',
  },
  brushSize: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedBrush: {
    borderColor: '#4ECDC4',
  },
  drawActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 15,
    gap: 6,
  },
  clearButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  drawStats: {
    alignItems: 'center',
  },
  contactsList: {
    flex: 1,
  },
  previewButton: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  previewGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8,
  },
  previewButtonText: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: '600',
  },
  storyButton: {
    marginBottom: 20,
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
    marginBottom: 15,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  selectedContact: {
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    borderColor: 'rgba(78, 205, 196, 0.4)',
  },
  contactAvatar: {
    fontSize: 18,
    marginRight: 12,
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    textAlign: 'center',
    lineHeight: 35,
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
  textEditorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  textEditorContainer: {
    width: '90%',
    borderRadius: 20,
    padding: 25,
    overflow: 'hidden',
  },
  textEditorTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  textEditorInput: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 20,
    minHeight: 80,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    marginBottom: 20,
  },
  textControls: {
    gap: 15,
    marginBottom: 20,
  },
  sizeControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  sizeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  styleControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  styleButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
  },
  selectedStyleButton: {
    backgroundColor: '#4ECDC4',
  },
  styleButtonText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  selectedStyleButtonText: {
    color: 'white',
  },
  textEditorActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  textActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  textActionPrimary: {
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
  previewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  previewContainer: {
    width: '90%',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    overflow: 'hidden',
  },
  previewTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  previewImage: {
    width: '100%',
    aspectRatio: 0.75,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  previewPlaceholder: {
    fontSize: 64,
    marginBottom: 10,
  },
  previewText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    marginBottom: 15,
  },
  previewStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  previewStatText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  previewActions: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
  },
  previewActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  previewActionButtonPrimary: {
    backgroundColor: '#4ECDC4',
  },
  previewActionText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  previewActionTextPrimary: {
    color: 'white',
  },
})
