import React, { useState } from 'react'
import {
  View,
  Text,
  Alert,
} from 'react-native'
import Clipboard from '@react-native-clipboard/clipboard'
import "./global.css"


export default function App() {
  const copyToClipboard = (item: PasswordEntry) => {
    Clipboard.setString(item.password) // Copy password to clipboard
    Alert.alert('Copied to Clipboard', item.password)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Example</Text>
    </View>
  )
}

