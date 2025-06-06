import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Switch,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

interface CameraSettingsProps {
  visible: boolean
  onClose: () => void
  onSettingChange: (setting: string, value: any) => void
}

interface Setting {
  id: string
  title: string
  description: string
  type: 'toggle' | 'option'
  value: boolean | string
  options?: string[]
  icon: string
}

const defaultSettings: Setting[] = [
  {
    id: 'grid',
    title: 'Grid Lines',
    description: 'Show grid lines for better composition',
    type: 'toggle',
    value: false,
    icon: 'grid'
  },
  {
    id: 'timer',
    title: 'Timer',
    description: 'Set a countdown timer before capture',
    type: 'option',
    value: 'Off',
    options: ['Off', '3s', '5s', '10s'],
    icon: 'timer'
  },
  {
    id: 'quality',
    title: 'Photo Quality',
    description: 'Choose photo resolution',
    type: 'option',
    value: 'High',
    options: ['Low', 'Medium', 'High'],
    icon: 'camera'
  },
  {
    id: 'sound',
    title: 'Camera Sound',
    description: 'Play sound when taking photos',
    type: 'toggle',
    value: true,
    icon: 'volume-high'
  },
  {
    id: 'location',
    title: 'Save Location',
    description: 'Add location data to photos',
    type: 'toggle',
    value: false,
    icon: 'location'
  },
  {
    id: 'watermark',
    title: 'Watermark',
    description: 'Add app watermark to photos',
    type: 'toggle',
    value: false,
    icon: 'text'
  }
]

export default function CameraSettings({ visible, onClose, onSettingChange }: CameraSettingsProps) {
  const [settings, setSettings] = useState(defaultSettings)
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

  const handleToggleSetting = (settingId: string) => {
    setSettings(prev => prev.map(setting => {
      if (setting.id === settingId && setting.type === 'toggle') {
        const newValue = !setting.value as boolean
        onSettingChange(settingId, newValue)
        return { ...setting, value: newValue }
      }
      return setting
    }))
  }

  const handleOptionSetting = (settingId: string, optionIndex: number) => {
    setSettings(prev => prev.map(setting => {
      if (setting.id === settingId && setting.type === 'option' && setting.options) {
        const newValue = setting.options[optionIndex]
        onSettingChange(settingId, newValue)
        return { ...setting, value: newValue }
      }
      return setting
    }))
  }

  const renderSetting = (setting: Setting) => {
    if (setting.type === 'toggle') {
      return (
        <TouchableOpacity
          key={setting.id}
          style={styles.settingItem}
          onPress={() => handleToggleSetting(setting.id)}
          activeOpacity={0.8}
        >
          <BlurView intensity={30} tint="light" style={styles.settingBlur}>
            <View style={styles.settingContent}>
              <View style={styles.settingIcon}>
                <Ionicons name={setting.icon as any} size={20} color="white" />
              </View>

              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{setting.title}</Text>
                <Text style={styles.settingDescription}>{setting.description}</Text>
              </View>

              <Switch
                value={setting.value as boolean}
                onValueChange={() => handleToggleSetting(setting.id)}
                thumbColor={setting.value ? '#4ECDC4' : '#f4f3f4'}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
              />
            </View>
          </BlurView>
        </TouchableOpacity>
      )
    }

    if (setting.type === 'option' && setting.options) {
      return (
        <View key={setting.id} style={styles.settingItem}>
          <BlurView intensity={30} tint="light" style={styles.settingBlur}>
            <View style={styles.settingContent}>
              <View style={styles.settingIcon}>
                <Ionicons name={setting.icon as any} size={20} color="white" />
              </View>

              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{setting.title}</Text>
                <Text style={styles.settingDescription}>{setting.description}</Text>
              </View>
            </View>

            <View style={styles.optionsContainer}>
              {setting.options.map((option, index) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    setting.value === option && styles.selectedOption
                  ]}
                  onPress={() => handleOptionSetting(setting.id, index)}
                >
                  <Text style={[
                    styles.optionText,
                    setting.value === option && styles.selectedOptionText
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </BlurView>
        </View>
      )
    }

    return null
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
            <Ionicons name="chevron-down" size={24} color="white" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Camera Settings</Text>

          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="refresh" size={20} color="white" />
          </TouchableOpacity>
        </BlurView>

        {/* Settings List */}
        <View style={styles.settingsList}>
          {settings.map(renderSetting)}
        </View>

        {/* Advanced Settings */}
        <View style={styles.advancedSection}>
          <BlurView intensity={20} tint="light" style={styles.advancedBlur}>
            <View style={styles.advancedHeader}>
              <Text style={styles.advancedTitle}>Advanced</Text>
            </View>

            <TouchableOpacity style={styles.advancedItem}>
              <Ionicons name="settings" size={18} color="rgba(255,255,255,0.8)" />
              <Text style={styles.advancedText}>More Camera Settings</Text>
              <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.advancedItem}>
              <Ionicons name="information-circle" size={18} color="rgba(255,255,255,0.8)" />
              <Text style={styles.advancedText}>About Camera</Text>
              <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          </BlurView>
        </View>
      </LinearGradient>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5000,
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
  settingsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  settingItem: {
    marginBottom: 15,
    borderRadius: 20,
    overflow: 'hidden',
  },
  settingBlur: {
    overflow: 'hidden',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  optionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  selectedOption: {
    backgroundColor: '#4ECDC4',
  },
  optionText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: 'white',
    fontWeight: '600',
  },
  advancedSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  advancedBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  advancedHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  advancedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  advancedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  advancedText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
})
