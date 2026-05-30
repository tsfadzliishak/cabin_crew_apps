import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { THEME } from '../constants/theme';

interface AppHeaderProps {
  name: string;
}

export default function AppHeader({ name }: AppHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/malaysia-airlines-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.nameContainer}>
        <Text style={styles.nameLabel}>Cabin Crew</Text>
        <Text style={styles.nameText} numberOfLines={2}>{name}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: THEME.primary,
    gap: 12,
  },
  logoContainer: {
    width: 70,
    height: 50,
    backgroundColor: THEME.white,
    borderRadius: 8,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  nameContainer: {
    flex: 1,
  },
  nameLabel: {
    fontSize: 11,
    color: THEME.white,
    opacity: 0.85,
    marginBottom: 2,
  },
  nameText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME.white,
  },
});
