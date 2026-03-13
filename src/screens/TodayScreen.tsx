import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../constants/Colors';

const TodayScreen = () => {
  const [history, setHistory] = useState<any[]>([]); // Mock history for now as no add-trip flow defined

  const deleteHistory = () => {
    Alert.alert('Delete History', 'Kharch history delete karaychi aahe?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setHistory([]) }
    ]);
  };

  const renderStatTile = (label: string, value: string, color: string, icon: string) => (
    <View style={styles.statTile}>
      <Icon name={icon} size={24} color={color} style={{marginBottom: 8}} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={[styles.statLabel, {color: color}]}>{label}</Text>
    </View>
  );

  const renderHourBar = (hour: string, height: number, color: string) => (
    <View style={styles.barContainer}>
      <View style={[styles.bar, {height: height, backgroundColor: color}]} />
      <Text style={styles.barLabel}>{hour}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{paddingBottom: 20}}>
        
        {/* Stats Grid */}
        <View style={styles.grid}>
          {renderStatTile('Ghetlya', '12', Colors.green, 'check-circle')}
          {renderStatTile('Sodlya', '5', Colors.red, 'close-circle')}
          {renderStatTile('Total Trips', '17', Colors.blue, 'taxi')}
          {renderStatTile('Vachavle', '₹450', Colors.yellow, 'cash')}
        </View>

        {/* Smart Working Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🕐 Smart Working Hours</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScroll}>
            {['5am', '6am', '7am', '8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm', '10pm', '11pm'].map((h, i) => {
              // Mock data logic for colors/heights
              let height = 40 + Math.random() * 60;
              let color = Colors.yellow;
              if (['9am', '10am', '5pm', '6pm', '9pm'].includes(h)) {
                height = 90;
                color = Colors.green;
              } else if (['1pm', '2pm', '3pm'].includes(h)) {
                 height = 30;
                 color = Colors.red;
              }
              return <View key={h}>{renderHourBar(h, height, color)}</View>;
            })}
          </ScrollView>
          
          <View style={styles.peakCard}>
             <Text style={{color: Colors.orange, fontWeight: 'bold'}}>🔥 Peak Hours: 9am, 10am, 2pm, 3pm, 4pm, 5pm, 9pm</Text>
          </View>
        </View>

        {/* Trip History */}
        <View style={styles.section}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>MAGCHYA SAHAL</Text>
            {history.length > 0 && (
              <TouchableOpacity onPress={deleteHistory}>
                <Icon name="trash-can" size={20} color={Colors.red} />
              </TouchableOpacity>
            )}
          </View>

          {history.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="history" size={40} color={Colors.surface2} />
              <Text style={{color: Colors.textMuted, marginTop: 10}}>Abhi koi trip nahi</Text>
            </View>
          ) : (
            history.map((item, index) => (
              <View key={index} style={styles.historyItem}>
                <Text style={{color: '#fff'}}>Trip Item</Text>
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  statTile: {
    width: '48%',
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  chartScroll: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  barContainer: {
    alignItems: 'center',
    marginRight: 10,
    justifyContent: 'flex-end',
    height: 120,
  },
  bar: {
    width: 20,
    borderRadius: 4,
    marginBottom: 5,
  },
  barLabel: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  peakCard: {
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.orange,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: Colors.surface2,
  },
  historyItem: {
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
});

export default TodayScreen;
