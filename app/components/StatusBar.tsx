import React from 'react'
import { View, Text } from 'react-native'

export default function StatusBar() {
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })

  return (
    <View className="absolute top-12 left-6 right-6 flex-row justify-between items-center z-50">
      <Text className="text-white font-semibold">{currentTime}</Text>
      <View className="flex-row items-center space-x-1">
        <View className="w-1 h-1 bg-white rounded-full" />
        <View className="w-1 h-1 bg-white rounded-full" />
        <View className="w-1 h-1 bg-white rounded-full" />
        <View className="w-1 h-1 bg-white/50 rounded-full" />
        <Text className="text-white text-sm ml-1">100%</Text>
      </View>
    </View>
  )
}
