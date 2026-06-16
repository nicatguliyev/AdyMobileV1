import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import AuthLoginPage from './src/pages/AuthLoginPage';
import { createNativeStackNavigator} from '@react-navigation/native-stack';
import { inject, observer } from 'mobx-react';
import { Platform } from 'react-native';
import { useAdyStore } from './src/store/ady';
import api, { $axios } from './src/api/api';
import ForceUpdatePage from './src/pages/ForceUpdatePage';
import DeviceInfo from 'react-native-device-info';
import { compareVersions } from 'compare-versions';
import Loading from './src/components/Loading';
import OnBoarding from './src/pages/OnBoarding';


const Stack = createNativeStackNavigator();
const currentAppVersion = DeviceInfo.getVersion();

const SubMain = observer(({ user, initialRoute }) => {
    const ady = useAdyStore();

    useEffect(() => {
        ady.setInitialRoute(initialRoute);
    }, []);

    const compareVersionValue = !!ady.getAppVersionFromApi() &&
        compareVersions(currentAppVersion, ady.getAppVersionFromApi()?.version) === -1;

    return (
        <Stack.Navigator
            useLegacyImplementation={true}
            screenOptions={{ headerShown: false, }}
            initialRouteName={compareVersionValue ? 'ForceUpdatePage' : initialRoute}
        >
            <Stack.Screen name="Login" component={AuthLoginPage} />
            <Stack.Screen name="OnBoarding" component={OnBoarding} />
            <Stack.Screen name="ForceUpdatePage" component={ForceUpdatePage} />
        </Stack.Navigator>
    );
});

const Main = ({ user, initialRoute }) => {
    const ady = useAdyStore();
    const [userLoaded, setUserLoaded] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                await user.initUserFromStorage();
                const response = await $axios.get(api.app_version);

                const appVersionObj = Platform.OS === 'ios' ? response.data.ios : response.data.android;

                if (Platform.OS === 'ios') {
                    ady.setAppVersion(appVersionObj);
                }
                else {
                    ady.setAppVersion(appVersionObj);
                }
            }
            catch (e) {
            }
            finally {
                setUserLoaded(true);
            }
        })();
    }, []);

    const navigation = useNavigation();

    useEffect(() => {
        if (user.isSuccessReceiptVisible) {
            navigation.navigate('SuccessReceiptPage');
        }
    }, [user?.isSuccessReceiptVisible]);


    if (userLoaded) {
        return <SubMain user={user} initialRoute={initialRoute} />
    }


    return <Loading loading={true} />

};

export default inject('user')(observer(Main));









