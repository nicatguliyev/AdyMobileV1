import React, {useEffect, useState} from 'react';
import { useNavigation } from '@react-navigation/native';
import AuthLoginPage from './src/pages/AuthLoginPage';
import {createNativeStacknavigator} from '@react-navigation/native-stack';
import {inject, observer} from 'mobx-react';
import {Platform} from 'react-native';
import {useAdyStore} from './src/store/ady';
import api, {$axios} from './src/api/api';
import ForceUpdatePage from './src/pages/ForceUpdatePage';
import DeviceInfo from 'react-native-device-info';
import {compareVersions} from 'compare-versions';
import Loading from './src/components/Loading';
import OnBoarding  from './src/pages/OnBoarding';


const Stack = createNativeStacknavigator();
const currentAppversion = DeviceInfo.getVersion();

const SubMain  = observer(({user, initialRoute}) => {
   const ady = useAdyStore();

   useEffect(() => {
        ady.setInitialRoute(initialRoute);
   }, []);

   const compareVersionValue = !!ady.getAppVersionFromApi() && 
   compareVersions(currentAppVersion, ady.getAppVersionFromApi()?.version) === -1;

   return (
    <Stack.Navigator
    useLegacyImplementation = {true}
    screenOptions = {{headerShown: false,}}
    initialRouteName = {compareVersionValue ? 'ForceUpdatepage' : initialRoute}
    >
    <Stack.Screen name = "Login" component = {AuthLoginPage} />
    <Stack.Screen name = "OnBoarding" component = {OnBoarding} />
    <Stack.Screen name = "ForceUpdatepage" component = {ForceUpdatePage} />
    </Stack.Navigator>
   );
});

