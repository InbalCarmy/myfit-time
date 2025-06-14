import React, { useState } from 'react';
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
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('שגיאה', 'נא למלא את כל השדות הנדרשים.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('שגיאה', 'הסיסמאות אינן תואמות');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('נרשמת בהצלחה!');
      navigation.navigate('Home'); // או Login אם את רוצה שיתחברו בנפרד
    } catch (error: any) {
      console.error(error);
      Alert.alert('שגיאה', error.message);
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
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Name"
              placeholderTextColor="#8D8282"
              style={styles.input}
            />
            <Text style={styles.required}>*</Text>
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Email"
              placeholderTextColor="#8D8282"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />
            <Text style={styles.required}>*</Text>
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Password"
              placeholderTextColor="#8D8282"
              secureTextEntry
              style={styles.input}
              value={password}
              onChangeText={setPassword}
            />
            <Text style={styles.required}>*</Text>
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Password Verification"
              placeholderTextColor="#8D8282"
              secureTextEntry
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <Text style={styles.required}>*</Text>
          </View>

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>Register</Text>
          </TouchableOpacity>

          <View style={styles.loginWrapper}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    </ImageBackground>
  );
};

export default RegisterScreen;

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
  inputWrapper: {
    width: '75%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    fontSize: 18,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  required: {
    color: 'red',
    fontSize: 20,
    fontFamily: 'Nunito_700Bold',
    marginLeft: 5,
  },
  loginWrapper: {
    flexDirection: 'row',
    marginTop: 5,
  },
  loginText: {
    fontSize: 14,
    color: '#444',
    fontFamily: 'Nunito_400Regular',
  },
  loginLink: {
    fontSize: 14,
    color: '#3F7102',
    fontFamily: 'Nunito_800ExtraBold',
  },
  registerButton: {
    width: '50%',
    backgroundColor: 'rgba(63, 113, 2, 0.6)',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Nunito_800ExtraBold',
  },
});
