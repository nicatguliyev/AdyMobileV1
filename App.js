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
import JailMonkey from 'jail-monkey';
import EmulatorIcon from './assets/icons/emulator.svg';


const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

if (__DEV__) {
  require('./ReactotronConfig');
}

const App = () => {
  const [isVerifyDeviceRoot, setIsVerifyDeviceRoot] = useState(false);
  const [isEmulator, setIsEmulator] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [route_name, setRouteName] = useState('OnBoarding');
  const [translateFile, setTranslateFile] = useState({});
  const [isNetworkOnline, setIsNetworkOnline] = useState(false);
  const [firstTimeNotServices, setFirstTimeNotServices] = useState(false);
  const currentAppState = useRef(AppState.currentState);
  const [appState, setAppState] = useState(currentAppState.current);
  const [isMounted, setIsMounted] = useState(true);

  // const ady = useAdyStore();

  useEffect(() => {
    (async () => {
      const emulatorStatus = await DeviceInfo.isEmulator();
      setIsEmulator(emulatorStatus);

      const app_status_check = await EncryptedDataStore.get('@app_status_check');

      if (app_status_check !== null) {
        if (JSON.parse(app_status_check)) {
          setIsVerifyDeviceRoot(true);
        }
        else {
          if (JailMonkey.isJailBroken()) {
            await EncryptedDataStore.set('@app_status_check', 'true');
            setIsVerifyDeviceRoot(true);
          }
        }
      }
    })();
  }, []);

  const handleAppStateChange = nextAppState => {
    if (AppState.currentState === 'active') {
      if (nextAppState === 'inactive') {
        console.log('mounted inactive', isMounted)
        setIsMounted(false);
      }
      else {
        console.log('mounted active', isMounted);
        setIsMounted(true);
      }
    }

    if (AppState.currentState === 'background') {
      console.log('mounted background', isMounted);
      setIsMounted(false);
    }

  }


  useEffect(() => {
    AppState.addEventListener('change', handleAppStateChange);
    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
    }
  }, []);


  const getDeviceLang = () => {
    const deviceLanguage =
      Platform.OS === 'ios'
        ? NativeModules.SettingsManager.settings.AppleLocale ||
        NativeModules.SettingsManager.settings.AppleLanguages[0] //iOS 13
        : NativeModules.I18nManager.localeIdentifier;

    if (deviceLanguage.startsWith('az')) {
      return 'Bağışlayın, sizin internet bağlantınız yoxdur!';
    } else if (deviceLanguage.startsWith('ru')) {
      return 'Извините, у вас нет подключения к интернету!';
    } else {
      return "Sorry, you don't have an internet connection!";
    }
  };

  useEffect(() => {
    const initApp = async () => {
      const net_info = await NetInfo.fetch();
      await setIsNetworkOnline(net_info.isConnected);

      // if (!subscription) {
      //   subscription = _networkStatus.subscribe(response => {
      //     setIsNetworkOnline(response);
      //   });
      // }
      if (Platform.OS === 'android') {
        await requestAndroidNotificationPermission();
      } else {
        await notificationPermission();
      }

      if (!net_info.isConnected) {
        await RNBootSplash.hide();
        await loadLocalTranslations(net_info.isConnected);
        const lang_loaded = await EncryptedDataStore.get('@lang_version');
        if (lang_loaded) {
          setLoaded(true);
        } else {
          setFirstTimeNotServices(true);
        }
      }
      return () => {
        // if (subscription) {
        //   subscription.unsubscribe();
        // }
      };
    };
    initApp();
  }, []);

  LogBox.ignoreAllLogs(true);
  // LogBox.ignoreLogs(['Warning: ...']);

  useEffect(() => {
    if (isNetworkOnline) {
      loadTranslations();
      setFirstTimeNotServices(false);
    }
    //setLoaded(isNetworkOnline);
    //Alert.alert(' is connected useeffect ' + isNetworkOnline);
  }, [isNetworkOnline, firstTimeNotServices]);


  const loadTranslations = async () => {
    $axios.get(api.translations_version + '?' + Date.now()).then(version_response => {
      EncryptedDataStore.get('@lang_version').then(response => {
        if (response) {
          if (response == version_response.data) {
            loadLocalTranslations(true);
          }
          else {
            loadLocale();
          }
        }

        else {
          loadLocale();
        }
        EncryptedDataStore.set(
          '@lang_version',
          String(version_response.data),
        );
      })
        .catch(error => {
          loadLocale();
        });
    })
      .catch(async error => {
        return false;
      })
  }

  const loadLocalTranslations = async network_is_online => {
    await EncryptedDataStore.get('@translations')
      .then(response => {
        setTranslations(JSON.parse(response));
      })
      .catch(error => {
        if (network_is_online) {
          loadLocale();
        }
      });
  };

  const loadLocale = async () => {
    $axios.get(api.translations)
      .then(response => {
        setTranslations(response.data.translations, true)
      })
      .catch(async error => {
        // Handle error
      });
  };

  const setTranslations = async (translations, save = false) => {

    if (save) {
      EncryptedDataStore.set('@translations', JSON.stringify(translations));

    }

    strings.setContent(translations);
    let code = await EncryptedDataStore.get('@lang');
    if (!code) {
      code = 'az';
      EncryptedDataStore.set('@lang', 'az');
    }

    strings.setLanguage(code);
    moment.locale(code);
    initAxios();

    const [pinCode, onBoarding, token] = await Promise.all([
      EncryptedDataStore.get('@user_fin'),
      EncryptedDataStore.get('@onBoarding'),
      EncryptedDataStore.get('@user_token')
    ]);

    if (onBoarding) {
      user.setIsOnBoarded(true);
      if (token) {
        setRouteName('HomeTabs');
      }
      else {
        setRouteName('Login');
      }
    }

    let week = strings.week.split('|');
    let bazar = week.pop();
    if (bazar) {
      week.unshift(bazar);
    }

    moment.updateLocale(code, {
      weekdaysMin: week,
    });

    await RNBootSplash.hide();
    setLoaded(true);
  };

  const ady = useAdyStore();

  const linking = {
    prefixes: ['https://test-ticket.ady.az', '*test-ticket.ady.az'],
    config: {
      screens: {},
    },
    subscribe(listener) {
      const onReceiveURL = async ({ url }) => {
        console.log('url', url);
        const token = await EncryptedDataStore.get('@user_token');

        if (token) {
          if (url.includes('fiziki-kart-balans-artimi')) {
            const cartInfo = await EncryptedDataStore.get('@myCart');
            const cart = JSON.parse(cartInfo);

            const serial = cart.serial;
            const balance = cart.balance;

            RootNavigation.navigate('AddCartBalance', {
              serial: serial,
              balance: balance,
            });
          } else if (url.includes('hereket-cedveli')) {
            RootNavigation.navigate({
              name: 'HomeTabs', // Name of the route to navigate to
              params: {
                screen: 'Tablo', // Optional route parameters
              },
            });
          } else if (url.includes('ticket-search')) {
            if (url.includes('type=local')) {
              ady.setTicketType('standart');
              RootNavigation.navigate({
                name: 'HomeTabs', // Name of the route to navigate to
                params: {
                  screen: 'HomePage',
                  params: {
                    screen: 'TicketSearch',
                  },
                },
              });
            } else {
              ady.setTicketType('');
              RootNavigation.navigate({
                name: 'HomeTabs', // Name of the route to navigate to
                params: {
                  screen: 'HomePage',
                  params: {
                    screen: 'TicketSearch',
                  },
                },
              });
            }
          }
        }
      };

      // Listen to incoming links from deep linking
      const subscription = Linking.addEventListener('url', onReceiveURL);

      return () => {
        // Clean up the event listeners
        subscription.remove();
      };
    },
  };


  if (isEmulator && !__DEV__) {
    return (
      <NoItem
        iconItem={<EmulatorIcon width={90} height={90} />}
        text={'Emulator detected'}
      />
    );
  }

  if (isVerifyDeviceRoot && !__DEV__) {
    return (
      <NoItem
        iconItem={<EmulatorIcon width={90} height={90} />}
        text={'Emulator Rooted'}
      />
    );
  }

  if (firstTimeNotServices) {
    return (
      <NoItem
        iconItem={<NotServicesIcon width={50} height={50} />}
        text={getDeviceLang()}
      />
    );
  } else {
    return (
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Provider user={user}>
            {loaded ? (
              <NavigationContainer
                linking={linking}
                ref={RootNavigation.navigationRef}
              >
                <Main initialRoute={route_name} />
              </NavigationContainer>
            ) : null}
            <FlashMessage />
          </Provider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    );
  }
};

export default App;


const style = StyleSheet.create({
  modal: {
    width: width,
    height: height,
    backgroundColor: '#F2F2F2',
  },
  mainContainer: {
    width: width,
    height: height,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
  },
  alert: {
    alignContent: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  iconContainer: {
    width: width,
    alignContent: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  icon: {
    width: 78,
    height: 78,
    marginBottom: 50,
    marginLeft: (width - 78) / 2,
  },
  title: {
    fontFamily: 'EuclidCircularA-Bold',
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: '#282828',
    marginBottom: 20,
  },
  subTitle: {
    fontFamily: 'EuclidCircularA-Regular',
    fontSize: 14,
    color: '#726f6f',
    textAlign: 'center',
    fontWeight: '400',
  },
  button: {
    width: width,
    marginTop: 25,
    height: 25,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'EuclidCircularA-Regular',
    fontSize: 17,
    color: '#007BF6',
  },
  alertTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertText: { color: 'red', fontSize: 16 },
});








