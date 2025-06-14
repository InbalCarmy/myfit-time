import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import LogoHeader from '../components/LogoHeader';

const CalendarScreen: React.FC = () => {
  return (
    <ImageBackground
      source={require('../assets/welcome-bg.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <>
        <LogoHeader />
        <View style={styles.overlay}>
          <Text style={styles.text}>This is the Calendar Screen</Text>
        </View>
      </>
    </ImageBackground>
  );
};

export default CalendarScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  text: {
    fontSize: 22,
    fontFamily: 'Nunito_700Bold',
    color: '#3F7102',
  },
});
