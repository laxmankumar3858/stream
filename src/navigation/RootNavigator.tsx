import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';
import { useAuth } from '../context/AuthContext';

const RootNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;
