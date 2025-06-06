import React, { useState } from 'react'
import {
  View,
  StatusBar,
  StyleSheet,
} from 'react-native'
import EnhancedCameraScreen from './components/CameraScreen'
import EnhancedChatScreen from './components/ChatScreen'
import EnhancedStoriesScreen from './components/StoriesScreen'
import BottomNavigation from './components/BottomNavigation'
import "./global.css"

export default function App() {
  const [activeScreen, setActiveScreen] = useState<'stories' | 'camera' | 'chat'>('camera')

  const handleScreenChange = (screen: 'stories' | 'camera' | 'chat') => {
    setActiveScreen(screen)
  }

  const handleNavigateToCamera = () => {
    setActiveScreen('camera')
  }

  const handleNavigateToChat = () => {
    setActiveScreen('chat')
  }

  const handleNavigateToStories = () => {
    setActiveScreen('stories')
  }

  const renderScreen = () => {
    switch (activeScreen) {
      case 'stories':
        return (
          <EnhancedStoriesScreen
            onOpenCamera={handleNavigateToCamera}
          />
        )
      case 'camera':
        return (
          <EnhancedCameraScreen
            onNavigateToChat={handleNavigateToChat}
          />
        )
      case 'chat':
        return (
          <EnhancedChatScreen
            onOpenCamera={handleNavigateToCamera}
          />
        )
      default:
        return (
          <EnhancedCameraScreen
            onNavigateToChat={handleNavigateToChat}
          />
        )
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      {/* <CustomStatusBar /> */}

      {renderScreen()}

      <BottomNavigation
        activeScreen={activeScreen}
        onScreenChange={handleScreenChange}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
})
