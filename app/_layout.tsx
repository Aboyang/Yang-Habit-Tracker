import { Stack, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth } from "../lib/firebaseConfig"
import { GestureHandlerRootView } from 'react-native-gesture-handler'

function RouteGuard({children}: {children: React.ReactNode}) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      if (!currentUser) {
        router.replace("/AuthScreen")
      } else {
        router.replace("/(tabs)")
      }
    })
    return unsubscribe
  }, [])

  return <>{children}</>
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RouteGuard>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }}/>
          <Stack.Screen name="AuthScreen" options={{ headerShown: false }}/>
        </Stack>
      </RouteGuard>
    </GestureHandlerRootView>
  )
}
