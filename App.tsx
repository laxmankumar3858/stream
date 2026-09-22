import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar barStyle="light-content" />
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
