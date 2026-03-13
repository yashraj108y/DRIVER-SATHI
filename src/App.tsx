import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { Colors } from './constants/Colors';
import { getOnboardingStatus } from './storage/DriverRules';

import OnboardingScreen from './screens/OnboardingScreen';
import SmartAdviceScreen from './screens/SmartAdviceScreen';
import MyRulesScreen from './screens/MyRulesScreen';
import TodayScreen from './screens/TodayScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: Colors.green,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'circle';

          if (route.name === 'Smart Advice') {
            iconName = focused ? 'lightning-bolt' : 'lightning-bolt-outline';
          } else if (route.name === 'Maze Niyam') {
            iconName = focused ? 'cog' : 'cog-outline';
          } else if (route.name === 'Aaj') {
            iconName = focused ? 'calendar-month' : 'calendar-month-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Smart Advice" component={SmartAdviceScreen} />
      <Tab.Screen name="Maze Niyam" component={MyRulesScreen} />
      <Tab.Screen name="Aaj" component={TodayScreen} />
    </Tab.Navigator>
  );
};

const App = () => {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    const status = await getOnboardingStatus();
    setIsOnboardingComplete(status);
  };

  if (isOnboardingComplete === null) return null; // Splash screen

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isOnboardingComplete && (
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          )}
          <Stack.Screen name="MainTabs" component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
