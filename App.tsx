import {  View, StatusBar } from 'react-native';
import { useFonts, Roboto_700Bold, Roboto_400Regular } from '@expo-google-fonts/roboto'
import { Center, GluestackUIStyledProvider,Text } from '@gluestack-ui/themed';
import { config } from'./config/gluestack-ui.config';

export default function App() {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_700Bold
  })

  return (
    <GluestackUIStyledProvider config={config}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent/>
        {fontsLoaded ? (
          <Center flex={1} bg={'$gray700'}>
            <Text color='red'>Home</Text>
          </Center>
          )
        :(
          <View/>
        )}
       </GluestackUIStyledProvider>
  )
}