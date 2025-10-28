import { Tabs } from "expo-router";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Octicons from '@expo/vector-icons/Octicons';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'coral' }}>

      <Tabs.Screen 
        name="index" 
        options={{
          title: "Today",
          headerShown: false, 
          tabBarIcon: ({ color }) => {
            return <MaterialIcons name="today" size={24} color={color} />
          }
        }}
      />

      <Tabs.Screen 
        name="Streak" 
        options={{
          title: "Streak",
          headerShown: false,
          tabBarIcon: ({ color }) => {
            return <Octicons name="graph" size={20} color={color} />
          }
        }}
      />

      <Tabs.Screen
        name="AddHabit"
        options={{
          title: "Add Habit",
          headerShown: false,
          tabBarIcon: ({ color }) => {
            return <Ionicons name="add-circle" size={24} color={color} />
          }
        }}
      />

    </Tabs>
  )
}
