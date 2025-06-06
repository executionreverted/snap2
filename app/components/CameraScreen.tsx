import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native'
import { Camera, CameraType, FlashMode, CameraView, useCameraPermissions } from 'expo-camera'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import CameraControls from './CameraControls'
import CaptureButton from './CaptureButton'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

export default function CameraScreen() {
  const [type, setType] = useState<CameraType>("back")
  const [flash, setFlash] = useState<FlashMode>("off")
  const [permission, requestPermission] = useCameraPermissions()
  const cameraRef = useRef<typeof Camera>(null)
  const scaleAnim = useRef(new Animated.Value(1)).current

  if (!permission) {
    return <View style={styles.container} />
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.permissionGradient}
        >
          <Ionicons name="camera" size={80} color="white" />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            We need access to your camera to take photos
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    )
  }

  const toggleCameraType = () => {
    setType(current =>
      current === "back" ? "front" : "back" as any
    )
  }

  const toggleFlash = () => {
    setFlash(current =>
      current === "off" ? "on" : "off" as any
    )
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      // Animate capture button
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start()

      // Take photo logic would go here
      console.log('Taking picture...')
    }
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={type}
        flash={flash}
      >
        {/* Top Controls */}
        <View style={styles.topControls}>
          <BlurView intensity={20} tint="dark" style={styles.topBlur}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleFlash}
            >
              <Ionicons
                name={flash === "on" ? 'flash' : 'flash-off'}
                size={24}
                color="white"
              />
            </TouchableOpacity>
            <View style={styles.timerContainer}>
              <Ionicons name="timer" size={20} color="white" />
              <Text style={styles.timerText}>3s</Text>
            </View>
          </BlurView>
        </View>

        {/* Side Controls */}
        <CameraControls
          onFlipCamera={toggleCameraType}
          currentType={type}
        />

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <View style={styles.captureContainer}>
            <TouchableOpacity style={styles.galleryButton}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.galleryGradient}
              >
                <Ionicons name="images" size={24} color="white" />
              </LinearGradient>
            </TouchableOpacity>

            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <CaptureButton onPress={takePicture} />
            </Animated.View>

            <TouchableOpacity style={styles.modeButton}>
              <Text style={styles.modeText}>VIDEO</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  permissionContainer: {
    flex: 1,
  },
  permissionGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  topControls: {
    paddingTop: 45,
    paddingHorizontal: 20,
  },
  topBlur: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    overflow: 'hidden',
  },
  controlButton: {
    padding: 8,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerText: {
    color: 'white',
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '600',
  },
  bottomControls: {
    paddingBottom: 160,
    paddingHorizontal: 20,
  },
  captureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 15,
    overflow: 'hidden',
  },
  galleryGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  modeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
})
