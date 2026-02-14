import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SQUADS } from '../data/roster';

export default function DashboardScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.header}>🦅 MISSION CONTROL</Text>
      <Text style={styles.status}>SYSTEM: ONLINE 🟢</Text>

      <FlatList
        data={SQUADS}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => navigation.navigate('SquadDetail', { squadId: item.id })}
          >
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardDesc}>{item.description}</Text>
            <View style={styles.indicator} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1117', padding: 20, paddingTop: 60 },
  header: { fontSize: 24, fontWeight: '900', color: '#2ed573', textAlign: 'center', letterSpacing: 2 },
  status: { fontSize: 12, color: '#2ed573', textAlign: 'center', marginBottom: 30, opacity: 0.8 },
  grid: { paddingBottom: 40 },
  card: {
    flex: 1,
    backgroundColor: '#161b22',
    margin: 8,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#30363d',
    minHeight: 140,
    justifyContent: 'space-between',
  },
  cardTitle: { color: '#58a6ff', fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  cardDesc: { color: '#8b949e', fontSize: 11 },
  indicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#238636', alignSelf: 'flex-end', marginTop: 10, boxShadow: '0 0 5px #238636' }
});