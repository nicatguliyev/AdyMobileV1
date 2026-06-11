import React, { useRef } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,

} from 'react-native';

import AppIntroSlider from 'react-native-app-intro-slider';
import strings from '../localization/Localizations';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnBoardOne from '../../assets/images/onboard1.svg';
import OnBoardTwo from '../../assets/images/onboard2.svg';
import OnBoardThree from '../../assets/images/onboard3.svg';
import OnBoardFour from '../../assets/images/onboard4.svg';
import OnBoardFive from '../../assets/images/onboard5.svg';
import user from '../store/user';
import { EncryptedDataStore } from '../utils/encrypt';

const width = Dimensions.get('window').width;

const OnBoarding = ({ navigation }) => {
    const sliderRef = useRef();

    const onSkipPress = () => {
        EncryptedDataStore.set("@onBoarding", 'true');
        user.setIsOnBoarded(true);

        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            })
        );
    }

    const data = [
        {
            image: <OnBoardOne width={width} />,
            title: strings.onboarding_title_1,
            subtitle: strings.onboarding_subtitle_1,
        },
        {
            image: <OnBoardTwo width={width} />,
            title: strings.onboarding_title_2,
            subtitle: strings.onboarding_subtitle_2,
        },
        {
            image: <OnBoardThree width={width} />,
            title: strings.onboarding_title_3,
            subtitle: strings.onboarding_subtitle_3,
        },
        {
            image: <OnBoardFour width={width} />,
            title: strings.onboarding_title_4,
            subtitle: strings.onboarding_subtitle_4,
        },
        {
            image: <OnBoardFive width={width} />,
            title: strings.onboarding_title_5,
            subtitle: strings.onboarding_subtitle_5,
        },
    ];

    return (
        <View style={styles.main_content}>
            <StatusBar backgroundColor={'#D4E2ED'} barStyle={'dark-content'} />
            <View style={styles.header}>
                <TouchableOpacity onPress={onSkipPress}>
                    <Text style={styles.header_button}>{strings.skip}</Text>
                </TouchableOpacity>
            </View>
            <AppIntroSlider
                ref={sliderRef}
                data={data}
                renderPagination={activeIndex => (
                    <Pagination
                        navigation={navigation}
                        activeIndex={activeIndex}
                        data={data}
                        sliderRef={sliderRef}
                        onSkipPress={onSkipPress}
                    />
                )}
                renderItem={SliderItem}
            />
        </View>
    );
};


const Pagination = ({ activeIndex, sliderRef, data, onSkipPress }) => {
    const onNextButtonClick = () => {
        if (data.length - 1 != activeIndex) {
            sliderRef.current.goToSlide(activeIndex + 1);
        } else {
            onSkipPress();
        }
    };
    return (
        <View
            style={{
                width: '100%',
                height: 60,
                alignItems: 'center',
                backgroundColor: '#D4E2ED',
                position: 'absolute',
                bottom: 70,
            }}
        >
            <View
                style={{
                    flexDirection: 'row',
                    marginBottom: 40,
                    justifyContent: 'center',
                }}
            >
                {data.map((value, index) => (
                    <Dot key={index} isActive={activeIndex === index} />
                ))}
            </View>
            <NextButton
                onPress={onNextButtonClick}
                title={data.length - 1 == activeIndex ? strings.finish : strings.next}
            />
        </View>
    );
}

const Dot = ({ isActive }) => {
    return (
        <View
            style={{
                width: 6,
                height: 6,
                backgroundColor: isActive ? '#007BF6' : 'gray',
                borderRadius: 3,
                marginHorizontal: 6,
            }}
        />

    );
};

const NextButton = ({ title, onPress }) => {
    return (
        <TouchableOpacity onPress={onPress} style={styles.button}>
            <Text style={styles.button.title}>
                {title}
            </Text>
        </TouchableOpacity>
    );
};

const SliderItem = ({ item }) => {
    return (
        <View style={styles.slider_item}>
            {/* <Image style={styles.image} resizeMode={'cover'} source={item.image} /> */}


            {/* <View style={{width: '100%',height: 380}}>

      </View> */}
            {item.image}
            <Text style={styles.title}>{item.title}</Text>
            <Text
                style={{
                    color: '#708CA3',
                    textAlign: 'center',
                    fontFamily: 'EuclidCircularA-Regular',
                    marginTop: 12,
                    paddingHorizontal: 16,
                }}
            >
                {item.subtitle}
            </Text>
        </View>
    );
};

export default OnBoarding;


const styles = StyleSheet.create({
    main_content: {
        flex: 1,
        backgroundColor: '#D4E2ED',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingBottom: 20,
        position: 'absolute',
        top: 10,
        right: 0,
        zIndex: 5,
        marginTop: 20,
    },
    header_button: {
        color: '#71787E',
        fontSize: 16,
        fontFamily: 'EuclidCircularA-Regular',
        lineHeight: 24,
    },
    slider_item: {
        flex: 1,
        justifyContent: 'flex-start',
        backgroundColor: '#D4E2ED',
    },
    title: {
        color: '#202224',
        fontSize: 22,
        fontFamily: 'EuclidCircularA-Medium',
        lineHeight: 32,
        marginHorizontal: 16,
        textAlign: 'center',
    },
    button: {
        width: 165,
        justifyContent: 'center',
        backgroundColor: '#007BF7',
        height: 60,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,


        title: {
            color: 'white',
            fontSize: 15,
            fontFamily: 'EuclidCircularA-Medium',
            lineHeight: 20,
        },
    },
    image: {
        height: Dimensions.get('window').width,
        width: Dimensions.get('window').width,
        marginBottom: 24,
        marginTop: 50,
    },
});






