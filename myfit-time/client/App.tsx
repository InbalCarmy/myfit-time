// import { StatusBar } from 'expo-status-bar';
// import { StyleSheet, Text, View } from 'react-native';

// export default function App() {
//   return (
//     <View style={styles.container}>
//       <Text>Open up App.tsx to start working on your app!</Text>
//       <StatusBar style="auto" />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Nunito_400Regular, Nunito_800ExtraBold, Nunito_800ExtraBold_Italic, Nunito_500Medium_Italic } from '@expo-google-fonts/nunito';
import { Overlock_400Regular, Overlock_900Black } from '@expo-google-fonts/overlock';


import AppNavigator from './navigation/AppNavigator'; // ← זה צריך להיות בשימוש, לא BottomTabs

export default function App() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_800ExtraBold,
    Nunito_800ExtraBold_Italic,
    Nunito_500Medium_Italic,
    Overlock_400Regular,
    Overlock_900Black,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <AppNavigator /> {/* ← זה יפתח לפי ה־initialRouteName שכתבת בקובץ AppNavigator */}
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}