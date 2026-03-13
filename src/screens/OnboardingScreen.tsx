import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Linking, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../constants/Colors';
import { setWorkMode, setOnboardingComplete } from '../storage/DriverRules';

const { width } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }: any) => {
  const [step, setStep] = useState(1);
  const [selectedMode, setSelectedMode] = useState<'safe' | 'hardwork' | 'custom' | null>(null);

  const nextStep = () => {
    if (step < 5) setStep(step + 1);
    else finishOnboarding();
  };

  const finishOnboarding = async () => {
    await setOnboardingComplete();
    navigation.replace('MainTabs');
  };

  const handleModeSelect = async (mode: 'safe' | 'hardwork' | 'custom') => {
    setSelectedMode(mode);
    await setWorkMode(mode);
  };

  const renderStep1 = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.badge}><Text style={styles.badgeText}>Jaldi Setup ⚡</Text></View>
      </View>
      
      <View style={styles.heroCircle}>
        <Icon name="taxi" size={80} color="#fff" />
        <View style={styles.checkBadge}>
            <Icon name="check" size={20} color="#fff" />
        </View>
      </View>

      <Text style={styles.title}>Driver Saathi मध्ये स्वागत आहे!</Text>
      <Text style={styles.subtitle}>आपली AI सुविधा सुरुवात. Ola/Uber मोठे येतील - 1 सेकंदात सल्लाः भाडे घ्यां की नाही! 💡</Text>

      <View style={styles.grid}>
        <FeatureTile icon="android" color="#EC407A" label="Android" />
        <FeatureTile icon="robot" color="#7C3AED" label="AI Mode" />
        <FeatureTile icon="percent" color="#00E676" label="Match %" />
        <FeatureTile icon="monitor-dashboard" color="#3B82F6" label="Monitor" />
      </View>

      <TouchableOpacity style={styles.button} onPress={nextStep}>
        <Text style={styles.buttonText}>पुढे →</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.container}>
      <Icon name="lock" size={60} color={Colors.orange} style={{alignSelf: 'center', marginBottom: 20}} />
      <Text style={styles.title}>2 परवानग्या द्या</Text>
      <Text style={styles.subtitle}>App सुरक्षीत चालण्यासाठी या दोन परवानग्या आवश्यक आहेत.</Text>

      <PermissionCard 
        title="Ola/Uber सूचना वाचण्यासाठी" 
        desc="Notification Access" 
        btnText="⚙️ Notification Settings उघडा" 
        color={Colors.orange}
        onPress={() => Linking.openSettings()} 
      />
      
      <PermissionCard 
        title="Floating pill दाखवण्यासाठी" 
        desc="Display Over Apps" 
        btnText="⚙️ Overlay Settings उघडा" 
        color={Colors.purple}
        onPress={() => Linking.openSettings()} 
      />

      <TouchableOpacity style={[styles.button, { backgroundColor: Colors.orange, marginTop: 40 }]} onPress={nextStep}>
        <Text style={styles.buttonText}>पुढे जा →</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.container}>
      <Icon name="target" size={60} color="#F43F5E" style={{alignSelf: 'center', marginBottom: 20}} />
      <Text style={styles.title}>तुमची कार्यशैली निवडा</Text>
      <Text style={styles.subtitle}>एक Mode निवडा - नंतर Settings मध्ये बदलता येते.</Text>

      <ScrollView style={{width: '100%', marginTop: 20}}>
        <ModeCard 
          title="सुरक्षित" 
          desc="फक्त चांगल्या trips साठी जा" 
          tag="Min ₹100 • Max 2km • Min ₹15/km" 
          icon="shield-check" 
          color={Colors.blue} 
          selected={selectedMode === 'safe'}
          onPress={() => handleModeSelect('safe')}
        />
        <ModeCard 
          title="मेहनती" 
          desc="जास्त trips घ्या सर्व भाडे accept करा" 
          tag="Min ₹65 • Max 5km • Min ₹10/km" 
          icon="arm-flex" 
          color={Colors.orange} 
          selected={selectedMode === 'hardwork'}
          onPress={() => handleModeSelect('hardwork')}
        />
        <ModeCard 
          title="सानुकूल" 
          desc="तुमचे खतःचे नियम Settings मध्ये configure करा" 
          tag="Settings मध्ये configure" 
          icon="cog" 
          color={Colors.purple} 
          selected={selectedMode === 'custom'}
          onPress={() => handleModeSelect('custom')}
        />
      </ScrollView>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: selectedMode ? Colors.purple : Colors.surface2 }]} 
        disabled={!selectedMode}
        onPress={nextStep}
      >
        <Text style={[styles.buttonText, {color: selectedMode ? '#fff' : Colors.textMuted}]}>Mode निवडा</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.container}>
      <View style={[styles.heroCircle, {borderColor: Colors.blue, borderWidth: 4}]}>
        <Text style={{fontSize: 40}}>🚕</Text>
        <View style={styles.hintLabel}><Text style={{color: '#fff', fontSize: 10}}>← हे टॅप करा</Text></View>
      </View>
      
      <Text style={styles.title}>Taxi Bubble तुमचा मित्र! 🚕</Text>
      <Text style={styles.subtitle}>स्क्रीनवर कुठेही दिसणारे हे चिन्ह – तुमचा control center</Text>

      <View style={{marginTop: 30, width: '100%'}}>
        <FeatureRow icon="drag" text="कुठेही drag करा - screen वर हलवा" />
        <FeatureRow icon="gesture-tap" text="Tap करा - नियम झटपट बदला" />
        <FeatureRow icon="lightning-bolt" text="Test करा - live simulation पहा" />
        <FeatureRow icon="bullseye-arrow" text="Match % - instant score दाखवतो" />
      </View>

      <TouchableOpacity style={[styles.button, { backgroundColor: Colors.blue, marginTop: 40 }]} onPress={nextStep}>
        <Text style={styles.buttonText}>पुढे →</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.container}>
      <Icon name="movie-open" size={60} color={Colors.textMuted} style={{alignSelf: 'center', marginBottom: 20}} />
      <Text style={styles.title}>Live Demo पहा!</Text>
      <Text style={styles.subtitle}>Ola सूचना येते तेव्हा Driver Saathi असे काम करतो:</Text>

      <View style={styles.demoCardWrapper}>
        <View style={[styles.demoCard, {borderColor: Colors.yellow}]}>
          <Text style={{color: Colors.yellow, fontWeight: 'bold'}}>🟡 Ola – New Ride Request</Text>
          <Text style={{color: '#fff'}}>Pickup: Shivaji Nagar Metro, Pune</Text>
          <Text style={{color: '#fff'}}>Fare: ₹185 • Pickup: 2.3km • Trip: 14.5km</Text>
        </View>

        <Icon name="arrow-down" size={30} color={Colors.textMuted} style={{alignSelf: 'center', marginVertical: 10}} />

        <View style={[styles.demoCard, {borderColor: Colors.green}]}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
             <View style={{backgroundColor: Colors.green, padding: 4, borderRadius: 4}}><Text style={{color: '#000', fontWeight: 'bold'}}>100% match</Text></View>
             <Text style={{color: Colors.green, fontWeight: 'bold'}}>₹141 नफा</Text>
          </View>
          <Text style={{color: Colors.green, fontWeight: 'bold', fontSize: 16, marginTop: 8}}>भाडं पकडा! 🔥 सर्व नियम पास — घुकत जा</Text>
          <View style={{backgroundColor: Colors.surface2, padding: 4, borderRadius: 12, marginTop: 8, alignSelf: 'flex-start'}}>
            <Text style={{color: Colors.green, fontSize: 12}}>🟢 हे Floating Pill आहे!</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={[styles.button, { backgroundColor: Colors.green, marginTop: 20 }]} onPress={finishOnboarding}>
        <Text style={[styles.buttonText, {color: '#000'}]}>🚀 App सुरू करा</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{flex: 1, backgroundColor: Colors.background, padding: 20}}>
       <View style={styles.progressDots}>
         {[1,2,3,4,5].map(i => (
           <View key={i} style={[styles.dot, {backgroundColor: i <= step ? Colors.green : Colors.surface2}]} />
         ))}
       </View>
       {step === 1 && renderStep1()}
       {step === 2 && renderStep2()}
       {step === 3 && renderStep3()}
       {step === 4 && renderStep4()}
       {step === 5 && renderStep5()}
    </View>
  );
};

