import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';
import ChatDetailScreen from '../experience/home/screens/ChatDetailScreen';
import GetTokensScreen from '../experience/home/screens/GetTokensScreen';
import SettingsScreen from '../experience/home/screens/SettingsScreen';
import HistoryScreen from '../experience/home/screens/HistoryScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
      <Stack.Screen name="GetTokens" component={GetTokensScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
