import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import { getRules, DriverRules } from '../storage/DriverRules';
import { parseNotification } from '../engine/NotificationParser';
import { analyzeTrip, AnalysisResult } from '../engine/TripAnalyzer';
import { calculateProfit } from '../engine/ProfitCalculator';
import AikaSaathi from '../voice/AikaSaathi';

const OLA_SAMPLE = `Ola - New Ride Request
Pickup: Shivaji Nagar Metro, Pune
Drop: Hinjewadi Phase 1, Pune
Fare: ₹185
Pickup distance: 2.3 km`;

const UBER_SAMPLE = `Uber - New Trip Request
Trip from: FC Road, Pune
Trip to: Baner Road, Pune
Estimated fare: ₹95
Your location to pickup: 4.8 km`;

const SmartAdviceScreen = () => {
  const [rules, setRules] = useState<DriverRules | null>(null);
  const [inputText, setInputText] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [tripDetails, setTripDetails] = useState<any>(null);
  const [profitDetails, setProfitDetails] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      loadRules();
    }, [])
  );

  const loadRules = async () => {
    const r = await getRules();
    setRules(r);
  };

  const handleAnalyze = () => {
    if (!inputText.trim() || !rules) return;

    const parsedTrip = parseNotification(inputText);
    if (!parsedTrip.isParsed) {
      Alert.alert('Error', 'Could not parse notification text. Please try again.');
      return;
    }

    const result = analyzeTrip(parsedTrip, rules);
    const profit = calculateProfit(parsedTrip.fare, parsedTrip.tripDistance, parsedTrip.pickupDistance, rules);

    setTripDetails(parsedTrip);
    setAnalysis(result);
    setProfitDetails(profit);

    // Speak advice
    AikaSaathi.speakAdvice(result.score, parsedTrip.fare, rules);
  };

  const reset = () => {
    setInputText('');
    setAnalysis(null);
    setTripDetails(null);
    setProfitDetails(null);
  };

  const getVerdictColor = (verdict: string) => {
    if (verdict === 'good') return Colors.green;
    if (verdict === 'average') return Colors.yellow;
    return Colors.red;
  };

  if (!rules) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      {/* Header Chips */}
      <View style={styles.headerChips}>
        <RuleChip label={`MIN ₹${rules.minFare}`} />
        <RuleChip label={`MAX ${rules.maxPickupKm}km`} />
        <RuleChip label={`MIN ₹${rules.minRatePerKm}/km`} />
      </View>

      <ScrollView contentContainerStyle={{paddingBottom: 20}}>
        {!analysis ? (
          <>
            {/* Waiting State */}
            <View style={styles.waitingCard}>
              <Icon name="lightning-bolt" size={50} color={Colors.blue} style={styles.pulsingIcon} />
              <Text style={styles.waitingTitle}>Trip chi Vat Paahat Aahe...</Text>
              <Text style={styles.waitingSub}>Vartil notification text paste karoon Sahal Ghya var tap kara</Text>
            </View>

            {/* Input Area */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Notification Paste Kara</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ola/Uber notification text itha paste kara..."
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={6}
                value={inputText}
                onChangeText={setInputText}
              />
            </View>

            {/* Analyze Button */}
            <TouchableOpacity 
              style={[styles.analyzeBtn, !inputText.trim() && {opacity: 0.5}]} 
              disabled={!inputText.trim()}
              onPress={handleAnalyze}
            >
              <Text style={styles.analyzeBtnText}>🔍 Sahal Ghya</Text>
            </TouchableOpacity>

            {/* Samples */}
            <View style={styles.samplesRow}>
              <TouchableOpacity style={[styles.sampleBtn, {borderColor: Colors.yellow}]} onPress={() => setInputText(OLA_SAMPLE)}>
                <Text style={{color: Colors.yellow}}>🟡 Ola Sample Bagha</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.sampleBtn, {borderColor: Colors.green}]} onPress={() => setInputText(UBER_SAMPLE)}>
                <Text style={{color: Colors.green}}>🟢 Uber Sample Bagha</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={[styles.resultCard, {borderColor: getVerdictColor(analysis.verdict)}]}>
            {/* Badge */}
            <View style={[styles.scoreBadge, {backgroundColor: getVerdictColor(analysis.verdict)}]}>
              <Text style={styles.scoreText}>{analysis.score}% MATCH</Text>
            </View>

            <Text style={styles.platformText}>{tripDetails.platform}</Text>
            <Text style={styles.routeText}>{tripDetails.pickup} → {tripDetails.drop}</Text>
            
            <View style={styles.statRow}>
              <Text style={styles.fareText}>₹{tripDetails.fare}</Text>
              <Text style={styles.rateText}>₹{(tripDetails.fare / (tripDetails.tripDistance || 1)).toFixed(1)}/km</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.profitGrid}>
              <ProfitItem label="Commission" value={`-₹${profitDetails.commission}`} />
              <ProfitItem label="Fuel Cost" value={`-₹${profitDetails.fuelCost}`} />
              <ProfitItem label="Net Profit" value={`₹${profitDetails.netProfit}`} highlight />
            </View>

            {analysis.reasons.length > 0 && (
               <View style={styles.reasonsContainer}>
                 {analysis.reasons.map((r: string, i: number) => (
                   <Text key={i} style={styles.reasonText}>• {r}</Text>
                 ))}
               </View>
            )}

            <View style={[styles.verdictBanner, {backgroundColor: getVerdictColor(analysis.verdict) + '20'}]}>
              <Text style={[styles.verdictText, {color: getVerdictColor(analysis.verdict)}]}>
                {analysis.verdict === 'good' ? '🔥 भाडं पकडा! सर्व नियम पास — घुकत जा' : 
                 analysis.verdict === 'average' ? '⚠️ THEEK AAHE — Vichar Kara' : 
                 '❌ VAAIT TRIP — Sod!'}
              </Text>
            </View>

            <TouchableOpacity style={styles.resetBtn} onPress={reset}>
              <Text style={styles.resetBtnText}>🔄 New Analysis</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const RuleChip = ({label}: any) => (
  <View style={styles.chip}>
    <Text style={styles.chipText}>{label}</Text>
  </View>
);

