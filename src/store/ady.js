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

    setSavedPassengers(saved_passengers) {
        this.saved_passengers = saved_passengers;
    }

    showLoading(show) {
        this.loading = show;
    }

    setCountries(countries) {
        this.countries = countries;
    }

    setDepartureDate(departureDate) {
        this.trip_data.departureDate = departureDate;
    }

    setTripData(trip_data) {
        this.trip_data = trip_data;
    }

    setToStation(to_station) {
        this.to_station = to_station;
    }

    setFromStation(from_station) {
        this.from_station = from_station;
    }

    setToTripTrains(trip_trains) {
        this.to_trip_trains = trip_trains;
    }

    setFromTripTrains(trip_trains) {
        this.from_trip_trains = trip_trains;
    }

    setFromStations(from_station_list) {
        this.from_station_list = from_station_list;
    }

    setToStations(to_station_list) {
        this.to_station_list = to_station_list;
    }

    setToTripDates(to_trip_dates) {
        this.to_trip_dates = to_trip_dates;
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


    // İstifadəçi sərnişin məlumatlarını doldurub "Davam" düyməsinə basanda çağırılır. Backend-ə deyir: "Bu sərnişinlər bu marşrut üçün keçərlidirmi?"
    // Backend yoxlayır:

    // Pasport nömrəsi düzgündürmü?
    // Bu tarixdə bu şəxs artıq bilet alıbmı?
    // Uşaq yaşı tarixlə uyğundurmu?

    validatePassengerData(
        passengrs_data,
        trip_data,
        token
    ) {
        return $axios.post(
            api.check_passengers,
            {
                passengers_data,
                departureDate: trip_data.departureDate,
                returnDate: trip_data.returnDate,
                two_way: trip_data.two_way,
                from_station: trip_data.from_station,
                to_station: trip_data.to_station
            },
            {
                headers: {
                    Authorization: 'Bearer ' + token,
                }
            },
        ).then(
            response => {
                response.data;
            }
        )
    }

    loadFromStations() {
        this.loading = true;
        if (this.trip_data.ticket_type == '') {
            return $axios.post(api.stations_in_route, {
                field: '#from_station',
                station_id: 0,
            })
                .then(json => {
                    this.loading = false;
                    if (!json.data.error) {
                        this.setFromStations(json.data.data);
                    }
                    return json.data;
                }).catch(error => {
                    console.error(error.response);
                });
        }
        else if (this.trip_data.ticket_type == 'standart') {
            return $axios.get(api.local_stations_list, {
                params: {
                    field: '#from_station',
                    station_id: 0,
                }
            }).then(json => {
                if (!json.data.error) {
                    this.setFromStations(json.data.data);
                }
                return json.data;
            })
                .catch(err => console.log(err));
        }
    }


    // loadFromLocalStations  bu method hec bir yerde istifade edilmir:
    loadFromLocalStations() {
        this.loading = true;
        if (this.trip_data.ticket_type == '') {
            return $axios
                .post(api.stations_in_route, {
                    field: '#to_station',
                    station_id: 0,
                })
                .then(json => {
                    this.loading = false;
                    if (!json.data.error) {
                        this.setToStations(json.data.data);
                    }
                    return json.data.data;
                })
                .catch(error => {
                    console.error(error.response);
                });
        } else if (this.trip_data.ticket_type == 'standart') {
            return $axios
                .get(api.local_stations_list, {
                    headers: {
                        Authorization: 'Bearer ' + user.getToken(),
                    },
                    params: {
                        field: '#from_station',
                        station_id: 0,
                    },
                })
                .then(json => {
                    if (!json.data.error) {
                        this.setToStations(json.data.data);
                    }
                    return json.data.data;
                })
                .catch(err => console.log(err));
        }
    }

    loadToStations(station_id) {
        this.loading = true;
        if (this.trip_data.ticket_type == '') {
            return $axios
                .post(api.stations_in_route, {
                    field: '#to_station',
                    station_id: station_id,
                })
                .then(json => {
                    this.loading = false;
                    if (!json.data.error) {
                        this.setToStations(json.data.data);
                    }
                    return json.data.data;
                })
                .catch(error => {
                    console.error(error.response);
                });
        } else if (this.trip_data.ticket_type == 'standart') {
            return $axios
                .get(api.local_stations_list, {
                    headers: {
                        Authorization: 'Bearer ' + user.getToken(),
                    },
                    params: {
                        field: '#from_station',
                        station_id: 0,
                    },
                })
                .then(json => {
                    if (!json.data.error) {
                        this.setToStations(json.data.data);
                    }

                    return json.data.data;
                })
                .catch(err => console.log(err));
        }
    }

    // İstifadəçi stansiyaları seçib təqvimə keçəndə çağırılır. 
    // Backend həmin marşrut üçün hansı tarixlərdə qatar var siyahısını qaytarır 
    //  beləcə təqvimdə yalnız mövcud tarixlər aktiv görünür,
    //  qalanları qeyri-aktiv olur.
    // way gedis /qayidis teqvimi

    loadTripCalendar(from_station, to_station, way) {
        this.loading = true;
        return $axios.post(api.trip_calendar, {
            way: way,
            from_station: from_station,
            to_station: to_station
        })
            .then(json => {
                this.loading = false;
                this.setToTripDates(!json.data.error ? json.data.data : []);
                return json.data.data;
            })
            .catch(error => {
                console.error(error.response);
            });
    }


    //     Bu iki metod eyni loadTrip() funksiyasını çağırır — fərq yalnız nəticənin hara yazıldığıdır:
    //    loadToTripthis.to_trip_trains — gediş qatarlarıloadFromTripthis.from_trip_trains — qayıdış qatarları

    async loadToTrip(from_station, to_station, trip_date) {
        return this.loadTrip(from_station, to_station, trip_date).then(data => {
            this.to_trip_trains = data.data;
            return data.data;
        });
    }

    async loadFromTrip(from_station, to_station, trip_date) {
        return this.loadTrip(from_station, to_station, trip_date).then(data => {
            this.from_trip_trains = data.data;
            return data.data;
        });
    }

    loadTrip(from_station, to_station, trip_date) {
        this.loading = true;
        return $axios.post(api.get_trip_trains, {
            from_station: from_station,
            to_station: to_station,
            trip_date: trip_date.format('YYYY-MM-DD'),
        }).then(response => {
            this.loading = false;
            if (!response.data.error) {
                Object.keys(response.data.data).forEach(key => {
                    let train = response.data.data[key];
                    train.arrival_datetime = moment(
                        train.arrival_datetime,
                        'DD-MM-YYYY HH:mm',
                    );
                    train.depart_datetime = moment(
                        train.depart_datetime,
                        'DD-MM-YYYY HH:mm',
                    );
                    let wagon = [];
                    Object.keys(train.wagon).forEach(wagon_type_id => {
                        Object.keys(train.wagon[wagon_type_id]).forEach(seat_class_id => {
                            let train_wagon = train.wagon[wagon_type_id][seat_class_id];
                            let free_seats_count = 0;
                            train_wagon.wagons.forEach(
                                w => {
                                    free_seats_count += w.free_seats_count;
                                    w.wagon_type_id = Number(wagon_type_id);
                                    w.seat_class_id = Number(seat_class_id);
                                    w.trip_id = train_trip_id
                                }
                            );
                            train_wagon.free_seats_count = free_seats_count;
                            train_wagon.tam_st_alt = train_wagon.tam_st_alt
                                ? parseFloat(train_wagon.tam_st_alt)
                                : 0;
                            train_wagon.ushaq_st_alt = train_wagon.ushaq_st_alt
                                ? parseFloat(train_wagon.ushaq_st_alt)
                                : 0;
                            train_wagon.tam_st_ust = train_wagon.tam_st_ust
                                ? parseFloat(train_wagon.tam_st_ust)
                                : 0;
                            train_wagon.ushaq_st_ust = train_wagon.ushaq_st_ust
                                ? parseFloat(train_wagon.ushaq_st_ust)
                                : 0;


                            if (
                                train_wagon.tam_st_alt == 0 ||
                                train_wagon.tam_st_ust == 0
                            ) {
                                let pr =
                                    train_wagon.tam_st_alt > 0
                                        ? train_wagon.tam_st_alt
                                        : train_wagon.tam_st_ust;
                                train_wagon.min_price = pr;
                                train_wagon.max_price = pr;
                            } else {
                                train_wagon.min_price =
                                    train_wagon.tam_st_alt < train_wagon.tam_st_ust
                                        ? train_wagon.tam_st_alt
                                        : train_wagon.tam_st_ust;
                                train_wagon.max_price =
                                    train_wagon.tam_st_alt > train_wagon.tam_st_ust
                                        ? train_wagon.tam_st_alt
                                        : train_wagon.tam_st_ust;
                            }
                        });
                    });
                    this.loading = false;
                });
                return response.data ? response.data : { data: {} };
            }
            else {
                showMessage({
                    message: response?.data?.message,
                    type: 'danger',
                    icon: 'danger',
                });
            }
        }).catch(error => {
            console.error(error.response);
        });
    }
}







