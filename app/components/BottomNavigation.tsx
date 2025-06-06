import React from 'react'
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'

const { width: screenWidth } = Dimensions.get('window')

interface BottomNavigationProps {
  activeScreen: 'stories' | 'camera' | 'chat'
  onScreenChange: (screen: 'stories' | 'camera' | 'chat') => void
}

export default function BottomNavigation({ activeScreen, onScreenChange }: BottomNavigationProps) {
  const getIconColor = (screen: string) => {
    return activeScreen === screen ? 'white' : 'rgba(255, 255, 255, 0.6)'
  }

  const getIconSize = (screen: string) => {
    return activeScreen === screen ? 32 : 28
  }

  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="dark" style={styles.navigationContainer}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
          style={styles.gradient}
        >
          <TouchableOpacity
            style={[styles.navButton, activeScreen === 'stories' && styles.activeButton]}
            onPress={() => onScreenChange('stories')}
          >
            {activeScreen === 'stories' && (
              <View style={styles.activeIndicator} />
            )}
            <Ionicons
              name="library"
              size={getIconSize('stories')}
              color={getIconColor('stories')}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, styles.centerButton, activeScreen === 'camera' && styles.activeButton]}
            onPress={() => onScreenChange('camera')}
          >
            {activeScreen === 'camera' && (
              <LinearGradient
                colors={['#FF6B6B', '#4ECDC4']}
                style={styles.cameraActiveIndicator}
              />
            )}
            <Ionicons
              name="camera"
              size={getIconSize('camera')}
              color={getIconColor('camera')}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, activeScreen === 'chat' && styles.activeButton]}
            onPress={() => onScreenChange('chat')}
          >
            {activeScreen === 'chat' && (
              <View style={styles.activeIndicator} />
            )}
            <Ionicons
              name="chatbubbles"
              size={getIconSize('chat')}
              color={getIconColor('chat')}
            />
          </TouchableOpacity>
        </LinearGradient>
      </BlurView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    borderRadius: 25,
    overflow: 'hidden',
  },
  navigationContainer: {
    overflow: 'hidden',
    borderRadius: 25,
  },
  gradient: {
    flexDirection: 'row',
    paddingVertical: 18,
    paddingHorizontal: 15,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  navButton: {
    padding: 14,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minWidth: 56,
    minHeight: 56,
  },
  centerButton: {
    padding: 16,
    minWidth: 60,
    minHeight: 60,
  },
  activeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -4,
    left: '80%',
    marginLeft: -20,
    width: "150%",
    height: 0,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  cameraActiveIndicator: {
    position: 'absolute',
    bottom: -4,
    left: '100%',
    marginLeft: -25,
    width: "150%",
    height: 0,
    borderRadius: 2,
  },
})
