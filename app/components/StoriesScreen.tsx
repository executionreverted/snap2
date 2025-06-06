import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import StoryViewer from './StoryViewer'

const { width: screenWidth } = Dimensions.get('window')

interface Story {
  id: string
  username: string
  avatar: string
  content: string
  timestamp: Date
  isViewed: boolean
  isYours: boolean
}

interface Discover {
  id: string
  title: string
  category: string
  thumbnail: string
  views: string
}

const mockStories: Story[] = [
  {
    id: '0',
    username: 'Your Story',
    avatar: '📸',
    content: '🌅',
    timestamp: new Date(Date.now() - 3600000),
    isViewed: false,
    isYours: true
  },
  {
    id: '1',
    username: 'sarah_j',
    avatar: '👩‍🦱',
    content: '🏖️',
    timestamp: new Date(Date.now() - 1800000),
    isViewed: false,
    isYours: false
  },
  {
    id: '2',
    username: 'mike_dev',
    avatar: '👨‍💻',
    content: '☕',
    timestamp: new Date(Date.now() - 7200000),
    isViewed: true,
    isYours: false
  },
  {
    id: '3',
    username: 'emma_art',
    avatar: '👩‍🎨',
    content: '🎨',
    timestamp: new Date(Date.now() - 5400000),
    isViewed: false,
    isYours: false
  },
  {
    id: '4',
    username: 'alex_space',
    avatar: '👨‍🚀',
    content: '🚀',
    timestamp: new Date(Date.now() - 10800000),
    isViewed: true,
    isYours: false
  },
  {
    id: '5',
    username: 'luna_music',
    avatar: '👩‍🎤',
    content: '🎵',
    timestamp: new Date(Date.now() - 14400000),
    isViewed: false,
    isYours: false
  },
]

const mockDiscover: Discover[] = [
  { id: '1', title: 'Street Art Tour', category: 'Travel', thumbnail: '🎨', views: '12K' },
  { id: '2', title: 'Morning Workout', category: 'Fitness', thumbnail: '💪', views: '8.5K' },
  { id: '3', title: 'Cooking Tips', category: 'Food', thumbnail: '👨‍🍳', views: '15K' },
  { id: '4', title: 'City Night Life', category: 'Lifestyle', thumbnail: '🌃', views: '22K' },
  { id: '5', title: 'Tech Reviews', category: 'Technology', thumbnail: '📱', views: '18K' },
  { id: '6', title: 'Music Festival', category: 'Entertainment', thumbnail: '🎵', views: '25K' },
]

interface StoriesScreenProps {
  onOpenCamera?: () => void
}

