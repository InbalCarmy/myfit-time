import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

const WelcomeScreen = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  return (
    <ImageBackground
  source={require('../assets/welcome-bg.png')}
  style={styles.background}
  resizeMode="cover"
>
  <View style={styles.container}>
    <View style={styles.logoContainer}>
      {/* <Text style={styles.logo}>
        <Text style={styles.logoMy}>My</Text>
        <Text style={styles.logoFitTime}>FitTime.</Text>
      </Text> */}
          
        <View style={styles.logoRow}>
          <Text style={styles.logoMy}>My</Text>
          <Text style={styles.logoFitTime}>FitTime.</Text>
        </View>

      <Text style={styles.subtitle}>
        Manage your time.{"\n"}Take care of your body.
      </Text>
    </View>

    <TouchableOpacity
      style={styles.button}
      onPress={() => navigation.navigate('Login')}
    >
      <Text style={styles.buttonText}>Get Started</Text>
    </TouchableOpacity>

    <Text style={styles.registerText}>
      Don’t have an account?{' '}
      <Text
        style={styles.registerLink}
        onPress={() => navigation.navigate('Register')}
      >
        Register
      </Text>
    </Text>
  </View>
</ImageBackground>

  );
};

export default WelcomeScreen;


const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 100,
    alignItems: 'flex-start',
  },
  
  logoContainer: {
    marginBottom: 40,
    marginTop: -30,
  },
  logo: {
    flexDirection: 'row',
    fontFamily: 'Nunito_700Bold',
  },
  logoMy: {
    fontSize: 42,
    color: '#3F7102',
    fontFamily: 'Nunito_800ExtraBold_Italic',
  },
  logoFitTime: {
    fontSize: 32,
    color: '#6FAE21',
    fontFamily: 'Nunito_800ExtraBold_Italic',
  },
  subtitle: {
    fontSize: 17,
    color: '#fff',
    fontFamily: 'Nunito_500Medium_Italic',
    marginTop: -5,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 100,
    alignSelf: 'center',
    marginBottom: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    
  },
  buttonText: {
    fontSize: 20,
    color: '#8D8282',
    fontWeight: '500',
    fontFamily: 'Nunito_800ExtraBold',

  },
  registerText: {
    fontSize: 14,
    color: '#666',
    alignSelf: 'center',
    fontFamily: 'Nunito_400Regular',

  },
  registerLink: {
    color: '#fff',
    fontFamily: 'Nunito_800ExtraBold',
  },
  logoRow: {
  flexDirection: 'row',
  alignItems: 'center',
},

});