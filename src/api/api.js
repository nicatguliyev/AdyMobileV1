import axios from 'axios';
import strings from '../localization/strings';
import NetInfo from '@react-native-community/netinfo';
import { changeNetworkStatus } from '../services/explorer.service';
import DeviceInfo from 'react-native-device-info';

import {
    TEST_API_URL,
    PROD_API_URL,
    TEST_API_URL2,
    PRE_PROD_URL,
    ADY_LOC
} from '@env';

let url;

export const isDevelopment = false;
url = 'https://' + TEST_API_URL;

console.log('pre', url);

const api = {
    app_version: `${url}/storage/app-version.json`,
    translations: `${url}/api/translations`,
    translations_version: `${url}/storage/lang-version.txt`,
    get_trip_dates: `${url}/ticket-api/get_trip`,
    get_trip_trains: `${url}/ticket-api/get_traintrip`,
    stations_in_route: `${url}/ticket-api/stations_in_route`,
    get_available_payment_methods: `${url}/api/available-payment-methods`,
    saved_passengers: `${url}/api/saved_passengers`,
    trip_calendar: `${url}/ticket-api/get_trip_dates`,
    get_wagon: `${url}/ticket-api/getWagonByTriplet`,
    get_countries: `${url}/ticket-api/get_countries`,
    register_tickets: `${url}/ticket-api/register_tickets`,
    get_wagon_by_trip_date: `${url}/ticket-api/getWagonByTripdate`,
    user_info: `${url}/ticket-api/get_user_data`,
    check_passengers: `${url}/ticket-api/check_passengers`,
    send_verify_code: `${url}/api/send-verify-email-code`,
    login: `${url}/api/login`,
    destroy: `${url}/api/destroy`,
    logout: `${url}/api/logout`,
    update_profile: `${url}/api/updateProfile`,
    update_password: `${url}/api/updatePassword`,
    remove_passenger: `${url}/api/remove_passenger`,
    save_passenger: `${url}/api/save_passenger`,
    trips: `${url}/api/trips`,
    return_ticket: `${url}/api/trips/return/`,
    tablo: `${url}/api/tablo`,
    pdf: `${url}/az/profil/bileti-qaytar/`,
    news: `${url}/api/pages/news`,
    news_details: `${url}/api/pages/news/details`,
    faq: `${url}/api/pages/faq`,
    social: `${url}/api/pages/social`,
    privacy: `${url}/api/pages/privacy`,
    user_data: `${url}/api/user-data`,
    forgot_password: `${url}/api/forgot-password`,
    forgot_password_confirm: `${url}/api/forgot-password/confirm`,
    reset_password: `${url}/api/reset-password`,
    register: `${url}/api/register/v2`,
    register_confirm: `${url}/api/register-confirm`,
    register_confirm_phone: `${url}/api/register-confirm-phone`,
    register_confirm_phone_again: `${url}/api/phone-verification/send`,
    profile_update_phone_confirm: `${url}/api/updateProfile/phone-confirm`,
    ticket_info: `${url}/api/tickets/`,
    register_token: `${url}/api/register-token`,
    notifications: `${url}/api/notifications`,
    notification_read: `${url}/api/notifications/read`,
    notification_read_all: `${url}/api/notifications/read/all`,
    notification_remove_all: `${url}/api/notifications/remove/all`,
    notification_remove_one: `${url}/api/notifications/remove`,
    notification_count: `${url}/api/notifications/count`,
    local_stations_list: `${url}/api/local-ticket/stations`,
    local_trip_paths: `${url}/api/local-ticket/trip-paths`,
    get_active_tickets: `${url}/api/local-ticket/active-tickets`,
    pay_ticket: `${url}/api/local-ticket/register-tickets`,
    get_all_reasons: `${url}/api/local-ticket/return-reasons`,
    get_cart_information: `${url}/api/account/virtual-card`,
    add_cart_balance: `${url}/api/account/virtual-card/add-balance`,
    new_tablo: `${url}/api/pages/tablo`,
    set_language: `${url}/api/set-language`,
    refund_balance: `${url}/api/account/virtual-card/refund-balance`,
    account_virtual_card_receipt: `${url}/api/account/virtual-card/receipt/`,
    selected_routes_routes: `${url}/api/routes`,
    selected_routes_nearest_trip: `${url}/api/nearest-trip`,
    selected_routes_save_trip: `${url}/api/selected-routes`,
    selected_routes_delete_trip: `${url}/api/selected-routes`,
    get_purchased_trip_types: `${url}/api/account/purchased-trip-types`,
    post_notifications_subscribe: `${url}/api/notifications/subscribe`,
    get_promotion_history: `${url}/api/account/promotion/get-history`,
    post_invite_friend: `${url}/api/account/promotion/invite`,
    in_app_review_feedback: `${url}/api/account/promotion/mobile-soft-evaluation`,
    get_rate_page_url: `${url}/api/account/promotion/get-rate-page-url`,
    get_bonus_card_statistics: `${url}/api/account/promotion/get-statistics`,
    sima_register: `${url}/api/sima/register`,
    enable_sima: `${url}/api/sima/enable`,
    delete_sima: `${url}/api/sima/delete`,
    sima_privacy: `${url}/api/pages/sima-privacy`,
};


let $axios = axios.create();

let isConnected = true;

NetInfo.addEventListener(state => {
    if (isConnected !== state.isConnected) {
        isConnected = state.isConnected;
        changeNetworkStatus(isConnected);
    }
});

const initAxios = () => {
    $axios = axios.create({
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-Requested-From': 'APP',
        },
    })


    $axios.interceptors.request.use(
        function (config) {
            const controller = new AbortController();
            if (isConnected) {
                if (config.url.indexOf('?') == -1) {
                    config.url += '?hl=' + strings.getLanguage();
                }
                else {
                    config.url += '&hl=' + strings.getLanguage();
                }
                config.url += '&version=' + DeviceInfo.getVersion();
            }
            else {
                controller.abort();
            }
            return {
                ...config,
                signal: controller.signal,
            };
        },

        function (error) {
            return Promise.reject(error);
        },
    );
};

export { $axios, api, initAxios };
export default api;

