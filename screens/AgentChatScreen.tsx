import React, { useState, useRef, useEffect, useCallback } from 'react';
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

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: string;
}

function nowHHMM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function AgentChatScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { agentName, agentRole } = route.params as { agentName: string; agentRole: string };

  const chatKey = `mc_chat_${agentName}`;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const listRef = useRef<FlatList>(null);

  // Load persisted chat on mount
  useEffect(() => {
    AsyncStorage.getItem(chatKey).then(raw => {
      if (raw) {
        try { setMessages(JSON.parse(raw)); } catch {}
      }
    });
  }, [chatKey]);

  // Persist whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      AsyncStorage.setItem(chatKey, JSON.stringify(messages));
    }
  }, [messages, chatKey]);

  const clearChat = useCallback(async () => {
    await AsyncStorage.removeItem(chatKey);
    setMessages([]);
    setStreamingText('');
  }, [chatKey]);

  // Wire Clear button into header
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={clearChat} style={{ marginRight: 16 }}>
          <Text style={{ color: '#ff6b6b', fontSize: 13, fontWeight: '600' }}>Clear</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, clearChat]);

  const systemPrompt = `You are ${agentName}, an expert in ${agentRole}. You are part of the NYC Tailblazers Mission Control team. Be direct, precise, and useful. NYC style — no corporate filler.`;

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, ts: nowHHMM() };
    const next = [...messages, userMsg];
    setMessages(next);
    setLoading(true);
    setStreamingText('');

    try {
      const apiKey = await AsyncStorage.getItem(API_KEY_STORAGE_KEY);
      if (!apiKey) {
        setMessages(m => [...m, {
          id: Date.now().toString(), role: 'assistant',
          content: 'No API key set. Go to Settings and add your Anthropic API key.',
          ts: nowHHMM(),
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
          'anthropic-beta': 'prompt-caching-2024-07-31',
        },
        body: JSON.stringify({
          model: ANTHROPIC_MODEL,
          max_tokens: MAX_TOKENS,
          stream: true,
          system: systemPrompt,
          messages: next.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!resp.ok) {
        const err = await resp.text().catch(() => resp.statusText);
        throw new Error(`${resp.status}: ${err.slice(0, 120)}`);
      }

      // Stream SSE response
      const reader = resp.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
                accumulated += parsed.delta.text;
                setStreamingText(accumulated);
                setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 50);
              }
            } catch {
              // malformed SSE line — skip
            }
          }
        }
      }

      const finalText = accumulated || '(no response)';
      setStreamingText('');
      setMessages(m => [...m, {
        id: Date.now().toString(),
        role: 'assistant',
        content: finalText,
        ts: nowHHMM(),
      }]);
    } catch (e: any) {
      setStreamingText('');
      setMessages(m => [...m, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Error: ${e.message}`,
        ts: nowHHMM(),
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }

  // Combine persisted messages + live streaming bubble
  const displayMessages = streamingText
    ? [...messages, { id: 'streaming', role: 'assistant' as const, content: streamingText, ts: nowHHMM() }]
    : messages;

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
        data={displayMessages}
        keyExtractor={m => m.id}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => (
          <View style={[styles.bubbleWrap, item.role === 'user' ? styles.userWrap : styles.aiWrap]}>
            <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
              <Text style={styles.bubbleText}>{item.content}</Text>
            </View>
            <Text style={styles.timestamp}>{item.ts}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Ask {agentName} anything about {agentRole}.</Text>
        }
      />

      {loading && !streamingText && (
        <View style={styles.typingRow}>
          <ActivityIndicator color="#2ed573" size="small" />
          <Text style={styles.typingText}>  {agentName} is thinking…</Text>
        </View>
      )}

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
  bubbleWrap:  { marginBottom: 10 },
  userWrap:    { alignItems: 'flex-end' },
  aiWrap:      { alignItems: 'flex-start' },
  bubble:      { maxWidth: '85%', padding: 12, borderRadius: 12 },
  userBubble:  { backgroundColor: '#21262d', borderBottomRightRadius: 4 },
  aiBubble:    { backgroundColor: '#161b22', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#30363d' },
  bubbleText:  { color: '#c9d1d9', fontSize: 14, lineHeight: 20 },
  timestamp:   { color: '#444', fontSize: 10, marginTop: 3, marginHorizontal: 4 },
  empty:       { color: '#555', textAlign: 'center', marginTop: 60, fontSize: 13 },
  typingRow:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 6 },
  typingText:  { color: '#2ed573', fontSize: 12 },
  inputRow:    { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: '#21262d', alignItems: 'flex-end' },
  input:       { flex: 1, backgroundColor: '#161b22', color: '#c9d1d9', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, maxHeight: 100, borderWidth: 1, borderColor: '#30363d' },
  sendBtn:     { marginLeft: 10, backgroundColor: '#238636', borderRadius: 8, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  sendText:    { color: '#fff', fontSize: 16 },
});
