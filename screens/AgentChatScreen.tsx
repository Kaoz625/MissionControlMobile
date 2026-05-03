import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ANTHROPIC_MODEL, ANTHROPIC_API_URL, ANTHROPIC_VERSION,
  MAX_TOKENS, API_KEY_STORAGE_KEY,
} from '../src/config';

interface Message { id: string; role: 'user' | 'assistant'; content: string; }

export default function AgentChatScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { agentName, agentRole } = route.params as { agentName: string; agentRole: string };

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);

  const systemPrompt = `You are ${agentName}, an expert in ${agentRole}. You are part of the NYC Tailblazers Mission Control team. Be direct, precise, and useful. NYC style — no corporate filler.`;

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setLoading(true);

    try {
      const apiKey = await AsyncStorage.getItem(API_KEY_STORAGE_KEY);
      if (!apiKey) {
        setMessages(m => [...m, {
          id: Date.now().toString(), role: 'assistant',
          content: 'No API key set. Add your Anthropic API key in Settings.',
        }]);
        setLoading(false);
        return;
      }

      const resp = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': ANTHROPIC_VERSION,
        },
        body: JSON.stringify({
          model: ANTHROPIC_MODEL,
          max_tokens: MAX_TOKENS,
          system: systemPrompt,
          messages: next.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!resp.ok) {
        const err = await resp.text().catch(() => resp.statusText);
        throw new Error(`${resp.status}: ${err.slice(0, 120)}`);
      }

      const data = await resp.json();
      const reply = data.content?.[0]?.text ?? '(no response)';
      setMessages(m => [...m, { id: Date.now().toString(), role: 'assistant', content: reply }]);
    } catch (e: any) {
      setMessages(m => [...m, { id: Date.now().toString(), role: 'assistant', content: `Error: ${e.message}` }]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>⬅</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.agentName}>🟢 {agentName}</Text>
          <Text style={styles.agentRole}>{agentRole}</Text>
        </View>
        <Text style={styles.model}>{ANTHROPIC_MODEL}</Text>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={m => m.id}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
            <Text style={styles.bubbleText}>{item.content}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Ask {agentName} anything about {agentRole}.</Text>
        }
      />

      {loading && <ActivityIndicator color="#2ed573" style={styles.spinner} />}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder={`Message ${agentName}…`}
          placeholderTextColor="#555"
          multiline
          onSubmitEditing={send}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={send} disabled={loading}>
          <Text style={styles.sendText}>▶</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#0d1117' },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 56, borderBottomWidth: 1, borderBottomColor: '#21262d' },
  back:        { color: '#58a6ff', fontSize: 20, marginRight: 12 },
  agentName:   { color: '#c9d1d9', fontWeight: 'bold', fontSize: 16 },
  agentRole:   { color: '#8b949e', fontSize: 11 },
  model:       { color: '#30363d', fontSize: 10 },
  messageList: { padding: 16, paddingBottom: 8 },
  bubble:      { maxWidth: '85%', padding: 12, borderRadius: 12, marginBottom: 10 },
  userBubble:  { backgroundColor: '#21262d', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  aiBubble:    { backgroundColor: '#161b22', alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#30363d' },
  bubbleText:  { color: '#c9d1d9', fontSize: 14, lineHeight: 20 },
  empty:       { color: '#555', textAlign: 'center', marginTop: 60, fontSize: 13 },
  spinner:     { marginVertical: 8 },
  inputRow:    { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: '#21262d', alignItems: 'flex-end' },
  input:       { flex: 1, backgroundColor: '#161b22', color: '#c9d1d9', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, maxHeight: 100, borderWidth: 1, borderColor: '#30363d' },
  sendBtn:     { marginLeft: 10, backgroundColor: '#238636', borderRadius: 8, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  sendText:    { color: '#fff', fontSize: 16 },
});
