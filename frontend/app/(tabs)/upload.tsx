import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRosterStore } from '../../src/store/rosterStore';

export default function UploadScreen() {
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { uploadRosterData } = useRosterStore();

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant permission to access your photos to upload roster images.'
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImagePickerAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select an image first.');
      return;
    }

    setUploading(true);

    try {
      // For now, we'll upload sample data
      // OCR implementation will be added later
      Alert.alert(
        'Upload Complete',
        'OCR feature is being developed. Sample data has been loaded for demonstration.',
        [
          {
            text: 'OK',
            onPress: () => {
              setSelectedImage(null);
              loadSampleData();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error uploading:', error);
      Alert.alert('Upload Failed', 'Failed to upload roster. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const loadSampleData = async () => {
    setUploading(true);
    try {
      // Sample data from the provided roster
      const sampleRoster = [
        {
          date: '01-JUN-2026',
          day: 'Mon',
          is_day_off: true,
          off_type: 'D',
          flights: [],
        },
        {
          date: '02-JUN-2026',
          day: 'Tue',
          is_day_off: true,
          off_type: 'D',
          flights: [],
        },
        {
          date: '03-JUN-2026',
          day: 'Wed',
          duty_start_time: '06:05',
          duty_end_time: '12:15',
          duty_hours: '06:10',
          is_day_off: false,
          flights: [
            {
              flight_number: 'MH 2542',
              dep_airport: 'KUL',
              dep_time: '07:20',
              arr_airport: 'KCH',
              arr_time: '09:10',
              work_type: 'OP',
              block_hours: '01:50',
              aircraft_type: '73H',
            },
            {
              flight_number: 'MH 2543',
              dep_airport: 'KCH',
              dep_time: '09:55',
              arr_airport: 'KUL',
              arr_time: '11:45',
              work_type: 'OP',
              block_hours: '01:50',
              aircraft_type: '73H',
            },
          ],
        },
        {
          date: '04-JUN-2026',
          day: 'Thu',
          is_day_off: true,
          off_type: 'AL',
          flights: [],
        },
        {
          date: '05-JUN-2026',
          day: 'Fri',
          is_day_off: true,
          off_type: 'D',
          flights: [],
        },
        {
          date: '06-JUN-2026',
          day: 'Sat',
          duty_start_time: '06:35',
          duty_end_time: '16:05',
          duty_hours: '09:30',
          is_day_off: false,
          flights: [
            {
              flight_number: 'MH 601',
              dep_airport: 'KUL',
              dep_time: '07:50',
              arr_airport: 'SIN',
              arr_time: '09:05',
              work_type: 'OP',
              block_hours: '01:15',
              aircraft_type: '7M8',
            },
            {
              flight_number: 'MH 604',
              dep_airport: 'SIN',
              dep_time: '09:55',
              arr_airport: 'KUL',
              arr_time: '11:10',
              work_type: 'OP',
              block_hours: '01:15',
              aircraft_type: '7M8',
            },
            {
              flight_number: 'MH 2614',
              dep_airport: 'KUL',
              dep_time: '12:55',
              arr_airport: 'BKI',
              arr_time: '15:35',
              work_type: 'OP',
              block_hours: '02:40',
              aircraft_type: '73H',
            },
          ],
        },
        {
          date: '07-JUN-2026',
          day: 'Sun',
          duty_start_time: '05:50',
          duty_end_time: '14:20',
          duty_hours: '08:30',
          is_day_off: false,
          flights: [
            {
              flight_number: 'MH 2603',
              dep_airport: 'BKI',
              dep_time: '06:50',
              arr_airport: 'KUL',
              arr_time: '09:25',
              work_type: 'OP',
              block_hours: '02:35',
              aircraft_type: '73H',
            },
            {
              flight_number: 'MH 7322',
              dep_airport: 'KUL',
              dep_time: '11:00',
              arr_airport: 'KBR',
              arr_time: '12:05',
              work_type: 'OP',
              block_hours: '01:05',
              aircraft_type: '73H',
            },
            {
              flight_number: 'MH 7323',
              dep_airport: 'KBR',
              dep_time: '12:40',
              arr_airport: 'KUL',
              arr_time: '13:50',
              work_type: 'OP',
              block_hours: '01:10',
              aircraft_type: '73H',
            },
          ],
        },
        {
          date: '08-JUN-2026',
          day: 'Mon',
          duty_start_time: '12:15',
          duty_end_time: '19:55',
          duty_hours: '07:40',
          is_day_off: false,
          flights: [
            {
              flight_number: 'MH 721',
              dep_airport: 'KUL',
              dep_time: '13:45',
              arr_airport: 'CGK',
              arr_time: '15:05',
              work_type: 'OP',
              block_hours: '02:20',
              aircraft_type: '332',
            },
            {
              flight_number: 'MH 720',
              dep_airport: 'CGK',
              dep_time: '16:05',
              arr_airport: 'KUL',
              arr_time: '19:25',
              work_type: 'OP',
              block_hours: '02:20',
              aircraft_type: '332',
            },
          ],
        },
      ];

      await uploadRosterData(sampleRoster);
      Alert.alert('Success', 'Sample roster data loaded successfully!');
    } catch (error) {
      console.error('Error loading sample data:', error);
      Alert.alert('Error', 'Failed to load sample data.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="cloud-upload" size={64} color="#2196F3" />
            </View>
            <Text style={styles.title}>Upload Roster</Text>
            <Text style={styles.subtitle}>
              Upload a photo of your monthly roster to automatically extract flight schedules.
            </Text>

            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={pickImage}
                icon="image"
                style={styles.button}
                disabled={uploading}
              >
                Select Image
              </Button>

              {selectedImage && (
                <View style={styles.selectedImageContainer}>
                  <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" />
                  <Text style={styles.selectedImageText}>Image selected</Text>
                </View>
              )}

              {selectedImage && (
                <Button
                  mode="contained"
                  onPress={uploadImage}
                  icon="upload"
                  style={[styles.button, styles.uploadButton]}
                  disabled={uploading}
                  loading={uploading}
                >
                  Upload & Process
                </Button>
              )}
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Try Sample Data</Text>
            <Text style={styles.cardText}>
              Load sample roster data to explore the app features.
            </Text>
            <Button
              mode="outlined"
              onPress={loadSampleData}
              icon="download"
              style={styles.button}
              disabled={uploading}
              loading={uploading}
            >
              Load Sample Roster
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Supported Formats</Text>
            <View style={styles.formatList}>
              <View style={styles.formatItem}>
                <MaterialCommunityIcons name="check" size={20} color="#4CAF50" />
                <Text style={styles.formatText}>JPEG images</Text>
              </View>
              <View style={styles.formatItem}>
                <MaterialCommunityIcons name="check" size={20} color="#4CAF50" />
                <Text style={styles.formatText}>PNG images</Text>
              </View>
              <View style={styles.formatItem}>
                <MaterialCommunityIcons name="information" size={20} color="#FF9800" />
                <Text style={styles.formatText}>Clear, well-lit photos work best</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
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
  card: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    elevation: 2,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    marginVertical: 8,
  },
  uploadButton: {
    backgroundColor: '#4CAF50',
  },
  selectedImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
  },
  selectedImageText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  formatList: {
    gap: 12,
  },
  formatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formatText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
});
