import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import DashboardScreen from './screens/DashboardScreen';
import SquadDetailScreen from './screens/SquadDetailScreen';
import AgentChatScreen from './screens/AgentChatScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0d1117' } }}>
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="SquadDetail" component={SquadDetailScreen} />
        <Stack.Screen name="AgentChat" component={AgentChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}