import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY_STORAGE = 'mc_anthropic_api_key';

export default function SettingsScreen() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState('');

  useEffect(() => {
    AsyncStorage.getItem(API_KEY_STORAGE).then(val => { if (val) setApiKey(val); });
  }, []);

  const saveKey = async () => {
    await AsyncStorage.setItem(API_KEY_STORAGE, apiKey);
    Alert.alert('Saved', 'API key saved successfully');
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult('');
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'hi' }],
        }),
      });
      if (res.ok) {
        setTestResult('✅ Connected');
      } else {
        const err = await res.json();
        setTestResult(`❌ ${err.error?.message || res.status}`);
      }
    } catch (e: any) {
      setTestResult(`❌ ${e.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Anthropic API Key</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={apiKey}
          onChangeText={setApiKey}
          secureTextEntry={!showKey}
          placeholder="sk-ant-..."
          autoCorrect={false}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setShowKey(v => !v)} style={styles.toggle}>
          <Text>{showKey ? '🙈' : '👁'}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={saveKey}>
        <Text style={styles.buttonText}>Save Key</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.testButton]} onPress={testConnection} disabled={testing}>
        <Text style={styles.buttonText}>{testing ? 'Testing...' : 'Test Connection'}</Text>
      </TouchableOpacity>
      {testResult ? <Text style={styles.result}>{testResult}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#0a0a0a' },
  label: { color: '#ccc', marginBottom: 8, fontSize: 16 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  input: { flex: 1, backgroundColor: '#1a1a1a', color: '#fff', padding: 12, borderRadius: 8, fontSize: 14 },
  toggle: { padding: 12 },
  button: { backgroundColor: '#2563eb', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  testButton: { backgroundColor: '#059669' },
  buttonText: { color: '#fff', fontWeight: '600' },
  result: { color: '#fff', textAlign: 'center', marginTop: 8, fontSize: 16 },
});
