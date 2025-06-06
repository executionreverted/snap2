import React from 'react'
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { CameraType } from 'expo-camera'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'

interface CameraControlsProps {
  onFlipCamera: () => void
  currentType: CameraType
}

export default function CameraControls({ onFlipCamera, currentType }: CameraControlsProps) {
  return (
    <View style={styles.container}>
      <BlurView intensity={20} tint="dark" style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={onFlipCamera}
        >
          <Ionicons
            name="camera-reverse"
            size={28}
            color="white"
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton}>
          <Ionicons
            name="happy"
            size={26}
            color="white"
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton}>
          <Ionicons
            name="color-filter"
            size={26}
            color="white"
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton}>
          <Ionicons
            name="musical-notes"
            size={26}
            color="white"
          />
        </TouchableOpacity>
      </BlurView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 15,
    top: '35%',
    transform: [{ translateY: -100 }],
  },
  controlsContainer: {
    paddingVertical: 15,
    paddingHorizontal: 12,
    borderRadius: 25,
    overflow: 'hidden',
  },
  controlButton: {
    padding: 12,
    marginVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
