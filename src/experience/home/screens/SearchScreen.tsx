import React from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SearchScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Discover Streams</Text>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Search channels, games, streamers..."
            placeholderTextColor="#6B7280"
            style={styles.searchInput}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionHeader}>Popular Searches</Text>
        <View style={styles.tagWrap}>
          {['#VALORANT', '#IRL_Tokyo', '#Chill_Music', '#GTA5', '#Minecraft', '#ASMR'].map((tag) => (
            <View key={tag} style={styles.tagPill}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0E14',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
  },
  content: {
    padding: 16,
  },
  sectionHeader: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    color: '#A78BFA',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default SearchScreen;
