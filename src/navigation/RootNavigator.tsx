import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';
import { useAuth } from '../context/AuthContext';
import GenderSelectionModal from '../components/GenderSelectionModal';

const RootNavigator = () => {
  const { isAuthenticated, isInitializing, user, saveGender } = useAuth();

  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#FF1493" />
      </View>
    );
  }

  return (
    <View style={styles.appContainer}>
      <NavigationContainer>
        {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
      </NavigationContainer>
      <GenderSelectionModal
        visible={isAuthenticated && user?.gender == null}
        onSave={saveGender}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F091A',
  },
});

export default RootNavigator;
