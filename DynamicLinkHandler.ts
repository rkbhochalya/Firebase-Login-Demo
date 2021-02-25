import {useEffect, useCallback} from 'react';
import {Alert} from 'react-native';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

function DynamicLinkHandler(): null {
  const handleDynamicLink = useCallback(async (link: {url: string} | null) => {
    if (!link || !link.url) {
      return;
    }

    if (auth().isSignInWithEmailLink(link.url)) {
      try {
        const email = await AsyncStorage.getItem('sign-in-email-sent-to');

        if (!email) {
          const userEmail = auth().currentUser?.email;

          Alert.alert(
            'Oops!',
            userEmail
              ? `You are already signed in as: ${userEmail}`
              : 'Something went wrong. Please make sure to open the sign-in link on the same device it was sent from.',
            [{text: 'OK'}],
          );
        } else {
          const credential = auth.EmailAuthProvider.credentialWithLink(
            email,
            link.url,
          );
          await auth().signInWithCredential(credential);
          await AsyncStorage.removeItem('sign-in-email-sent-to');
        }
      } catch (error) {
        console.error('Failed to sign in with email link.', error);
      }
    }
  }, []);

  useEffect(() => {
    dynamicLinks()
      .getInitialLink()
      .then(handleDynamicLink)
      .catch((error) => {
        console.error(
          'Error getting the Dynamic Link that the app has been launched from',
          error,
        );
      });
    const unsubscribe = dynamicLinks().onLink(handleDynamicLink) as () => void;
    // When the component is unmounted, remove the listener
    return () => unsubscribe();
  }, [handleDynamicLink]);

  return null;
}

export default DynamicLinkHandler;
