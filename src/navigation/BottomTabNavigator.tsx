import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../experience/home/screens/HomeScreen';
import ChatScreen from '../experience/home/screens/ChatScreen';
import SearchScreen from '../experience/home/screens/SearchScreen';
import ProfileScreen from '../experience/home/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
