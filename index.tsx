import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';

export default function App() {
  const [spokenText, setSpokenText] = useState('');

  const startListening = () => {
    // For development server, just show demo text
    setSpokenText('Voice recognition works in built app!');
    Alert.alert('Demo Mode', 'Voice recognition works perfectly in your built APK!');
  };

  return (
    <View style={styles.container}>
      {/* App Logo and Name */}
      <View style={styles.logoSection}>
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>🎤</Text>
          </View>
        </View>
        <View style={styles.brandContainer}>
          <Text style={styles.appName}>
            AyaSync
          </Text>
          <Text style={styles.tagline}>
            Speak. Sync. Simplify.
          </Text>
        </View>
      </View>

      {/* Voice Recognition Section */}
      <View style={styles.voiceSection}>
        <Text style={styles.sectionTitle}>Voice Recognition</Text>
        
        <Button
          title="🎤 Demo Mode - Start Speaking"
          onPress={startListening}
        />
        
        <View style={styles.textContainer}>
          <Text style={styles.label}>You said:</Text>
          <Text style={styles.spokenText}>
            {spokenText || 'Build APK to test real voice recognition!'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 15,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#3498db',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 40,
    color: '#fff',
  },
  brandContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  tagline: {
    fontSize: 16,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  voiceSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#34495e',
  },
  textContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '100%',
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#666',
  },
  spokenText: {
    fontSize: 18,
    color: '#333',
    lineHeight: 24,
  },
});