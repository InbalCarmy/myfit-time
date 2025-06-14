import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const LogoHeader = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>
        <Text style={styles.my}>My</Text>
        <Text style={styles.fitTime}>FitTime</Text>
      </Text>
    </View>
  );
};

export default LogoHeader;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50, // מרחק מהחלק העליון של המסך
    left: 20,
    zIndex: 100, // שיהיה תמיד מעל
  },
  logo: {
    flexDirection: 'row',
  },
  my: {
    fontSize: 30,
    color: '#3F7102',
    fontFamily: 'Nunito_800ExtraBold_Italic',
  },
  fitTime: {
    fontSize: 20,
    color: '#6FAE21',
    fontFamily: 'Nunito_800ExtraBold_Italic',
  },
});
