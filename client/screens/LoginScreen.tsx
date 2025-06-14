import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import LogoHeader from '../components/LogoHeader';
import { Image } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('שגיאה', 'נא למלא את שני השדות');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate('Home');
    } catch (error: any) {
      console.error(error);
      Alert.alert('שגיאה', 'פרטי ההתחברות שגויים או שיש בעיה בשרת');
    }
  };

  return (
    <ImageBackground
      source={require('../assets/welcome-bg.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <>
        <LogoHeader />
        <View style={styles.overlay}>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#8D8282"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />

          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="#8D8282"
              style={styles.passwordInput}
            />

            {password !== '' && (
              <TouchableOpacity onPress={handleLogin} style={styles.arrowButton}>
                <Image
                  source={require('../assets/arrow-icon.png')}
                  style={styles.arrowIcon}
                />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.registerText}>
            Don’t have an account?{' '}
            <Text
              style={styles.registerLink}
              onPress={() => navigation.navigate('Register')}
            >
              Register
            </Text>
          </Text>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={() => console.log('Google sign in')}
          >
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>
        </View>
      </>
    </ImageBackground>
  );
};

export default LoginScreen;


const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 30,
    paddingTop: 100,
    alignItems: 'center',
  },
  logo: {
    marginBottom: 40,
  },
  input: {
    width: '75%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    fontSize: 18,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#000',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  registerText: {
    fontSize: 14,
    color: '#444',
    fontFamily: 'Nunito_400Regular',
    marginBottom: 20,
  },
  registerLink: {
    color: '#fff',
    fontFamily: 'Nunito_800ExtraBold',
  },
  googleButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 18,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    marginTop: 30,
  },
  googleButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: '#8D8282',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '75%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  passwordInput: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#000',
    paddingVertical: 10,
  },
  
  arrowButton: {
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 6,
    marginLeft: 10,
  },
  
  arrowIcon: {
    width: 18,
    height: 18,
    tintColor: '#5C5353',
  },
  
});
