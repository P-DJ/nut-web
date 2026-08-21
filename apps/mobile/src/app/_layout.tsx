import { NativeTabs } from 'expo-router/unstable-native-tabs'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { MobileDataProvider } from '../context/mobile-data'

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <MobileDataProvider>
        <NativeTabs minimizeBehavior="onScrollDown" tintColor="#3e6d47" blurEffect="systemChromeMaterial">
          <NativeTabs.Trigger name="index">
            <NativeTabs.Trigger.Label>首页</NativeTabs.Trigger.Label>
            <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} />
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="timeline">
            <NativeTabs.Trigger.Label>时间线</NativeTabs.Trigger.Label>
            <NativeTabs.Trigger.Icon sf={{ default: 'clock', selected: 'clock.fill' }} />
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="health">
            <NativeTabs.Trigger.Label>健康</NativeTabs.Trigger.Label>
            <NativeTabs.Trigger.Icon sf={{ default: 'heart', selected: 'heart.fill' }} />
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="about">
            <NativeTabs.Trigger.Label>关于</NativeTabs.Trigger.Label>
            <NativeTabs.Trigger.Icon sf={{ default: 'person', selected: 'person.fill' }} />
          </NativeTabs.Trigger>
        </NativeTabs>
      </MobileDataProvider>
    </SafeAreaProvider>
  )
}