export default function StoriesScreen({ onOpenCamera }: StoriesScreenProps) {
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null)
  const [showStoryViewer, setShowStoryViewer] = useState(false)

  const handleStoryPress = (story: Story, index: number) => {
    if (story.isYours) {
      onOpenCamera?.()
      return
    }
    setSelectedStoryIndex(index)
    setShowStoryViewer(true)
  }

  const handleCloseStoryViewer = () => {
    setShowStoryViewer(false)
    setSelectedStoryIndex(null)
  }

  const handleReplyToStory = (storyId: string, message: string) => {
    console.log(`Reply to story ${storyId}: ${message}`)
    // Handle reply logic here
  }

  const renderStoryItem = (story: Story, index: number) => (
    <TouchableOpacity
      key={story.id}
      style={styles.storyItem}
      onPress={() => handleStoryPress(story, index)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={story.isYours
          ? ['#FF6B6B', '#4ECDC4']
          : story.isViewed
            ? ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']
            : ['#f093fb', '#f5576c', '#4facfe']
        }
        style={styles.storyGradient}
      >
        <View style={[styles.storyAvatar, story.isViewed && !story.isYours && styles.viewedStory]}>
          <Text style={styles.storyEmoji}>{story.avatar}</Text>
          {story.isYours && (
            <View style={styles.addButton}>
              <Ionicons name="add" size={16} color="white" />
            </View>
          )}
        </View>
      </LinearGradient>
      <Text style={styles.storyUsername} numberOfLines={1}>
        {story.username}
      </Text>
    </TouchableOpacity>
  )

  const renderDiscoverItem = (item: Discover) => (
    <TouchableOpacity key={item.id} style={styles.discoverItem} activeOpacity={0.8}>
      <BlurView intensity={40} tint="light" style={styles.discoverBlur}>
        <View style={styles.discoverContent}>
          <View style={styles.discoverThumbnailContainer}>
            <Text style={styles.discoverThumbnail}>{item.thumbnail}</Text>
          </View>
          <View style={styles.discoverInfo}>
            <Text style={styles.discoverTitle}>{item.title}</Text>
            <View style={styles.discoverMeta}>
              <Text style={styles.discoverCategory}>{item.category}</Text>
              <Text style={styles.discoverViews}>{item.views} views</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.discoverAction}>
            <Ionicons name="play-circle" size={24} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>
      </BlurView>
    </TouchableOpacity>
  )

  if (showStoryViewer && selectedStoryIndex !== null) {
    return (
      <StoryViewer
        stories={mockStories.filter(s => !s.isYours)}
        initialIndex={selectedStoryIndex - 1} // Subtract 1 to account for "Your Story"
        onClose={handleCloseStoryViewer}
        onReply={handleReplyToStory}
      />
    )
  }

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      style={styles.container}
    >
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <BlurView intensity={20} tint="light" style={styles.headerBlur}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Stories</Text>
              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.headerButton}>
                  <Ionicons name="search" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerButton} onPress={onOpenCamera}>
                  <Ionicons name="camera" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </View>

        <View style={styles.storiesSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storiesContainer}
          >
            {mockStories.map(renderStoryItem)}
          </ScrollView>
        </View>

        <View style={styles.discoverSection}>
          <BlurView intensity={20} tint="light" style={styles.sectionHeaderBlur}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Discover</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
          </BlurView>

          <View style={styles.discoverList}>
            {mockDiscover.map(renderDiscoverItem)}
          </View>
        </View>

        {/* Featured Content */}
        <View style={styles.featuredSection}>
          <BlurView intensity={20} tint="light" style={styles.sectionHeaderBlur}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured</Text>
              <TouchableOpacity>
                <Ionicons name="star" size={20} color="#FFD700" />
              </TouchableOpacity>
            </View>
          </BlurView>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredContainer}
          >
            {['🎬', '🎮', '🎵', '🏆', '🌍'].map((emoji, index) => (
              <TouchableOpacity key={index} style={styles.featuredItem}>
                <BlurView intensity={30} tint="light" style={styles.featuredBlur}>
                  <Text style={styles.featuredEmoji}>{emoji}</Text>
                  <Text style={styles.featuredText}>Featured {index + 1}</Text>
                </BlurView>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
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
  storiesSection: {
    marginBottom: 30,
  },
  storiesContainer: {
    paddingHorizontal: 20,
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 15,
    width: 80,
  },
  storyGradient: {
    padding: 3,
    borderRadius: 35,
    marginBottom: 8,
  },
  storyAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  viewedStory: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  storyEmoji: {
    fontSize: 24,
  },
  addButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  storyUsername: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
    textAlign: 'center',
  },
  discoverSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeaderBlur: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  seeAllText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  discoverList: {
    gap: 12,
  },
  discoverItem: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  discoverBlur: {
    overflow: 'hidden',
  },
  discoverContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  discoverThumbnailContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  discoverThumbnail: {
    fontSize: 20,
  },
  discoverInfo: {
    flex: 1,
  },
  discoverTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  discoverMeta: {
    flexDirection: 'row',
    gap: 10,
  },
  discoverCategory: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  discoverViews: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  discoverAction: {
    padding: 8,
  },
  featuredSection: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  featuredContainer: {
    paddingVertical: 10,
  },
  featuredItem: {
    marginRight: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  featuredBlur: {
    width: 120,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  featuredText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
})
