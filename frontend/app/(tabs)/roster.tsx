import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, ActivityIndicator, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRosterStore } from '../../src/store/rosterStore';
import { useProfileStore } from '../../src/store/profileStore';
import { THEME } from '../../src/constants/theme';
import { getAirportFullName } from '../../src/constants/airports';
import AppHeader from '../../src/components/AppHeader';

export default function RosterScreen() {
  const { roster, loading, fetchRoster } = useRosterStore();
  const { name } = useProfileStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRoster();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRoster();
    setRefreshing(false);
  };

  const getDayOffLabel = (entry: any) => {
    if (entry.off_type === 'D') return 'Day Off';
    if (entry.off_type === 'DO' || entry.off_type === 'DO1') return 'Day Off at Base';
    if (entry.off_type === 'AL') return 'Annual Leave';
    return 'Off Day';
  };

  const getStatusColor = (entry: any) => {
    if (entry.is_day_off) return THEME.dayOff;
    if (entry.flights && entry.flights.length > 0) return THEME.flight;
    return THEME.warning;
  };

  if (loading && roster.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={THEME.primary} />
          <Text style={styles.loadingText}>Loading roster...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (roster.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor={THEME.primary}
              colors={[THEME.primary]}
            />
          }
        >
          {/* App Header with Logo */}
          <AppHeader name={name} />

          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="calendar-blank" size={64} color={THEME.border} />
            <Text style={styles.emptyText}>No roster data available</Text>
            <Text style={styles.emptySubtext}>Upload a roster to get started</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={THEME.primary}
            colors={[THEME.primary]}
          />
        }
      >
        {/* App Header with Logo */}
        <AppHeader name={name} />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Monthly Roster</Text>
          <Text style={styles.headerSubtitle}>{roster.length} days scheduled</Text>
        </View>

        {roster.map((entry, index) => (
          <Card key={entry.id || index} style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <View style={styles.dateContainer}>
                  <Text style={styles.dateText}>{entry.date}</Text>
                  <Text style={styles.dayText}>{entry.day}</Text>
                </View>
                <View
                  style={[
                    styles.statusIndicator,
                    { backgroundColor: getStatusColor(entry) },
                  ]}
                />
              </View>

              {entry.is_day_off ? (
                <View style={styles.dayOffContainer}>
                  <MaterialCommunityIcons name="beach" size={32} color={THEME.dayOff} />
                  <Text style={styles.dayOffText}>{getDayOffLabel(entry)}</Text>
                </View>
              ) : (
                <View>
                  {entry.duty_start_time && (
                    <View style={styles.dutyTimeContainer}>
                      <MaterialCommunityIcons name="clock-outline" size={16} color={THEME.textLight} />
                      <Text style={styles.dutyTimeText}>
                        {entry.duty_start_time}
                        {entry.duty_end_time && ` - ${entry.duty_end_time}`}
                      </Text>
                      {entry.duty_hours && (
                        <Chip style={styles.dutyChip} textStyle={styles.chipText}>
                          {entry.duty_hours}
                        </Chip>
                      )}
                    </View>
                  )}

                  {entry.flights && entry.flights.length > 0 && (
                    <View style={styles.flightsContainer}>
                      {entry.flights.map((flight, flightIndex) => (
                        <View key={flightIndex} style={styles.flightRow}>
                          <MaterialCommunityIcons name="airplane" size={16} color={THEME.primary} />
                          <View style={styles.flightInfo}>
                            <Text style={styles.flightText}>
                              {flight.flight_number}
                            </Text>
                            <Text style={styles.routeText}>
                              {getAirportFullName(flight.dep_airport)} → {getAirportFullName(flight.arr_airport)}
                            </Text>
                          </View>
                          {flight.aircraft_type && (
                            <Chip style={styles.aircraftChip} textStyle={styles.chipText}>
                              {flight.aircraft_type}
                            </Chip>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </Card.Content>
          </Card>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>End of roster</Text>
        </View>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: THEME.textLight,
  },
  nameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: THEME.primary,
    gap: 12,
  },
  nameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.white,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.textLight,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: THEME.textLighter,
    marginTop: 8,
  },
  header: {
    padding: 16,
    backgroundColor: THEME.white,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: THEME.textLight,
    marginTop: 4,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.primary,
  },
  dayText: {
    fontSize: 14,
    color: THEME.textLight,
    marginTop: 2,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dayOffContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayOffText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.dayOff,
    marginLeft: 12,
  },
  dutyTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  dutyTimeText: {
    fontSize: 14,
    color: THEME.textLight,
    marginLeft: 8,
    marginRight: 8,
  },
  dutyChip: {
    height: 24,
    backgroundColor: THEME.accent + '30',
  },
  chipText: {
    fontSize: 11,
    color: THEME.secondary,
  },
  flightsContainer: {
    marginTop: 4,
  },
  flightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    gap: 8,
  },
  flightInfo: {
    flex: 1,
  },
  flightText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.primary,
  },
  routeText: {
    fontSize: 11,
    color: THEME.textLight,
    marginTop: 2,
  },
  aircraftChip: {
    height: 24,
    backgroundColor: THEME.secondary + '20',
  },
  footer: {
    alignItems: 'center',
    padding: 32,
  },
  footerText: {
    fontSize: 14,
    color: THEME.textLighter,
  },
});
