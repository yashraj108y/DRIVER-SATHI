import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput, Alert, ToastAndroid } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import { getRules, saveRules, DriverRules } from '../storage/DriverRules';
import { calculateProfit } from '../engine/ProfitCalculator';

const MyRulesScreen = () => {
  const [rules, setRules] = useState<DriverRules | null>(null);
  
  // Local state for calculator preview
  const [calcFare, setCalcFare] = useState('200');
  const [calcDist, setCalcDist] = useState('15');

  useFocusEffect(
    useCallback(() => {
      loadRules();
    }, [])
  );

  const loadRules = async () => {
    const r = await getRules();
    setRules(r);
  };

  const handleSave = async () => {
    if (rules) {
      await saveRules(rules);
      ToastAndroid.show('Niyam saave jhale! ✅', ToastAndroid.SHORT);
    }
  };

  const updateRule = (key: keyof DriverRules, value: any) => {
    if (rules) {
      setRules({ ...rules, [key]: value });
    }
  };

  const setWorkMode = (mode: 'safe' | 'hardwork') => {
    if (!rules) return;
    if (mode === 'safe') {
      setRules({ ...rules, workMode: 'safe', minFare: 100, maxPickupKm: 2, minRatePerKm: 15 });
    } else {
      setRules({ ...rules, workMode: 'hardwork', minFare: 65, maxPickupKm: 5, minRatePerKm: 10 });
    }
  };

  if (!rules) return <View style={styles.container} />;

  // Calculator preview logic
  const profitPreview = calculateProfit(
    parseInt(calcFare) || 0, 
    parseInt(calcDist) || 0, 
    0, 
    rules
  );

  return (
    <View style={styles.container}>
       <View style={styles.header}>
         <View style={styles.proBadge}><Text style={styles.proText}>PRO</Text></View>
         <Text style={styles.headerTitle}>Maze Niyam</Text>
       </View>

       <ScrollView contentContainerStyle={{paddingBottom: 80}}>
         
         {/* Work Mode */}
         <SectionTitle icon="briefcase" title="WORK MODE" />
         <View style={styles.row}>
            <ModeBtn 
              title="🛡️ Safe Mode" 
              sub="Min ₹100 • 2km" 
              selected={rules.workMode === 'safe'} 
              onPress={() => setWorkMode('safe')} 
            />
            <ModeBtn 
              title="💪 Hardwork" 
              sub="Min ₹65 • 5km" 
              selected={rules.workMode === 'hardwork'} 
              onPress={() => setWorkMode('hardwork')} 
            />
         </View>

         {/* Voice */}
         <SectionTitle icon="microphone" title="VOICE" />
         <ToggleRow 
           label="आवाज सल्ला चालू करा" 
           value={rules.voiceEnabled} 
           onValueChange={(v: boolean) => updateRule('voiceEnabled', v)} 
         />
         <ToggleRow 
           label=">80% match साठीच बोला" 
           value={rules.voiceHighMatchOnly} 
           disabled={!rules.voiceEnabled}
           onValueChange={(v: boolean) => updateRule('voiceHighMatchOnly', v)} 
         />
         <Text style={styles.tipText}>Tip: Bubble mute thevnyasathi he vapra</Text>

         {/* Display */}
         <SectionTitle icon="cellphone" title="DISPLAY" />
         <ToggleRow 
           label="Compact Pill Mode" 
           value={rules.compactPillMode} 
           onValueChange={(v: boolean) => updateRule('compactPillMode', v)} 
         />

         {/* Weekly Goal */}
         <SectionTitle icon="target" title="WEEKLY GOAL" />
         <View style={styles.card}>
           <Text style={styles.goalValue}>₹{rules.weeklyGoal}</Text>
           <View style={styles.stepperRow}>
             <TouchableOpacity style={styles.stepBtn} onPress={() => updateRule('weeklyGoal', Math.max(1000, rules.weeklyGoal - 500))}>
               <Icon name="minus" size={20} color="#fff" />
             </TouchableOpacity>
             <Text style={{color: Colors.textMuted}}>Adjust Goal</Text>
             <TouchableOpacity style={styles.stepBtn} onPress={() => updateRule('weeklyGoal', Math.min(20000, rules.weeklyGoal + 500))}>
               <Icon name="plus" size={20} color="#fff" />
             </TouchableOpacity>
           </View>
         </View>

         {/* Nifa Calculator */}
         <SectionTitle icon="calculator" title="NIFA CALCULATOR" />
         <View style={styles.card}>
            <View style={styles.fuelRow}>
              {['cng', 'petrol', 'diesel', 'ev'].map((f) => (
                <TouchableOpacity 
                  key={f} 
                  style={[styles.fuelBtn, rules.fuelType === f && {borderColor: Colors.green, backgroundColor: Colors.green + '20'}]}
                  onPress={() => updateRule('fuelType', f)}
                >
                  <Text style={{color: '#fff', textTransform: 'uppercase', fontSize: 10}}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputRow}>
              <Text style={{color: Colors.textMuted}}>Fuel Cost/Unit: ₹</Text>
              <TextInput 
                style={styles.smallInput} 
                keyboardType="numeric"
                value={rules.fuelCostPerUnit.toString()}
                onChangeText={(t) => updateRule('fuelCostPerUnit', parseInt(t) || 0)}
              />
            </View>

            <View style={styles.commRow}>
              <Text style={{color: Colors.textMuted}}>Commission:</Text>
              {[20, 22, 25].map(c => (
                <TouchableOpacity 
                  key={c}
                  style={[styles.commBtn, rules.commissionPct === c && {backgroundColor: Colors.blue}]}
                  onPress={() => updateRule('commissionPct', c)}
                >
                  <Text style={{color: '#fff'}}>{c}%</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.previewBox}>
              <Text style={{color: Colors.textMuted, marginBottom: 5}}>Live Preview (₹200 fare, 15km):</Text>
              <Text style={{color: Colors.green, fontWeight: 'bold'}}>Profit: ₹{profitPreview.netProfit}</Text>
              <Text style={{color: Colors.textMuted, fontSize: 10}}>Fuel: -₹{profitPreview.fuelCost} | Comm: -₹{profitPreview.commission}</Text>
            </View>
         </View>

         {/* Platform */}
         <SectionTitle icon="car" title="PLATFORM" />
         <ToggleRow 
           label="Ola Trips" 
           value={rules.olaEnabled} 
           onValueChange={(v: boolean) => updateRule('olaEnabled', v)} 
         />
         <ToggleRow 
           label="Uber Trips" 
           value={rules.uberEnabled} 
           onValueChange={(v: boolean) => updateRule('uberEnabled', v)} 
         />

         {/* Language */}
         <SectionTitle icon="translate" title="LANGUAGE" />
         <View style={styles.row}>
            {['en', 'mr', 'hi'].map(l => (
              <TouchableOpacity 
                key={l}
                style={[styles.langBtn, rules.language === l && {backgroundColor: Colors.purple}]}
                onPress={() => updateRule('language', l)}
              >
                <Text style={{color: '#fff', textTransform: 'uppercase'}}>{l === 'mr' ? 'मराठी' : l === 'hi' ? 'हिंदी' : 'ENG'}</Text>
              </TouchableOpacity>
            ))}
         </View>

         {/* Summary */}
         <View style={[styles.card, {marginTop: 20}]}>
           <Text style={{color: Colors.textMuted, marginBottom: 10}}>Current Rules Summary:</Text>
           <Text style={{color: '#fff'}}>Min Fare: ₹{rules.minFare}</Text>
           <Text style={{color: '#fff'}}>Max Pickup: {rules.maxPickupKm}km</Text>
           <Text style={{color: '#fff'}}>Min Rate: ₹{rules.minRatePerKm}/km</Text>
         </View>

       </ScrollView>

       <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
         <Text style={styles.saveBtnText}>💾 Niyam Save Kara</Text>
       </TouchableOpacity>
    </View>
  );
};

const SectionTitle = ({icon, title}: any) => (
  <View style={styles.sectionHeader}>
    <Icon name={icon} size={18} color={Colors.blue} />
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const ModeBtn = ({title, sub, selected, onPress}: any) => (
  <TouchableOpacity 
    style={[styles.modeBtn, selected && {borderColor: Colors.green, backgroundColor: Colors.green + '10'}]}
    onPress={onPress}
  >
    <Text style={[styles.modeBtnTitle, selected && {color: Colors.green}]}>{title}</Text>
    <Text style={styles.modeBtnSub}>{sub}</Text>
  </TouchableOpacity>
);

const ToggleRow = ({label, value, onValueChange, disabled}: any) => (
  <View style={[styles.toggleRow, disabled && {opacity: 0.5}]}>
    <Text style={styles.toggleLabel}>{label}</Text>
    <Switch 
      value={value} 
      onValueChange={onValueChange} 
      trackColor={{false: Colors.surface2, true: Colors.green + '50'}}
      thumbColor={value ? Colors.green : Colors.textMuted}
      disabled={disabled}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  proBadge: {
    backgroundColor: Colors.blue,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  proText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    gap: 10,
  },
  sectionTitle: {
    color: Colors.blue,
    fontWeight: 'bold',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  modeBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modeBtnTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modeBtnSub: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
  },
  toggleLabel: {
    color: '#fff',
    fontSize: 16,
  },
  tipText: {
    color: Colors.textMuted,
    fontSize: 12,
    marginLeft: 10,
  },
  card: {
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 8,
  },
  goalValue: {
    color: Colors.green,
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginTop: 10,
  },
  stepBtn: {
    backgroundColor: Colors.surface2,
    padding: 8,
    borderRadius: 20,
  },
  fuelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  fuelBtn: {
    backgroundColor: Colors.surface2,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    flex: 1,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  smallInput: {
    backgroundColor: Colors.surface2,
    color: '#fff',
    width: 60,
    textAlign: 'center',
    borderRadius: 4,
    padding: 4,
  },
  commRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  commBtn: {
    backgroundColor: Colors.surface2,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 4,
  },
  previewBox: {
    backgroundColor: Colors.background,
    padding: 10,
    borderRadius: 4,
  },
  langBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtn: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: Colors.blue,
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 5,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default MyRulesScreen;
