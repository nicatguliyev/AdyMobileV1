import React, { useEffect, useRef, useState } from 'react';
import user from './src/store/user';
import { Provider } from 'mobx-react';
import Main from './Main';
import strings from './src/localization/Localizations';
import api, { $axios, initAxios } from './src/api/api';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import moment from 'moment/min/moment-with-locales';
import { getMessaging } from '@react-native-firebase/messaging';
import RNBootSplash from 'react-native-bootsplash';
import {
  AppState,
  Dimensions,
  Linking,
  LogBox,
  NativeModules,
  PermissionsAndroid,
  Platform,
  StyleSheet,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import NotServicesIcon from './assets/icons/nointernet.svg';
import { NavigationContainer } from '@react-navigation/native';
import * as RootNavigation from './src/RootNavigation';
import { useAdyStore } from './src/store/ady';
import { EncryptedDataStore } from './src/utils/encrypt';
import DeviceInfo from 'react-native-device-info';
import NoItem from './src/components/UI/NoItem';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import FlashMessage from 'react-native-flash-message';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

if(__DEV__) {
  require('./ReactotronConfig');
}

const App = () => {
  const [isVerifyDeviceRoot, setIsVerifyDeviceRoot] = useState(false);
  const [isEmulator, setIsEmulator] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [route_name, setRouteName]  = useState('OnBoarding');
  const [translateFile, setTranslateFile] = useState({});
  const [isNetworkOnline, setIsNetworkOnline] = useState(false);
  const [firstTimeNotServices, setFirstTimeNotServices] = useState(false);
  const currentAppState = useRef(AppState.currentState);
  const [appState, setAppState] = useState(currentAppState.current);
  const [isMounted, setIsMounted] = useState(true);

  const ady = useAdyStore();

  useEffect(() => {
    (async () => {
      const emulatorStatus = await DeviceInfo.isEmulator();
      setIsEmulator(emulatorStatus);

      const app_status_check = await EncryptedDataStore.get('@app_status_check');

      if(app_status_check !== null){
        if(JSON.parse(app_status_check)){
          setIsVerifyDeviceRoot(true);
        }
        else {
          if(JailMonkey.isJailBroken()){
            await EncryptedDataStore.set('@app_status_check', 'true');
            setIsVerifyDeviceRoot(true);
          }
        }
      }
    })();
  }, []);

}






