import React from 'react';
import { View, Dimensions } from 'react-native';
import FastImage from '@d11/react-native-fast-image';

const { width, height } = Dimensions.get('screen');
const Loading = props => {


  return (
    <View
      style={[
        {
          display:props.loading ? 'flex':'none' ,
          position: 'absolute',
          width,
          height,
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9,
          backgroundColor: 'rgba(255,255,255,0.5)',
        },
        props.style,
      ]}
    >
      <FastImage
        source={require('../../assets/images/loading.gif')}
        style={{
          width: 100,
          height: 100,
        }}
      />
    </View>
  );
};

export default Loading;