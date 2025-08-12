import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import * as Calendar from 'expo-calendar';
import chrono from 'chrono-node';
import { ExpoSpeechRecognitionModule as SpeechRecognition } from 'expo-speech-recognition';

export default function VoiceAppointment() {
  const [listening, setListening] = useState<boolean>(false);
  const [spokenText, setSpokenText] = useState<string>('');

  useEffect(() => {
    const resultListener = SpeechRecognition.addListener('result', (e: any) => {
      const transcript: string = e.results?.[0]?.[0]?.transcript || '';
      setSpokenText(transcript);
    });
    const endListener = SpeechRecognition.addListener('end', () => setListening(false));
    const errorListener = SpeechRecognition.addListener('error', (e: any) => {
      setListening(false);
      Alert.alert('Speech error', e?.message || 'Unknown error');
    });
    return () => {
      resultListener.remove();
      endListener.remove();
      errorListener.remove();
    };
  }, []);

  async function startListening() {
    const { granted } = await SpeechRecognition.requestPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission denied', 'Microphone permission is required');
      return;
    }
    setSpokenText('');
    setListening(true);
    SpeechRecognition.start({ lang: 'en-US', interimResults: false, continuous: false });
  }

  async function saveAppointment() {
    if (!spokenText.trim()) {
      Alert.alert('Please say something like', '"Appointment at 2pm Thursday for 30 minutes"');
      return;
    }
    const results = chrono.parse(spokenText, new Date(), { forwardDate: true });
    if (!results.length) {
      Alert.alert("Couldn't parse date/time from:", spokenText);
      return;
    }
    const { start, end, text } = results[0];
    const startDate: Date = start.date();
    const endDate: Date = end ? end.date() : new Date(startDate.getTime() + 30 * 60000);
    const title: string = spokenText.replace(text, '').trim() || 'Appointment';

    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Calendar permission required');
      return;
    }

    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const calendar = calendars.find(c => c.allowsModifications) || calendars[0];
    if (!calendar) {
      Alert.alert('No writable calendar found');
      return;
    }

    await Calendar.createEventAsync(calendar.id, {
      title,
      startDate,
      endDate,
      notes: `Created via voice: "${spokenText}"`,
    });

    Alert.alert('Appointment saved!', `${title}\n${startDate.toLocaleString()}`);
    setSpokenText('');
  }

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center', gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Tap mic and speak your appointment</Text>
      <Button title={listening ? 'Listening...' : '🎤 Start Speaking'} onPress={startListening} />
      <Text style={{ marginTop: 8 }}>Heard: {spokenText || '...'}</Text>
      <Button title="Save Appointment" onPress={saveAppointment} disabled={!spokenText.trim()} />
    </View>
  );
}
