/**
 * @format
 */

import {AppRegistry} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

Icon.loadFont();
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