const ProfitItem = ({label, value, highlight}: any) => (
  <View style={{alignItems: 'center'}}>
    <Text style={{color: Colors.textMuted, fontSize: 12}}>{label}</Text>
    <Text style={{color: highlight ? Colors.green : '#fff', fontWeight: 'bold', fontSize: 16}}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  headerChips: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  chip: {
    borderWidth: 1,
    borderColor: Colors.textMuted,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  waitingCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  pulsingIcon: {
    marginBottom: 15,
  },
  waitingTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  waitingSub: {
    color: Colors.textMuted,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#fff',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontFamily: 'monospace',
    textAlignVertical: 'top',
  },
  analyzeBtn: {
    backgroundColor: Colors.green,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  analyzeBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 18,
  },
  samplesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  sampleBtn: {
    flex: 1,
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  resultCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    position: 'relative',
    marginTop: 10,
  },
  scoreBadge: {
    position: 'absolute',
    top: -15,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  platformText: {
    color: Colors.textMuted,
    fontSize: 14,
    textTransform: 'uppercase',
  },
  routeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 16,
  },
  fareText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  rateText: {
    color: Colors.textMuted,
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.surface2,
    marginBottom: 16,
  },
  profitGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  reasonsContainer: {
    backgroundColor: Colors.surface2,
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  reasonText: {
    color: Colors.orange,
    marginBottom: 4,
  },
  verdictBanner: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  verdictText: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  resetBtn: {
    backgroundColor: Colors.surface2,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default SmartAdviceScreen;
