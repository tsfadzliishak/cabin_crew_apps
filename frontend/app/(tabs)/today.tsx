import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, ActivityIndicator, Chip, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRosterStore } from '../../src/store/rosterStore';
import { format, parse, addHours, addMinutes, differenceInHours, differenceInMinutes } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

const MALAYSIA_TZ = 'Asia/Kuala_Lumpur';

// Airport timezone mapping (simplified)
const AIRPORT_TIMEZONES: Record<string, string> = {
  KUL: 'Asia/Kuala_Lumpur',
  KCH: 'Asia/Kuching',
  SIN: 'Asia/Singapore',
  BKI: 'Asia/Kuching',
  KBR: 'Asia/Kuala_Lumpur',
  CGK: 'Asia/Jakarta',
  KTI: 'Asia/Kuala_Lumpur',
  AOR: 'Asia/Kuala_Lumpur',
  PEN: 'Asia/Kuala_Lumpur',
  LHR: 'Europe/London',
  BKK: 'Asia/Bangkok',
  DEL: 'Asia/Kolkata',
  KTM: 'Asia/Kathmandu',
};

function getAirportTimezone(airport: string): string {
  return AIRPORT_TIMEZONES[airport] || MALAYSIA_TZ;
}

function parseTime(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function formatDuration(hours: number, minutes: number): string {
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

export default function TodayScreen() {
  const { roster, loading, fetchRoster, getTodayEntry } = useRosterStore();
  const [refreshing, setRefreshing] = useState(false);
  const todayEntry = getTodayEntry();

  useEffect(() => {
    fetchRoster();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRoster();
    setRefreshing(false);
  };

  const calculateTimes = () => {
    if (!todayEntry || !todayEntry.duty_start_time) return null;

    const dutyStart = parseTime(todayEntry.duty_start_time);
    const prepTime = addHours(dutyStart, -2); // 2 hours before
    const commuteTime = addHours(dutyStart, -1); // 1 hour before

    return {
      prepTime: format(prepTime, 'HH:mm'),
      commuteTime: format(commuteTime, 'HH:mm'),
      dutyStart: format(dutyStart, 'HH:mm'),
    };
  };

  if (loading && !todayEntry) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading roster...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!todayEntry) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="calendar-blank" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No flights scheduled today</Text>
            <Text style={styles.emptySubtext}>Pull down to refresh</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const times = calculateTimes();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <Text style={styles.dateText}>{todayEntry.date}</Text>
            <Text style={styles.dayText}>{todayEntry.day}</Text>
            {todayEntry.duty_hours && (
              <Chip icon="clock-outline" style={styles.dutyChip}>
                Duty: {todayEntry.duty_hours}
              </Chip>
            )}
          </Card.Content>
        </Card>

        {/* Important Times Card */}
        {times && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>⏰ Important Times</Text>
              <Divider style={styles.divider} />
              
              <View style={styles.timeRow}>
                <View style={styles.timeIconContainer}>
                  <MaterialCommunityIcons name="shower" size={24} color="#FF9800" />
                </View>
                <View style={styles.timeInfo}>
                  <Text style={styles.timeLabel}>Start Preparation</Text>
                  <Text style={styles.timeValue}>{times.prepTime}</Text>
                  <Text style={styles.timeSubtext}>2 hours before flight</Text>
                </View>
              </View>

              <View style={styles.timeRow}>
                <View style={styles.timeIconContainer}>
                  <MaterialCommunityIcons name="car" size={24} color="#2196F3" />
                </View>
                <View style={styles.timeInfo}>
                  <Text style={styles.timeLabel}>Leave for Airport</Text>
                  <Text style={styles.timeValue}>{times.commuteTime}</Text>
                  <Text style={styles.timeSubtext}>1 hour before duty</Text>
                </View>
              </View>

              <View style={styles.timeRow}>
                <View style={styles.timeIconContainer}>
                  <MaterialCommunityIcons name="briefcase" size={24} color="#4CAF50" />
                </View>
                <View style={styles.timeInfo}>
                  <Text style={styles.timeLabel}>Duty Starts</Text>
                  <Text style={styles.timeValue}>{times.dutyStart}</Text>
                  <Text style={styles.timeSubtext}>Report to duty</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Flights Card */}
        {todayEntry.flights && todayEntry.flights.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>✈️ Today's Flights</Text>
              <Divider style={styles.divider} />
              
              {todayEntry.flights.map((flight, index) => {
                const depTz = getAirportTimezone(flight.dep_airport);
                const arrTz = getAirportTimezone(flight.arr_airport);

                return (
                  <View key={index} style={styles.flightCard}>
                    <View style={styles.flightHeader}>
                      <Text style={styles.flightNumber}>{flight.flight_number}</Text>
                      {flight.aircraft_type && (
                        <Chip style={styles.aircraftChip} textStyle={styles.chipText}>
                          {flight.aircraft_type}
                        </Chip>
                      )}
                    </View>

                    <View style={styles.routeContainer}>
                      {/* Departure */}
                      <View style={styles.locationContainer}>
                        <Text style={styles.airportCode}>{flight.dep_airport}</Text>
                        <Text style={styles.timeText}>{flight.dep_time}</Text>
                        <View style={styles.dualTimeContainer}>
                          <Text style={styles.timezoneLabel}>Local</Text>
                          <Text style={styles.timezoneLabel}>MYT</Text>
                        </View>
                      </View>

                      {/* Arrow */}
                      <View style={styles.arrowContainer}>
                        <MaterialCommunityIcons name="airplane" size={24} color="#2196F3" />
                        <View style={styles.arrowLine} />
                        {flight.block_hours && (
                          <Text style={styles.durationText}>{flight.block_hours}</Text>
                        )}
                      </View>

                      {/* Arrival */}
                      <View style={styles.locationContainer}>
                        <Text style={styles.airportCode}>{flight.arr_airport}</Text>
                        <Text style={styles.timeText}>{flight.arr_time}</Text>
                        <View style={styles.dualTimeContainer}>
                          <Text style={styles.timezoneLabel}>Local</Text>
                          <Text style={styles.timezoneLabel}>MYT</Text>
                        </View>
                      </View>
                    </View>

                    {index < todayEntry.flights.length - 1 && (
                      <Divider style={styles.flightDivider} />
                    )}
                  </View>
                );
              })}
            </Card.Content>
          </Card>
        )}

        {/* Day Off Card */}
        {todayEntry.is_day_off && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.dayOffContainer}>
                <MaterialCommunityIcons name="beach" size={64} color="#4CAF50" />
                <Text style={styles.dayOffText}>Day Off</Text>
                {todayEntry.off_type && (
                  <Text style={styles.dayOffType}>{todayEntry.off_type}</Text>
                )}
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  dateText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  dayText: {
    fontSize: 18,
    color: '#666',
    marginTop: 4,
  },
  dutyChip: {
    alignSelf: 'flex-start',
    marginTop: 12,
    backgroundColor: '#E3F2FD',
  },
  card: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 12,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  timeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  timeInfo: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  timeSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  flightCard: {
    marginVertical: 8,
  },
  flightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  flightNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  aircraftChip: {
    height: 28,
    backgroundColor: '#E8F5E9',
  },
  chipText: {
    fontSize: 12,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationContainer: {
    flex: 1,
    alignItems: 'center',
  },
  airportCode: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  timeText: {
    fontSize: 18,
    color: '#666',
    marginTop: 4,
  },
  dualTimeContainer: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 8,
  },
  timezoneLabel: {
    fontSize: 10,
    color: '#999',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  arrowContainer: {
    alignItems: 'center',
    marginHorizontal: 16,
  },
  arrowLine: {
    width: 60,
    height: 2,
    backgroundColor: '#2196F3',
    marginTop: 4,
  },
  durationText: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  flightDivider: {
    marginTop: 16,
  },
  dayOffContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  dayOffText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 16,
  },
  dayOffType: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
});
