import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, Alert, Platform, Vibration, Text, Image } from 'react-native';
import * as Speech from 'expo-speech';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

type TodoItem = {
  id: string;
  text: string;
  completed: boolean;
};

type CalendarEvent = {
  id: string;
  title: string;
  time: string;
  date: string;
};

// Enhanced voice processing utilities
const parseDateTime = (command: string) => {
  const timePatterns = [
    /at (\d{1,2}):(\d{2})\s*(am|pm)/i,
    /at (\d{1,2})\s*(am|pm)/i,
    /(\d{1,2}):(\d{2})\s*(am|pm)/i,
    /(\d{1,2})\s*(am|pm)/i
  ];

  const dayPatterns = [
    /next (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
    /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
    /tomorrow/i,
    /today/i
  ];

  let time = '';
  let day = 'Today';

  for (const pattern of timePatterns) {
    const match = command.match(pattern);
    if (match) {
      if (match[3]) { // am/pm format
        time = `${match[1]}${match[2] ? ':' + match[2] : ':00'} ${match[3].toUpperCase()}`;
      }
      break;
    }
  }

  for (const pattern of dayPatterns) {
    const match = command.match(pattern);
    if (match) {
      if (match[0].toLowerCase() === 'tomorrow') {
        day = 'Tomorrow';
      } else if (match[0].toLowerCase() === 'today') {
        day = 'Today';
      } else {
        day = match[1] || match[0];
        day = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
      }
      break;
    }
  }

  return { time, day };
};

const extractTaskFromCommand = (command: string) => {
  const taskPatterns = [
    /add (?:a )?task (?:for |to )?(.+)/i,
    /remind me to (.+)/i,
    /create (?:a )?task (?:for |to )?(.+)/i,
    /task (?:for |to )?(.+)/i
  ];

  for (const pattern of taskPatterns) {
    const match = command.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  return null;
};

const extractEventFromCommand = (command: string) => {
  const eventPatterns = [
    /add (?:a )?(?:meeting|appointment|event) (.+)/i,
    /schedule (?:a )?(?:meeting|appointment|event) (.+)/i,
    /(?:meeting|appointment|event) (?:with |for )?(.+)/i
  ];

  for (const pattern of eventPatterns) {
    const match = command.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  return null;
};

// Voice command shortcuts
const voiceShortcuts = {
  'start focus mode': () => 'Focus mode activated. Notifications silenced for 25 minutes.',
  'show today\'s tasks': () => 'Here are your tasks for today',
  'what\'s my schedule': () => 'Let me read your schedule',
  'quick add task': () => 'Ready to add a task. What would you like to remember?',
  'daily overview': () => 'Here\'s your daily overview'
};

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const processingTimeout = useRef<NodeJS.Timeout>();

  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [voiceFeedback, setVoiceFeedback] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState('en-US');

  const [todos, setTodos] = useState<TodoItem[]>([
    { id: '1', text: 'Review quarterly reports', completed: false },
    { id: '2', text: 'Call insurance company', completed: false },
    { id: '3', text: 'Buy groceries', completed: true },
  ]);

  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: '1', title: 'Team Meeting', time: '10:00 AM', date: 'Today' },
    { id: '2', title: 'Lunch with Sarah', time: '12:30 PM', date: 'Today' },
    { id: '3', title: 'Doctor Appointment', time: '3:00 PM', date: 'Tomorrow' },
  ]);

  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  useEffect(() => {
    return () => {
      if (processingTimeout.current) {
        clearTimeout(processingTimeout.current);
      }
    };
  }, []);

  const voiceSuggestions = [
    "Remind me to call Sarah next Wednesday at 3 PM",
    "Add a task for grocery shopping every Friday",
    "Start focus mode",
    "Show today's tasks",
    "What's my schedule today?",
    "Daily overview",
    "Add meeting with team tomorrow at 2:30 PM"
  ];

  const speakFeedback = (message: string, options?: { rate?: number; pitch?: number }) => {
    if (voiceFeedback) {
      Speech.speak(message, {
        language: currentLanguage,
        rate: options?.rate || 0.9,
        pitch: options?.pitch || 1.0,
      });
    }
  };

  const handleVoicePress = () => {
    setIsListening(true);
    setIsProcessing(false);
    Vibration.vibrate(50); // Haptic feedback

    // Enhanced voice recognition simulation with noise handling
    const commands = [
      "Remind me to call Sarah next Wednesday at 3 PM",
      "Add a task for grocery shopping every Friday",
      "Start focus mode",
      "Show today's tasks",
      "What's my schedule today?",
      "Add meeting with client tomorrow at 2:30 PM",
      "Create task to review project proposal",
      "Daily overview"
    ];

    const randomCommand = commands[Math.floor(Math.random() * commands.length)];

    // Simulate processing time with noise filtering
    setTimeout(() => {
      setIsListening(false);
      setIsProcessing(true);

      processingTimeout.current = setTimeout(() => {
        setIsProcessing(false);
        handleVoiceCommand(randomCommand);
      }, 1000);
    }, 1500);
  };

  const handleVoiceCommand = (command: string) => {
    setLastCommand(command);
    const lowerCommand = command.toLowerCase();

    // Voice shortcuts
    for (const [shortcut, action] of Object.entries(voiceShortcuts)) {
      if (lowerCommand.includes(shortcut)) {
        const response = action();
        speakFeedback(response);

        if (shortcut === 'show today\'s tasks') {
          readTodaysTasks();
        } else if (shortcut === 'what\'s my schedule') {
          speakTodaysSchedule();
        } else if (shortcut === 'daily overview') {
          provideDailyOverview();
        }
        return;
      }
    }

    // Enhanced task parsing
    const taskText = extractTaskFromCommand(command);
    if (taskText) {
      const { time, day } = parseDateTime(command);
      let fullTaskText = taskText;

      if (time && day !== 'Today') {
        fullTaskText += ` (${day} at ${time})`;
      } else if (time) {
        fullTaskText += ` (at ${time})`;
      } else if (day !== 'Today') {
        fullTaskText += ` (${day})`;
      }

      const newTask: TodoItem = {
        id: Date.now().toString(),
        text: fullTaskText,
        completed: false
      };

      setTodos(prev => [...prev, newTask]);
      speakFeedback(`Task added: ${fullTaskText}`, { rate: 0.8 });
      return;
    }

    // Enhanced event parsing
    const eventText = extractEventFromCommand(command);
    if (eventText) {
      const { time, day } = parseDateTime(command);

      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        title: eventText.split(' at ')[0].split(' on ')[0],
        time: time || '9:00 AM',
        date: day
      };

      setEvents(prev => [...prev, newEvent]);
      speakFeedback(`Event scheduled: ${newEvent.title} on ${newEvent.date} at ${newEvent.time}`, { rate: 0.8 });
      return;
    }

    // Schedule queries
    if (lowerCommand.includes('schedule') || lowerCommand.includes('calendar')) {
      speakTodaysSchedule();
      return;
    }

    // Task queries
    if (lowerCommand.includes('tasks') || lowerCommand.includes('todo')) {
      readTodaysTasks();
      return;
    }

    // Default response for unrecognized commands
    speakFeedback("I didn't quite catch that. Try saying 'add task', 'schedule meeting', or 'show today's tasks'.");
  };

  const readTodaysTasks = () => {
    const pendingTasks = todos.filter(todo => !todo.completed);
    if (pendingTasks.length === 0) {
      speakFeedback("You have no pending tasks. Great job!");
    } else {
      const tasksList = pendingTasks.map((todo, index) => 
        `${index + 1}: ${todo.text}`
      ).join('. ');
      speakFeedback(`You have ${pendingTasks.length} pending tasks: ${tasksList}`);
    }
  };

  const provideDailyOverview = () => {
    const todayEvents = events.filter(event => event.date === 'Today');
    const pendingTasks = todos.filter(todo => !todo.completed);

    let overview = `Good ${greeting.split(' ')[1]?.toLowerCase()}! `;

    if (todayEvents.length > 0) {
      overview += `You have ${todayEvents.length} events today: `;
      overview += todayEvents.map(event => `${event.title} at ${event.time}`).join(', ');
      overview += '. ';
    }

    if (pendingTasks.length > 0) {
      overview += `And ${pendingTasks.length} pending tasks to complete.`;
    } else {
      overview += `And no pending tasks. You're all caught up!`;
    }

    speakFeedback(overview, { rate: 0.85 });
  };

  const handleSuggestionPress = (suggestion: string) => {
    handleVoiceCommand(suggestion);
  };

  const speakTodaysSchedule = () => {
    const todayEvents = events.filter(event => event.date === 'Today');
    const eventsList = todayEvents.map(event => `${event.title} at ${event.time}`).join(', ');
    const pendingTodos = todos.filter(todo => !todo.completed);
    const todosList = pendingTodos.map(todo => todo.text).join(', ');

    const message = `Today you have ${todayEvents.length} events: ${eventsList}. And ${pendingTodos.length} pending tasks: ${todosList}`;
    Speech.speak(message);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <ThemedView style={styles.header}>
        {/* App Logo and Name */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../attached_assets/ayasync_logo_concept_10_1754716522026.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.brandContainer}>
            <Text style={[styles.appName, { color: colors.text }]}>
              AyaSync
            </Text>
            <Text style={[styles.tagline, { color: colors.icon }]}>
              Speak. Sync. Simplify.
            </Text>
          </View>
        </View>

        <ThemedText type="title" style={[styles.greeting, { color: colors.primary }]}>
          {greeting}! 👋
        </ThemedText>
      </ThemedView>

      {/* Voice Command Center */}
      <ThemedView style={[styles.voiceSection, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[
            styles.micButton,
            { 
              backgroundColor: isListening ? colors.accent : colors.primary,
              shadowColor: colors.primary 
            }
          ]}
          onPress={handleVoicePress}
          activeOpacity={0.8}
        >
          <IconSymbol
            name={isListening ? "waveform" : "microphone"}
            size={40}
            color="white"
          />
        </TouchableOpacity>

        <ThemedText style={[styles.micLabel, { color: colors.text }]}>
          {isListening ? "Listening..." : 
           isProcessing ? "Processing..." : 
           "Tap or say 'Hey Aya' to start"}
        </ThemedText>

        {lastCommand && (
          <View style={[styles.commandFeedback, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ThemedText style={[styles.commandText, { color: colors.text }]}>
              Last command: "{lastCommand}"
            </ThemedText>
          </View>
        )}

        {/* Voice Settings */}
        <View style={styles.voiceSettings}>
          <TouchableOpacity
            style={[styles.settingButton, { backgroundColor: voiceFeedback ? colors.primary : colors.surface }]}
            onPress={() => setVoiceFeedback(!voiceFeedback)}
          >
            <IconSymbol
              name={voiceFeedback ? "speaker.2" : "speaker.slash"}
              size={16}
              color={voiceFeedback ? "white" : colors.icon}
            />
            <ThemedText style={[styles.settingText, { color: voiceFeedback ? "white" : colors.icon }]}>
              Voice Feedback
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Voice Suggestions */}
        <View style={styles.suggestions}>
          <ThemedText style={[styles.suggestionsTitle, { color: colors.icon }]}>
            Try complex commands:
          </ThemedText>
          {voiceSuggestions.slice(0, 3).map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.suggestionChip, { borderColor: colors.border }]}
              onPress={() => handleSuggestionPress(suggestion)}
            >
              <ThemedText style={[styles.suggestionText, { color: colors.primary }]}>
                "{suggestion}"
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ThemedView>

      {/* Today's Overview */}
      <ThemedView style={styles.overviewSection}>
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle" style={{ color: colors.text }}>
            Today's Overview
          </ThemedText>
          <TouchableOpacity onPress={speakTodaysSchedule}>
            <IconSymbol name="speaker" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Calendar Events */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <ThemedText style={[styles.cardTitle, { color: colors.primary }]}>
            📅 Upcoming Events
          </ThemedText>
          {events.filter(event => event.date === 'Today').map((event) => (
            <View key={event.id} style={styles.listItem}>
              <ThemedText style={{ color: colors.text }}>{event.title}</ThemedText>
              <ThemedText style={{ color: colors.icon }}>{event.time}</ThemedText>
            </View>
          ))}
        </View>

        {/* Todo Items */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <ThemedText style={[styles.cardTitle, { color: colors.secondary }]}>
            ✅ Pending Tasks
          </ThemedText>
          {todos.filter(todo => !todo.completed).map((todo) => (
            <View key={todo.id} style={styles.listItem}>
              <ThemedText style={{ color: colors.text }}>{todo.text}</ThemedText>
            </View>
          ))}
        </View>
      </ThemedView>

      <ThemedView style={styles.footer}>
        <ThemedText style={[styles.footerText, { color: colors.icon }]}>
          AyaSync - Your Voice-Powered Assistant
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  logoIcon: {
    opacity: 0.9,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 8,
  },
  tagline: {
    fontSize: 16,
    fontWeight: 'bold',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  micIcon: {
    fontSize: 40,
  },
  speakerIcon: {
    fontSize: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  voiceSection: {
    margin: 20,
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  micLabel: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: '500',
  },
  suggestions: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  suggestionsTitle: {
    fontSize: 14,
    marginBottom: 10,
    opacity: 0.7,
  },
  suggestionChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginVertical: 4,
    width: '100%',
  },
  suggestionText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  overviewSection: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  card: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
  commandFeedback: {
    marginTop: 15,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    width: '100%',
  },
  commandText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  voiceSettings: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    marginBottom: 10,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginHorizontal: 5,
  },
  settingText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: '500',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  brandContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
});