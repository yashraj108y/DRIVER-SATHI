import Tts from 'react-native-tts';
import { DriverRules } from '../storage/DriverRules';

class AikaSaathi {
  constructor() {
    Tts.getInitStatus().then(() => {
      Tts.setDefaultRate(0.5);
      Tts.setDefaultPitch(1.0);
    }, (err) => {
      if (err.code === 'no_engine') {
        Tts.requestInstallEngine();
      }
    });
  }

  speakAdvice(score: number, fare: number, rules: DriverRules) {
    if (!rules.voiceEnabled) return;
    if (rules.voiceHighMatchOnly && score < 80) return;

    let language = 'mr-IN';
    if (rules.language === 'hi') language = 'hi-IN';
    if (rules.language === 'en') language = 'en-IN';

    // Tts.setDefaultLanguage(language); // This might fail if lang not installed, let's try-catch or set best effort

    // Simple heuristic messages
    let message = '';
    
    if (rules.language === 'mr') {
      if (score >= 75) {
        message = `भाडं चांगलं आहे. ${score} टक्के match! ${fare} रुपये — घ्या!`;
      } else if (score >= 45) {
        message = `ठीक आहे. विचार करा.`;
      } else {
        message = `वाईट भाडं. सोडा!`;
      }
    } else if (rules.language === 'hi') {
      if (score >= 75) {
        message = `Ride acchi hai. ${score} percent match! ${fare} rupaye — Lijiye!`;
      } else if (score >= 45) {
        message = `Theek hai. Soch lijiye.`;
      } else {
        message = `Bekaar ride hai. Chhod dijiye!`;
      }
    } else {
       if (score >= 75) {
        message = `Good ride. ${score} percent match! ${fare} rupees — Take it!`;
      } else if (score >= 45) {
        message = `It's okay. Think about it.`;
      } else {
        message = `Bad ride. Skip it!`;
      }
    }

    Tts.speak(message);
  }
}

export default new AikaSaathi();
