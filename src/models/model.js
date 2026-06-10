import moment from 'moment/min/moment-with-locales';

export type Country = {
  id: number,
  name: string,
};

export type appVersion = {
  version: string,
  force_update: boolean,
};

export type Station = {
  data_state: number,
  data_state_name: string,
  data_value: string,
  name: string,
  value: number,
};

export type appVersion = {
  version: string,
  force_update: boolean,
};

export type TrainTrip = {
  trip_id: number,
  train_id: number,
  train_number: number,
  route_name: string,
  depart_datetime: moment.Moment,
  arrival_datetime: moment.Moment,
  wagon: {
    [key: string]: {
      //wagon_type_id
      [key: string]: TrainWagon, //seat_class_id
    },
  },
};
export type TrainWagon = {
  wagon_type_id: number,
  wagon_type: 'PL' | 'ÜM',
  seat_class: 'IK' | 'St',
  seat_class_id: number,
  meal: number,
  tam_st_alt: number,
  ushaq_st_alt: number,
  tam_st_ust: number,
  ushaq_st_ust: number,
  min_price: number, //calculated
  max_price: number, //calculated
  free_seats_count: number, //calculated
  wagons: Wagon[],
};

export type UserInfo = {
  id: number,
  name: string,
  surname: string,
  father_n: string,
  p_number: string,
  p_serial: string,
  nationality: number,
  birth: string,
  ticket_type: number, //1 | 2 | 3,
  sex: 1 | 2,
  add_to_base: boolean,
  selected: boolean, // saved adamlardan seçiləndə bu selected olur
  seat?: SeatStatus,
  seat_return?: SeatStatus,
  email?: string,
  phone?: string,
};

export type Wagon = {
  wagon_id: number,
  wagon_no: string,
  free_seats_count: number,
  trip_id: number, //calculated
  wagon_type_id: number, //calculated
  seat_class_id: number, //calculated
};
export type PassengerData = {
  id: number,
  name: string,
  surname: string,
  father_n: string,
  p_number: string,
  p_serial: string,
  nationality: number,
  birth: string,
  ticket_type: number, //1 | 2 | 3,
  sex: 1 | 2,
  add_to_base: boolean,
  selected: boolean, // saved adamlardan seçiləndə bu selected olur
  seat?: SeatStatus,
  seat_return?: SeatStatus,
  additional_seat?: boolean,
  email?: string,
  phone?: string,
};
export type SeatStatus = {
  id: number,
  coupe_type_id: number,
  seat_no: number,
  seat_label: number,
  seat_class_id: number,
  seat_type_id: number,
  seat_status_id: number,
  wagon_type_id: number, //calculated
  wagon_title: string, //calculated
  full_money: string,
  child_money: string,
};
export type TripRoute = {
  from_input: string,
  from_station: number,
  to_input: string,
  to_station: number,
  departureDate: moment.Moment,
  returnDate: moment.Moment,
  two_way: boolean,
  accept_rules: boolean,
  to_trip_train_index: number,
  to_trip_train_wagon_type_id: number,
  to_trip_train_seat_class_id: number,
  from_trip_train_index: number,
  from_trip_train_wagon_type_id: number,
  from_trip_train_seat_class_id: number,
  ticket_type: string,
  passengers_count: number,
  passengers: {
    infant: number,
    child: number,
    adults: number,
  },
  passengers_data: PassengersByType,
  linens: boolean,
  payment_method: PaymentMethods | '',
};
export type PassengersByType = {
  infant: PassengerData[],
  child: PassengerData[],
  adults: PassengerData[],
};

export type PaymentMethods = 'tam_kart' | 'cib';