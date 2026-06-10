import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

const NoItem = props => {
  return (
    <View style={styles.container}>
      {props.iconItem}
      <Text style={styles.textStyles}>{props.text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
    gap: 20,
  },
  textStyles: {
    color: 'black',
    fontWeight: '300',
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});

export default NoItem;