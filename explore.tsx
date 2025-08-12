
import { StyleSheet } from 'react-native';
import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: colors.primary, dark: colors.surface }}
      headerImage={
        <IconSymbol
          size={310}
          color={colors.secondary}
          name="waveform"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={{ color: colors.primary }}>
          About AyaSync
        </ThemedText>
      </ThemedView>
      
      <ThemedText style={{ color: colors.text }}>
        AyaSync is your voice-first personal organizer that helps you manage your life through natural conversation.
      </ThemedText>

      <Collapsible title="🎙️ Voice Commands">
        <ThemedText>
          Talk naturally to AyaSync:
          {'\n\n'}• "Add meeting tomorrow at 2pm"
          {'\n'}• "What's my schedule today?"
          {'\n'}• "Create a shopping list"
          {'\n'}• "Set reminder for gym at 6pm"
          {'\n'}• "Mark task as complete"
        </ThemedText>
      </Collapsible>

      <Collapsible title="📅 Smart Calendar">
        <ThemedText>
          Natural language event creation:
          {'\n\n'}• Automatically parses dates and times
          {'\n'}• Integrates with Google Calendar and Apple Calendar
          {'\n'}• Voice confirmations for all actions
          {'\n'}• Smart conflict detection
        </ThemedText>
      </Collapsible>

      <Collapsible title="✅ Intelligent Tasks">
        <ThemedText>
          Task management made simple:
          {'\n\n'}• Voice-to-task conversion
          {'\n'}• Priority detection
          {'\n'}• Due date reminders
          {'\n'}• Progress tracking
        </ThemedText>
      </Collapsible>

      <Collapsible title="🔔 Smart Notifications">
        <ThemedText>
          Stay in sync with your life:
          {'\n\n'}• Contextual reminders
          {'\n'}• Voice-powered updates
          {'\n'}• Location-based alerts
          {'\n'}• Intelligent scheduling suggestions
        </ThemedText>
      </Collapsible>

      <Collapsible title="🎯 Privacy & Offline">
        <ThemedText>
          Your data stays secure:
          {'\n\n'}• Local voice processing when possible
          {'\n'}• Offline task management
          {'\n'}• Encrypted data storage
          {'\n'}• No unnecessary data collection
        </ThemedText>
      </Collapsible>

      <ThemedView style={styles.footer}>
        <ThemedText style={[styles.footerText, { color: colors.icon }]}>
          Made with ❤️ for productivity enthusiasts
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    marginTop: 30,
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
