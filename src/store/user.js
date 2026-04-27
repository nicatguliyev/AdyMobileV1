import React from 'react';
import { action, computed, makeObservable, observable } from 'mobx';
import api, { $axios } from '../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMessaging } from '@react-native-firebase/messaging';
import { setBadgeCount } from '../services/explorer.service';
import { EncryptedDataStore } from '../utils/encrypt';

class User {
    user_info = {
        id: 0,
    };
    userLng = '';
    token = '';
    isOnBoarded = false;
    isSuccessReceiptVisible = false;
    receiptContent = {};

    constructor() {
        makeObservable(this, {
            setUserLoggedIn: action,  // istifadəçinin giriş vəziyyətini təyin etmək üçün istifadə olunur. Bu, tətbiqin müxtəlif hissələrində istifadəçinin giriş vəziyyətinə əsaslanaraq fərqli davranışları idarə etməyə imkan verir.
            setUserInfo: action,
            getUserInfo: action,
            user_info: observable,  //  istifadəçi məlumatlarını saxlamaq üçün istifadə olunur. Bu, istifadəçinin məlumatlarını tətbiqin müxtəlif hissələrində istifadə etmək üçün saxlanır və dəyişiklikləri izlənir.
            login: action,
            token: observable,
            setToken: action,
            getToken: action,
            userLng: observable,
            setUserLng: action,
            isLoggedIn: computed, // istifadəçinin giriş vəziyyətini hesablamaq üçün istifadə olunur. Bu, istifadəçinin tokeninin olub olmadığını yoxlayaraq giriş vəziyyətini müəyyən edir və tətbiqin müxtəlif hissələrində istifadəçinin giriş vəziyyətinə əsaslanaraq fərqli davranışları idarə etməyə imkan verir.
            isOnBoarded: observable,
            isSuccessReceiptVisible: observable,
            setIsOnBoarded: action,
            setIsSuccessReceiptVisible: action, //
            receiptContent: observable,
            setNewReceiptContent: action,
        });
    }

    async setToken(token) {
        const response = await EncryptedDataStore.encryptData(token);
        this.token = response;
    }

    getToken() {
        return EncryptedDataStore.decryptData(this.token);
    }

    setUserLng(selectedLng) {
        this.userLng = selectedLng;
    }

    getUserLng() {
        return this.userLng;

    }

    setUserLoggedIn(logged_in) {
        this.is_logged_in = logged_in;
    }

    setNewReceiptContent(newReceiptContent) {
        this.receiptContent = newReceiptContent;
    }

    get isLoggedIn() {
        return this.getUserInfo()?.id;
    }


    setIsOnBoarded(isOnBoarded) {
        this.isOnBoarded = isOnBoarded;
    }

    setIsSuccessReceiptVisible(isVisible) {
        this.isSuccessReceiptVisible = isVisible;
    }

    async setUserInfo(user_info) {
        this.user_info = await EncryptedDataStore.encryptData(JSON.stringify(user_info));
    }

    getUserInfo() {
        const response = EncryptedDataStore.decryptData(this.user_info);
        if (response) {
            return JSON.parse(response);
        }
    }

    register(data) {
        return $axios.post(api.register, data)
            .then(json => {
                return json.data;
            })
            .catch(error => {
                return error.response.data;
            });
    }

    login(email, password, lngCode) {
        return $axios.post(api.login, {
            email: email,
            password: password,
        })
            .then(async json => {
                if (!json.data.error) {
                    try {
                        const userToken = json.data.token;
                        await EncryptedDataStore.set('@user_token', userToken);

                        await $axios.post(api.set_language, {
                            language: lngCode,
                        },
                            {
                                headers: {
                                    Authorization: 'Bearer ' + userToken,
                                },
                            },)
                            .then(data => {
                                if (!data.data.error) {
                                    console.log('Language set successfully');
                                }
                                else {
                                    throw new Error('There is a problem in langauge');
                                }

                            });

                        if (!getMessaging().isDeviceRegisteredForRemoteMessages) {
                            await getMessaging().registerDeviceForRemoteMessages();
                        }

                        const token = await getMessaging().getToken();

                        $axios.post(api.register_token,
                            { token: token },
                            {
                                headers: {
                                    Authorization: 'Bearer ' + json.data.token,
                                }
                            }
                        );
                        this.setUserInfo(json.data.data);
                        this.setToken(json.data.token);
                    }
                    catch (e) {
                        console.error('error when storing user token to storage' + e);

                    }
                }
                return json.data;
            })
            .catch(error => {
                return error.response.data;
            });
    }

    initUserFromStorage = async () => {
        try {
            const token = await EncryptedDataStore.get('@user_token');
            const nonEncryptedToken = await AsyncStorage.getItem('@user_token');

            if (nonEncryptedToken && !token) {
                await AsyncStorage.clear();
            }

            else {
                if (token !== null) {
                    await this.setToken(token);
                    await this.getUserData();
                }
            }
        }
        catch (e) {
            console.error('error when retrieving user token from storage' + e);
            return null;
        }
    }

    getUserData = async () => {
        return $axios.get(api.user_data, {
            headers: {
                Authorization: 'Bearer ' + this.getToken(),
            }
        })
            .then(response => {
                if (response.data.error) {
                    this.setUserInfo({});
                    this.setToken('');
                    try {
                        AsyncStorage.removeItem('@user_token');
                    }
                    catch (e) {
                        console.error('error when removing user token from storage' + e);
                    }
                }
                else {
                    const userData = response.data.user;
                    const exceptTopics = ['campaigns', 'internal', 'local', 'all'];
                    const isAllSubscribed = userData.subscriptions['all'];

                    for (let [key, value] of Object.entries(userData.subscriptions)) {
                        if (exceptTopics.includes(key)) {
                            if (value) {
                                getMessaging().subscribeToTopic(key);
                            } else {
                                getMessaging().unsubscribeFromTopic(key);
                            }
                        } else {
                            if (isAllSubscribed) {
                                getMessaging().subscribeToTopic(key);
                            } else {
                                getMessaging().unsubscribeFromTopic(key);
                            }
                        }
                    }
                    this.setUserInfo(response.data.user);
                    this.setToken(response.data.token);
                }
            })
    }
}

