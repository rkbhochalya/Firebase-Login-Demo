/**
 * @format
 */

import {AppRegistry} from 'react-native';
import '@react-native-firebase/app';

import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
