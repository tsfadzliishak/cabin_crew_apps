import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useProfileStore } from '../../src/store/profileStore';
import { THEME } from '../../src/constants/theme';
import AppHeader from '../../src/components/AppHeader';

// Available options in minutes
const PREP_OPTIONS = [60, 90, 120, 150, 180, 210, 240]; // 1h to 4h
const COMMUTE_OPTIONS = [30, 45, 60, 75, 90, 120]; // 30m to 2h

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export default function SettingsScreen() {
  const { name } = useProfileStore();
  const {
    prepMinutes,
    commuteMinutes,
    loaded,
    loadSettings,
    setPrepMinutes,
    setCommuteMinutes,
  } = useSettingsStore();

  const [savingMsg, setSavingMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!loaded) {
      loadSettings();
    }
  }, [loaded, loadSettings]);

  const handleSetPrep = async (minutes: number) => {
    await setPrepMinutes(minutes);
    showSaved('Preparation time updated');
  };

  const handleSetCommute = async (minutes: number) => {
    await setCommuteMinutes(minutes);
    showSaved('Commute time updated');
  };

  const showSaved = (msg: string) => {
    setSavingMsg(msg);
    setTimeout(() => setSavingMsg(null), 2000);
  };

  const handleReset = async () => {
    await setPrepMinutes(120);
    await setCommuteMinutes(60);
    showSaved('Settings reset to defaults');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* App Header with Logo */}
        <AppHeader name={name} />

        {/* Page Title */}
        <View style={styles.titleContainer}>
          <MaterialCommunityIcons name="cog" size={32} color={THEME.primary} />
          <Text style={styles.pageTitle}>Settings</Text>
        </View>

        {savingMsg && (
          <View style={styles.savedBanner} testID="settings-saved-banner">
            <MaterialCommunityIcons name="check-circle" size={20} color={THEME.white} />
            <Text style={styles.savedText}>{savingMsg}</Text>
          </View>
        )}

        {/* Preparation Time Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={[styles.iconCircle, { backgroundColor: THEME.prep }]}>
                <MaterialCommunityIcons name="shower" size={22} color={THEME.white} />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>Preparation Time</Text>
                <Text style={styles.cardSubtitle}>
                  Time needed to get ready before flight
                </Text>
              </View>
            </View>

            <View style={styles.currentValue}>
              <Text style={styles.currentValueLabel}>Currently:</Text>
              <Text style={styles.currentValueText}>{formatMinutes(prepMinutes)}</Text>
            </View>

            <Divider style={styles.divider} />

            <Text style={styles.optionsLabel}>Choose duration:</Text>
            <View style={styles.optionsGrid}>
              {PREP_OPTIONS.map((option) => {
                const selected = prepMinutes === option;
                return (
                  <TouchableOpacity
                    key={option}
                    testID={`prep-option-${option}`}
                    style={[
                      styles.optionChip,
                      selected && styles.optionChipSelected,
                    ]}
                    onPress={() => handleSetPrep(option)}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        selected && styles.optionChipTextSelected,
                      ]}
                    >
                      {formatMinutes(option)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card.Content>
        </Card>

        {/* Commute Time Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={[styles.iconCircle, { backgroundColor: THEME.commute }]}>
                <MaterialCommunityIcons name="car" size={22} color={THEME.white} />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>Time to Leave for Airport</Text>
                <Text style={styles.cardSubtitle}>
                  How early to leave home before duty starts
                </Text>
              </View>
            </View>

            <View style={styles.currentValue}>
              <Text style={styles.currentValueLabel}>Currently:</Text>
              <Text style={styles.currentValueText}>{formatMinutes(commuteMinutes)}</Text>
            </View>

            <Divider style={styles.divider} />

            <Text style={styles.optionsLabel}>Choose duration:</Text>
            <View style={styles.optionsGrid}>
              {COMMUTE_OPTIONS.map((option) => {
                const selected = commuteMinutes === option;
                return (
                  <TouchableOpacity
                    key={option}
                    testID={`commute-option-${option}`}
                    style={[
                      styles.optionChip,
                      selected && styles.optionChipSelected,
                    ]}
                    onPress={() => handleSetCommute(option)}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        selected && styles.optionChipTextSelected,
                      ]}
                    >
                      {formatMinutes(option)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card.Content>
        </Card>

        {/* Info Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="information" size={20} color={THEME.secondary} />
              <Text style={styles.infoText}>
                Your settings affect the "Important Times" shown on the Today screen.
                Changes are saved automatically.
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Reset Button */}
        <View style={styles.resetContainer}>
          <Button
            mode="outlined"
            onPress={handleReset}
            icon="restore"
            textColor={THEME.primary}
            testID="reset-settings-btn"
          >
            Reset to Defaults
          </Button>
        </View>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  scrollView: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    backgroundColor: THEME.white,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.primary,
  },
  savedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.secondary,
    padding: 12,
    margin: 16,
    marginBottom: 0,
    borderRadius: 8,
    gap: 8,
  },
  savedText: {
    color: THEME.white,
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    elevation: 3,
    backgroundColor: THEME.cardBackground,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.primary,
  },
  cardSubtitle: {
    fontSize: 12,
    color: THEME.textLight,
    marginTop: 2,
  },
  currentValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingVertical: 8,
    gap: 8,
  },
  currentValueLabel: {
    fontSize: 14,
    color: THEME.textLight,
  },
  currentValueText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: THEME.primary,
  },
  divider: {
    marginVertical: 12,
    backgroundColor: THEME.border,
  },
  optionsLabel: {
    fontSize: 13,
    color: THEME.textLight,
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: THEME.border,
    backgroundColor: THEME.white,
    minWidth: 70,
    alignItems: 'center',
  },
  optionChipSelected: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  optionChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textLight,
  },
  optionChipTextSelected: {
    color: THEME.white,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: THEME.textLight,
    lineHeight: 18,
  },
  resetContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  footer: {
    height: 32,
  },
});