const FeatureTile = ({icon, color, label}: any) => (
  <View style={styles.featureTile}>
    <Icon name={icon} size={30} color={color} />
    <Text style={styles.featureLabel}>{label}</Text>
  </View>
);

const PermissionCard = ({title, desc, btnText, color, onPress}: any) => (
  <View style={[styles.card, {borderLeftWidth: 4, borderLeftColor: color, marginTop: 15}]}>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardDesc}>{desc}</Text>
    <TouchableOpacity onPress={onPress} style={[styles.smallBtn, {backgroundColor: color + '20'}]}>
      <Text style={[styles.smallBtnText, {color: color}]}>{btnText}</Text>
    </TouchableOpacity>
  </View>
);

const ModeCard = ({title, desc, tag, icon, color, selected, onPress}: any) => (
  <TouchableOpacity onPress={onPress} style={[styles.modeCard, selected && {borderColor: color, borderWidth: 2}]}>
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      <Icon name={icon} size={40} color={color} />
      <View style={{marginLeft: 15, flex: 1}}>
        <Text style={styles.modeTitle}>{title}</Text>
        <Text style={styles.modeDesc}>{desc}</Text>
        <Text style={[styles.modeTag, {color: color}]}>{tag}</Text>
      </View>
      {selected && <Icon name="check-circle" size={24} color={color} />}
    </View>
  </TouchableOpacity>
);

const FeatureRow = ({icon, text}: any) => (
  <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15, backgroundColor: Colors.surface, padding: 15, borderRadius: 8}}>
    <Icon name={icon} size={24} color={Colors.textPrimary} />
    <Text style={{color: Colors.textPrimary, marginLeft: 15, fontSize: 16}}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDots: {
    flexDirection: 'row',
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  header: {
    marginBottom: 40,
  },
  badge: {
    backgroundColor: Colors.green + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: Colors.green,
    fontWeight: 'bold',
  },
  heroCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  checkBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: Colors.green,
    borderRadius: 12,
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    justifyContent: 'center',
    marginBottom: 40,
  },
  featureTile: {
    width: 70,
    height: 80,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 8,
  },
  button: {
    backgroundColor: Colors.green,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 18,
  },
  card: {
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 8,
    width: '100%',
  },
  cardTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardDesc: {
    color: Colors.textMuted,
    marginBottom: 10,
  },
  smallBtn: {
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  smallBtnText: {
    fontWeight: 'bold',
  },
  modeCard: {
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modeTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  modeDesc: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  modeTag: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: 'bold',
  },
  hintLabel: {
    position: 'absolute',
    top: -20,
    backgroundColor: Colors.green,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  demoCardWrapper: {
    width: '100%',
    marginBottom: 20,
  },
  demoCard: {
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
});

export default OnboardingScreen;
