import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

interface ImagePickerProps {
  visible: boolean
  onClose: () => void
  onImageSelect: (imageUri: string) => void
}

interface GalleryImage {
  id: string
  uri: string
  thumbnail: string
  type: 'photo' | 'video'
  duration?: number
}

// Mock gallery images
const mockGalleryImages: GalleryImage[] = [
  { id: '1', uri: 'image1.jpg', thumbnail: '🏖️', type: 'photo' },
  { id: '2', uri: 'image2.jpg', thumbnail: '🌅', type: 'photo' },
  { id: '3', uri: 'video1.mp4', thumbnail: '🎥', type: 'video', duration: 15 },
  { id: '4', uri: 'image3.jpg', thumbnail: '🎨', type: 'photo' },
  { id: '5', uri: 'image4.jpg', thumbnail: '🌸', type: 'photo' },
  { id: '6', uri: 'video2.mp4', thumbnail: '🎬', type: 'video', duration: 30 },
  { id: '7', uri: 'image5.jpg', thumbnail: '🌊', type: 'photo' },
  { id: '8', uri: 'image6.jpg', thumbnail: '🏔️', type: 'photo' },
  { id: '9', uri: 'image7.jpg', thumbnail: '🌺', type: 'photo' },
  { id: '10', uri: 'video3.mp4', thumbnail: '📹', type: 'video', duration: 45 },
  { id: '11', uri: 'image8.jpg', thumbnail: '🌙', type: 'photo' },
  { id: '12', uri: 'image9.jpg', thumbnail: '⭐', type: 'photo' },
]

export default function ImagePicker({ visible, onClose, onImageSelect }: ImagePickerProps) {
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'recent' | 'camera' | 'videos'>('recent')
  const slideAnim = useRef(new Animated.Value(screenHeight)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
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
    } else {
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
      ]).start()
    }
  }, [visible])

  const handleImagePress = (image: GalleryImage) => {
    if (selectedImages.includes(image.id)) {
      setSelectedImages(prev => prev.filter(id => id !== image.id))
    } else {
      if (selectedImages.length < 10) { // Max 10 images
        setSelectedImages(prev => [...prev, image.id])
      }
    }
  }

  const handleSendSelected = () => {
    if (selectedImages.length > 0) {
      // For demo, just select the first image
      const firstSelectedImage = mockGalleryImages.find(img => img.id === selectedImages[0])
      if (firstSelectedImage) {
        onImageSelect(firstSelectedImage.uri)
      }
    }
  }

  const getFilteredImages = () => {
    switch (activeTab) {
      case 'videos':
        return mockGalleryImages.filter(img => img.type === 'video')
      case 'camera':
        return mockGalleryImages.filter(img => img.type === 'photo').slice(0, 6)
      default:
        return mockGalleryImages
    }
  }

  const renderImageItem = (image: GalleryImage) => {
    const isSelected = selectedImages.includes(image.id)
    const selectionIndex = selectedImages.indexOf(image.id) + 1

    return (
      <TouchableOpacity
        key={image.id}
        style={[
          styles.imageItem,
          isSelected && styles.selectedImageItem
        ]}
        onPress={() => handleImagePress(image)}
        activeOpacity={0.8}
      >
        <View style={styles.imageContainer}>
          <Text style={styles.imageThumbnail}>{image.thumbnail}</Text>

          {image.type === 'video' && (
            <>
              <View style={styles.videoOverlay}>
                <Ionicons name="play" size={20} color="white" />
              </View>
              <View style={styles.videoDuration}>
                <Text style={styles.videoDurationText}>{image.duration}s</Text>
              </View>
            </>
          )}

          {isSelected && (
            <View style={styles.selectionOverlay}>
              <View style={styles.selectionNumber}>
                <Text style={styles.selectionNumberText}>{selectionIndex}</Text>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    )
  }

  if (!visible) return null

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
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Gallery</Text>

          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="camera" size={20} color="white" />
          </TouchableOpacity>
        </BlurView>

        {/* Tabs */}
        <BlurView intensity={20} tint="dark" style={styles.tabsContainer}>
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'recent' && styles.activeTab]}
              onPress={() => setActiveTab('recent')}
            >
              <Ionicons
                name="time"
                size={18}
                color={activeTab === 'recent' ? '#4ECDC4' : 'rgba(255,255,255,0.6)'}
              />
              <Text style={[
                styles.tabText,
                activeTab === 'recent' && styles.activeTabText
              ]}>
                Recent
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'camera' && styles.activeTab]}
              onPress={() => setActiveTab('camera')}
            >
              <Ionicons
                name="camera"
                size={18}
                color={activeTab === 'camera' ? '#4ECDC4' : 'rgba(255,255,255,0.6)'}
              />
              <Text style={[
                styles.tabText,
                activeTab === 'camera' && styles.activeTabText
              ]}>
                Camera
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'videos' && styles.activeTab]}
              onPress={() => setActiveTab('videos')}
            >
              <Ionicons
                name="videocam"
                size={18}
                color={activeTab === 'videos' ? '#4ECDC4' : 'rgba(255,255,255,0.6)'}
              />
              <Text style={[
                styles.tabText,
                activeTab === 'videos' && styles.activeTabText
              ]}>
                Videos
              </Text>
            </TouchableOpacity>
          </View>
        </BlurView>

        {/* Gallery Grid */}
        <ScrollView
          style={styles.galleryContainer}
          contentContainerStyle={styles.galleryContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.galleryGrid}>
            {getFilteredImages().map(renderImageItem)}
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        {selectedImages.length > 0 && (
          <BlurView intensity={40} tint="dark" style={styles.bottomActions}>
            <View style={styles.selectionInfo}>
              <Text style={styles.selectionText}>
                {selectedImages.length} selected
              </Text>
            </View>

            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendSelected}
            >
              <LinearGradient
                colors={['#4ECDC4', '#45B7D1']}
                style={styles.sendGradient}
              >
                <Ionicons name="send" size={18} color="white" />
                <Text style={styles.sendButtonText}>Send</Text>
              </LinearGradient>
            </TouchableOpacity>
          </BlurView>
        )}
      </LinearGradient>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 4000,
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
  tabsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 16,
    gap: 6,
  },
  activeTab: {
    backgroundColor: 'rgba(78, 205, 196, 0.3)',
  },
  tabText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4ECDC4',
  },
  galleryContainer: {
    flex: 1,
  },
  galleryContent: {
    padding: 20,
    paddingBottom: 100,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  imageItem: {
    width: (screenWidth - 50) / 3,
    height: (screenWidth - 50) / 3,
    marginBottom: 5,
    borderRadius: 10,
    overflow: 'hidden',
  },
  selectedImageItem: {
    borderWidth: 3,
    borderColor: '#4ECDC4',
  },
  imageContainer: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  imageThumbnail: {
    fontSize: 32,
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },
  videoDuration: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  videoDurationText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  selectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(78, 205, 196, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: 40,
  },
  selectionInfo: {
    flex: 1,
  },
  selectionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  sendButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  sendGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
})
