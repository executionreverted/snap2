import React, { useState } from 'react'
import {
  View,
  StatusBar,
} from 'react-native'
import CameraScreen from './components/CameraScreen'
import ChatScreen from './components/ChatScreen'
import StoriesScreen from './components/StoriesScreen'
import BottomNavigation from './components/BottomNavigation'
import CustomStatusBar from './components/StatusBar'
import "./global.css"

export default function App() {
  const [activeScreen, setActiveScreen] = useState<'stories' | 'camera' | 'chat'>('camera')

  const renderScreen = () => {
    switch (activeScreen) {
      case 'stories':
        return <StoriesScreen />
      case 'camera':
        return <CameraScreen />
      case 'chat':
        return <ChatScreen />
      default:
        return <CameraScreen />
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <CustomStatusBar />
      {renderScreen()}
      <BottomNavigation
        activeScreen={activeScreen}
        onScreenChange={setActiveScreen}
      />
    </View>
  )
}
