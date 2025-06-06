import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Alert,
} from 'react-native'
import { Camera, CameraType, FlashMode, CameraView, useCameraPermissions } from 'expo-camera'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import CameraControls from './CameraControls'
import CaptureButton from './CaptureButton'
import PhotoEditor from './PhotoEditor'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

interface CameraScreenProps {
  onNavigateToChat?: () => void
}

export default function CameraScreen({ onNavigateToChat }: CameraScreenProps) {
  const [type, setType] = useState<CameraType>("back")
  const [flash, setFlash] = useState<FlashMode>("off")
  const [permission, requestPermission] = useCameraPermissions()
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [showPhotoEditor, setShowPhotoEditor] = useState(false)
  const cameraRef = useRef<typeof Camera>(null)
  const scaleAnim = useRef(new Animated.Value(1)).current
  const flashAnim = useRef(new Animated.Value(0)).current

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
            We need access to your camera to take photos and videos
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
    setType(current => current === "back" ? "front" : "back" as any)
  }

  const toggleFlash = () => {
    setFlash(current => current === "off" ? "on" : "off" as any)
  }

  const takePicture = async () => {
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

    // Flash animation
    Animated.sequence([
      Animated.timing(flashAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(flashAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start()

    // Simulate photo capture
    setTimeout(() => {
      const mockPhotoUri = `photo_${Date.now()}.jpg`
      setCapturedPhoto(mockPhotoUri)
      setShowPhotoEditor(true)
    }, 300)
  }

  const handleClosePhotoEditor = () => {
    setShowPhotoEditor(false)
    setCapturedPhoto(null)
  }

  const handlePostPhoto = (options: any) => {
    if (options.isStory) {
      Alert.alert('Posted to Story!', 'Your photo has been added to your story.')
    } else {
      Alert.alert('Photo Sent!', `Photo sent to ${options.recipients.length} friend(s).`)
    }

    setShowPhotoEditor(false)
    setCapturedPhoto(null)
  }

  const openGallery = () => {
    // Simulate gallery opening
    Alert.alert('Gallery', 'Gallery feature coming soon!')
  }

  if (showPhotoEditor) {
    return (
      <PhotoEditor
        imageUri={capturedPhoto}
        onClose={handleClosePhotoEditor}
        onPost={handlePostPhoto}
      />
    )
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={type}
        flash={flash}
      >
        {/* Flash Overlay */}
        <Animated.View
          style={[
            styles.flashOverlay,
            { opacity: flashAnim }
          ]}
        />

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
                color={flash === "on" ? "#FFD700" : "white"}
              />
            </TouchableOpacity>

            <View style={styles.cameraMode}>
              <Text style={styles.cameraModeText}>PHOTO</Text>
            </View>

            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="settings" size={22} color="white" />
            </TouchableOpacity>
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
            <TouchableOpacity style={styles.galleryButton} onPress={openGallery}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.galleryGradient}
              >
                <Ionicons name="images" size={24} color="white" />
              </LinearGradient>
              <Text style={styles.galleryText}>Gallery</Text>
            </TouchableOpacity>

            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <CaptureButton onPress={takePicture} />
            </Animated.View>

            <TouchableOpacity style={styles.modeButton}>
              <LinearGradient
                colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                style={styles.modeGradient}
              >
                <Ionicons name="videocam" size={20} color="white" />
                <Text style={styles.modeText}>VIDEO</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsRow}>
            <TouchableOpacity style={styles.quickAction} onPress={onNavigateToChat}>
              <BlurView intensity={30} tint="dark" style={styles.quickActionBlur}>
                <Ionicons name="chatbubbles" size={18} color="white" />
                <Text style={styles.quickActionText}>Chats</Text>
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAction}>
              <BlurView intensity={30} tint="dark" style={styles.quickActionBlur}>
                <Ionicons name="scan" size={18} color="white" />
                <Text style={styles.quickActionText}>Scan</Text>
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAction}>
              <BlurView intensity={30} tint="dark" style={styles.quickActionBlur}>
                <Ionicons name="location" size={18} color="white" />
                <Text style={styles.quickActionText}>Map</Text>
              </BlurView>
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
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
    zIndex: 1000,
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
  cameraMode: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  cameraModeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
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
    marginBottom: 20,
  },
  galleryButton: {
    alignItems: 'center',
  },
  galleryGradient: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  galleryText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  modeButton: {
    alignItems: 'center',
    borderRadius: 15,
    overflow: 'hidden',
  },
  modeGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    gap: 4,
  },
  modeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  quickAction: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  quickActionBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  quickActionText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
})
