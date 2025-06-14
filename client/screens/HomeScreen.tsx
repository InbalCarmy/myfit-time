import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import LogoHeader from '../components/LogoHeader';
import MenuButton from '../components/MenuButton';


const HomeScreen: React.FC = () => {
  return (
    <ImageBackground
      source={require('../assets/welcome-bg.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <>
        <LogoHeader />
        <MenuButton />

        <View style={styles.overlay}>
          <Text style={styles.greetingTitle}>Good Morning Inbal!</Text>
          <Text style={styles.greetingSub}>Ready for today's workout?</Text>

          <Text style={styles.progressLabel}>Your weekly progress:</Text>
          <Text style={styles.progress}>● ● ● ○ ○ ○ ○   3/7</Text>

          <View style={styles.card}>
            <Text style={styles.cardText}>
              Your next workout:{"\n"}
              <Text style={{ fontWeight: 'bold' }}>Running</Text> | Tuesday, May 28 | 07:30
            </Text>
          </View>

          <TouchableOpacity style={styles.recommendationButton}>
            <Text style={styles.recommendationText}>★ Today’s Recommendation</Text>
          </TouchableOpacity>
        </View>
      </>
    </ImageBackground>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    paddingTop: 130,
    paddingHorizontal: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',

  },
  greetingTitle: {
    fontSize: 30,
    fontFamily: 'Overlock_900Black',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',

  },
  greetingSub: {
    fontSize: 22,
    fontFamily: 'Overlock_400Regular',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',

  },
  progressLabel: {
    fontFamily: 'Overlock_900Black',
    fontSize: 18,
    color: '#333',
    textAlign: 'center',

  },
  progress: {
    fontSize: 16,
    marginBottom: 20,
    color: '#3F7102',
    textAlign: 'center',

  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.70)',
    padding: 20,
    width: '90%',
    height: 100,
    alignSelf: 'center',
    borderRadius: 16,
    marginBottom: 20,
    elevation: 2,
  },
  cardText: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Overlock_400Regular',
    color: '#5C5353',
  },
  recommendationButton: {
    alignSelf: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 14,
    elevation: 3,
  },
  recommendationText: {
    fontFamily: 'Overlock_400Regular',
    fontSize: 16,
    color: '#5C5353',
  },
});
