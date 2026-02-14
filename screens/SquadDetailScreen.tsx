import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SQUADS } from '../data/roster';

export default function SquadDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { squadId } = route.params as { squadId: string };
  const squad = SQUADS.find(s => s.id === squadId);

  if (!squad) return <View style={styles.container}><Text style={styles.text}>Squad Not Found</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{squad.name}</Text>
      <Text style={styles.subHeader}>{squad.description}</Text>

      <FlatList
        data={squad.agents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.agentRow} onPress={() => alert(`Connecting to ${item.name}...`)}>
            <View>
              <Text style={styles.agentName}>🟢 {item.name}</Text>
              <Text style={styles.agentRole}>{item.role}</Text>
            </View>
            <View style={styles.chatBtn}>
              <Text style={styles.chatText}>CHAT</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>⬅ BACK TO HQ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1117', padding: 20, paddingTop: 60 },
  header: { fontSize: 22, fontWeight: 'bold', color: '#58a6ff', marginBottom: 5 },
  subHeader: { fontSize: 14, color: '#8b949e', marginBottom: 30 },
  text: { color: '#fff' },
  agentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#161b22',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  agentName: { color: '#c9d1d9', fontSize: 16, fontWeight: 'bold' },
  agentRole: { color: '#8b949e', fontSize: 12 },
  chatBtn: { backgroundColor: '#238636', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  chatText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  backBtn: { marginTop: 20, padding: 15, backgroundColor: '#21262d', borderRadius: 8, alignItems: 'center' },
  backText: { color: '#c9d1d9', fontWeight: 'bold' }
});