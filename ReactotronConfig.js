import Reactotron from 'reactotron-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

Reactotron.setAsyncStorageHandler(AsyncStorage)
  .configure()
  .useReactNative({
    networking: {
      ignoreUrls: /(symbolicate|clients3\.google\.com\/generate_204)/,
    },
  })
  .connect();