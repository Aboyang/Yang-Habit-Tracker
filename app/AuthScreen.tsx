import { useState } from "react"
import { KeyboardAvoidingView, Platform, View, StyleSheet } from "react-native"
import {Text, TextInput, Button, useTheme} from 'react-native-paper'
import { auth } from "../lib/firebaseConfig"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, User } from "firebase/auth"

function AuthScreen() {

    const theme = useTheme()

    const [isSignUp, setIsSignUp] = useState<boolean>(false)
    const [email, setEmail] = useState<string>("")
    const [pwd, setPwd] = useState<string>("")
    const [error, setError] = useState<string>('')
    const [user, setUser] = useState<User | null>(null)

    async function handleSignUp () {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, pwd)
            setUser(userCredential.user)
            console.log("User registered:", userCredential.user.email)
        } catch (error: any) {
            console.log(error.message)
            setError(error.message)
        }
    }

    async function handleSignIn() {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, pwd)
            setUser(userCredential.user)
            console.log("User signed in:", userCredential.user.email)
        } catch (error: any) {
            console.log(error.message)
            setError(error.message)
        }
    }

    async function handleAuth() {
        if (!email || !pwd) {
            setError("Please fill in all fields")
            return
        }
        if (pwd.length < 8) {
            setError("Password must be at least 8 characters wrong")
            return
        }
        if (isSignUp) {
            await handleSignUp()
        } else {
            await handleSignIn()
        }
    }

    function handleSwitchMode() {
        setIsSignUp(!isSignUp)
    }

    return (
        <KeyboardAvoidingView style={styles.mainContainer} behavior={Platform.OS === 'ios'? 'padding' : 'height'}>
            <View style={styles.content}>

                <Text style={styles.title}> {isSignUp? "Create Account" : "Welcome Back"}</Text>

                <TextInput
                    label="Email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="example@gmail.com"
                    mode="outlined"
                    theme={{ colors: { primary: 'coral', outline: 'coral', background: '#fdf0e5'}}}
                    onChangeText={(value) => {
                        setEmail(value)
                        setError('')
                    }}
                >
                </TextInput>

                <TextInput
                    label="Password"
                    autoCapitalize="none"
                    secureTextEntry
                    mode="outlined"
                    theme={{ colors: { primary: 'coral', outline: 'coral', background: '#fdf0e5'}}}
                    onChangeText={(value) => {
                        setPwd(value)
                        setError('')
                    }}
                >
                </TextInput>

                {
                    error && (<Text style={{color: theme.colors.error}}>{error}</Text>)
                }

                <Button style={styles.btn} mode="contained" onPress={handleAuth}>{isSignUp? "Sign Up" : "Sign In"}</Button>
                
                <Button 
                    mode="text"
                    theme={{ colors: {primary: 'black'} }}
                    onPress={handleSwitchMode}
                >
                    {
                    isSignUp? 
                    "Already have an account? Sign In" : 
                    "Don't have an account? Sign Up"
                    }
                </Button>

            </View>
        </KeyboardAvoidingView>
    )
}

export default AuthScreen

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: 'white',
    },

    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 40,
        gap: 8
    },

    title: {
        textAlign: 'center',
        fontFamily: 'verdana',
        fontSize: 24
    },

    input: {
        borderColor: 'coral'
    },

    btn: {
        marginTop: 8,
        backgroundColor: 'coral'
    }

})