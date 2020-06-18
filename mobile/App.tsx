import React, { useState, useEffect } from 'react';
import Routes from './src/routes';
import { StatusBar } from 'react-native'
import {Roboto_400Regular, Roboto_500Medium} from '@expo-google-fonts/roboto';
import {Ubuntu_700Bold, useFonts } from "@expo-google-fonts/ubuntu";
import {AppLoading} from 'expo';

import { View, StyleSheet, Text, Button } from 'react-native';

export default function App() {
  const[fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Ubuntu_700Bold
  })  

  if (!fontsLoaded){
    return <AppLoading/>
  }
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparente" translucent/>
      <Routes />     
    </>    
  );
}

