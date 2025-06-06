import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function StatusBar() {
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })

  return (
    <View style={styles.container}>
      <Text style={styles.timeText}>{currentTime}</Text>
      <View style={styles.rightSection}>
        <View style={styles.signalContainer}>
          <View style={styles.signalBar} />
          <View style={styles.signalBar} />
          <View style={styles.signalBar} />
          <View style={[styles.signalBar, styles.weakSignal]} />
        </View>
        <Text style={styles.batteryText}>100%</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 50,
  },
  timeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  signalBar: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'white',
    marginRight: 2,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 1,
  },
  weakSignal: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  batteryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
})
