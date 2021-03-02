/**
 * @format
 */

import React, {useCallback, useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  ActivityIndicator,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import DynamicLinkHandler from './DynamicLinkHandler';
import AsyncStorage from '@react-native-async-storage/async-storage';

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [email, setEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  const handleAuthStateChanged = useCallback(
    (newUser: FirebaseAuthTypes.User | null) => {
      setUser(newUser);
      if (initializing) {
        setInitializing(false);
      }
    },
    [initializing],
  );

  const sendEmail = useCallback(async () => {
    setSendingEmail(true);

    try {
      await auth().sendSignInLinkToEmail(email, {
        handleCodeInApp: true,
        url: 'https://fir-login-demo-2787e.web.app',
        dynamicLinkDomain: 'firebaselogindemo.rkb.io',
        iOS: {
          bundleId: 'io.rkb.firebaselogindemo',
        },
        android: {
          packageName: 'io.rkb.firebaselogindemo',
        },
      });

      Alert.alert(
        'Sign-in email sent!',
        `Open the link we sent to ${email} to sign in.`,
        [{text: 'OK'}],
      );
      setEmail('');
      await AsyncStorage.setItem('sign-in-email-sent-to', email);
    } catch (error) {
      Alert.alert(
        'Oops!',
        'Something went wrong while sending sign in link to email.',
        [{text: 'OK'}],
      );

      console.error(error);
    }

    setSendingEmail(false);
  }, [email]);

  const logout = useCallback(() => auth().signOut(), []);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(handleAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, [handleAuthStateChanged]);

  let content = null;

  if (initializing) {
    content = <ActivityIndicator />;
  } else if (!user) {
    content = (
      <>
        <TextInput
          style={styles.input}
          placeholder="Your email"
          value={email}
          editable={!sendingEmail}
          autoFocus
          keyboardType="email-address"
          textContentType="emailAddress"
          autoCapitalize="none"
          onChangeText={setEmail}
          onSubmitEditing={sendEmail}
        />
        <Pressable
          onPress={sendEmail}
          style={styles.button}
          android_ripple={{color: 'rgba(0,0,0,0.2)', borderless: true}}
          disabled={sendingEmail}>
          {sendingEmail ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text>Login</Text>
          )}
        </Pressable>
      </>
    );
  } else {
    content = (
      <View>
        <Text>Welcome {user.displayName || user.email}</Text>
        <Pressable
          onPress={logout}
          style={styles.button}
          android_ripple={{color: 'rgba(0,0,0,0.2)', borderless: true}}>
          <Text>Log out</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <DynamicLinkHandler />
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeAreaView}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.scrollView}>
          <View style={styles.content}>
            <Text style={styles.title}>Firebase Login Demo</Text>
            {content}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    backgroundColor: '#ffd100',
    flexGrow: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  content: {
    width: 240,
  },
  input: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  button: {
    width: '100%',
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#ffac00',
    borderRadius: 4,
  },
});

export default App;
