import React from 'react';
import { makeAutoObservable } from 'mobx';
import moment from 'moment/min/moment-with-locales';
import api, { $axios } from '../api/api';
import user from './user';
import { showMessage } from 'react-native-flash-message';

class Ady {

    isSelectDestinationsFilterReset = true;

    loading = false;
    countries = [];
    lock_mode = true;
    from_station = 0;
    to_station = 0;

    initial_route;
    app_version = null;

    to_station_list = [];
    from_station_list = [];

    to_trip_dates = [];
    to_trip_trains = [];
    from_trip_trains = [];

    saved_passengers = [];


    trip_data = {
        from_input: '',
        from_station: 0,
        to_input: '',
        to_station: 0,
        departureDate: null,
        returnDate: moment().startOf('day').add(1, 'days'),
        two_way: false,
        accept_rules: false,
        to_trip_train_index: -1,
        to_trip_train_wagon_type_id: -1,
        to_trip_train_seat_class_id: -1,
        from_trip_train_index: -1,
        from_trip_train_wagon_type_id: -1,
        from_trip_train_seat_class_id: -1,
        ticket_type: '',
        passengers_count: 1,
        passengers: {
            infant: 0,
            child: 0,
            adults: 1,
        },
        passengers_data: {
            infant: [],
            child: [],
            adults: [],
        },
        linens: false,
        payment_method: null,

    }

    setAppVersion(value) {
        this.app_version = value;
    }

    setInitialRoute(value) {
        this.initial_route = value;
    }

    getAppVersionFromApi() {
        return this.app_version;
    }

    setTicketType(value) {
        this.trip_data.ticket_type = value;
    }

    setLockMode(value) {
        this.lock_mode = value;
    }

    setIsSelectDestinationsFilterReset(value) {
        this.isSelectDestinationsFilterReset = value;
    }

    getIsSelectDestinationsFilterReset() {
        return this.isSelectDestinationsFilterReset;
    }

    getLockMode() {
        return this.lock_mode;
    }

    setLinens(value) {
        this.trip_data.linens = value;
    }

    setPassengersCount(value) {
        this.trip_data.passengers_count = value;
    }

    setPaymentMethod(value) {
        this.trip_data.payment_method = value;
    }

    setAcceptRules = accept_rules => {
        this.trip_data.accept_rules = accept_rules;
    }

    constructor() {
        makeAutoObservable(this);
    }

    loadSavedPassengers(user_token) {
        return $axios.get(api.saved_passengers, {
            headers: {
                Authorization: 'Bearer ' + user_token,
            },
        }).then(response => {
            if (!response.data.error) {
                let saved_passengers = [];
                saved_passengers = response.data.data.map(
                    p => {
                        p.selected = false;
                        p.father_n = p.father_n || '';
                        return p;
                    }
                );
                saved_passengers.unshift({
                    id: 0,
                    name: '',
                    surname: '',
                    father_n: '',
                    p_number: '',
                    p_serial: '',
                    nationality: 0,
                    birth: '',
                    ticket_type: 0,
                    sex: 1,
                    add_to_base: false,
                    selected: false,
                });
                saved_passengers[1].selected = true;
                this.saved_passengers = saved_passengers;
            }

            return response.data;
        });
    }

    initTripData() {
        this.trip_data = {
            from_input: '',
            from_station: 0,
            to_input: '',
            to_station: 0,
            departureDate: moment.startOf('day'),
            returnDate: moment.startOf('day').add(1, 'days'),
            two_way: false,
            accept_rules: false,
            to_trip_train_index: -1,
            to_trip_train_wagon_type_id: -1,
            to_trip_train_seat_class_id: -1,
            from_trip_train_index: -1,
            from_trip_train_wagon_type_id: -1,
            from_trip_train_seat_class_id: -1,
            passengers: {
                infant: 0,
                child: 0,
                adults: 1,
            },
            passengers_data: {
                infant: [],
                child: [],
                adults: [],
            },
            linens: false,
            payment_method: ''

        };
    }

    registerTickets = (token) => {
        return $axios.post(api.register_tickets, this.trip_data, {
            headers: {
                Authorization: 'Bearer ' + token,
            },
        })
            .then(response => {
                return response.data;
            })
            .catch(e => {
                console.log("RegisterTickets error: ", e);
                console.log(e);
            })
    }

    getWagon = payload => {
        return $axios.post(api.get_wagon_by_trip_date, payload).then(response => {
            if (!response.data.error) {
                for (let seat in response.data.data.seat_status_data) {
                    response.data.data.seat_status_data[seat].seat_no = Number(
                        response.data.data.seat_status_data[seat].seat_no,
                    );

                    response.data.data.seat_status_data[seat].wagon_type_id =
                        payload.wagon_type_id;
                    response.data.data.seat_status_data[seat].wagon_title =
                        payload.wagon_type.title;
                }

                return {
                    seat_status_data: response.data.data.seat_status_data,
                    train_direction: response.data.data.train_direction,
                    cib_available: response.data.data.cib_available,
                    video_360: response.data.data.video_360,
                    all_data: response.data.data,
                };
            }
            return response.data;
        });
    }
}





