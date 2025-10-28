import { View, KeyboardAvoidingView, StyleSheet } from 'react-native'
import { Text, TextInput, SegmentedButtons, Button } from 'react-native-paper'
import React, { useState } from 'react'
import { addDoc, collection } from 'firebase/firestore'
import { auth, db } from '@/lib/firebaseConfig'

export default function Streak() {

    const FREQS = ['Daily', 'Weekly', 'Monthly']
    const [title, setTitle] = useState<string>("")
    const [desc, setDesc] = useState<string>("")
    const [selectedFreq, setSelectedFreq] = useState<string>('Daily')
    const [status, setStatus] = useState<any>("")

    async function handleAddHabit() {
        const user = auth.currentUser
        if (!user) return
        try {
            setStatus("Adding to habits...")
            // add to firestore: users/userID/habits
            await addDoc(collection(db, "users", user.uid, "habits"), {
                title: title,
                desc: desc,
                freq: selectedFreq,
                streakCount: 0,
                bestStreak: 0,
                timeCompleted: [],
                dateCreated: new Date().toISOString()
            })

            setTitle("")
            setDesc("")
            setSelectedFreq("")
            setStatus("Habit successfully added!")
            setTimeout(() => {
                setStatus("")
            }, 1000)       
        } catch (error ) {
            setStatus(error)
        }
    }

  return (
    <KeyboardAvoidingView style={styles.mainContainer}>
        <View style={styles.content}>

            <TextInput
                label="Title"
                autoCapitalize="none"
                mode="outlined"
                theme={{ colors: { primary: 'coral', outline: 'coral', background: '#fdf0e5'}}}
                value={title}
                onChangeText={setTitle}
            >
            </TextInput>

            <TextInput
                label="Description"
                autoCapitalize="none"
                mode="outlined"
                theme={{ colors: { primary: 'coral', outline: 'coral', background: '#fdf0e5'}}}
                value={desc}
                onChangeText={setDesc}
            >
            </TextInput>

            <SegmentedButtons
                style={{ marginTop: 8 }}
                value={selectedFreq}
                onValueChange={setSelectedFreq}
                buttons={FREQS.map((freq) => ({
                    value: freq,
                    label: freq,
                    style: { backgroundColor: freq === selectedFreq? '#fdf0e5' : 'white' }
                }))}
                theme={{ colors: { outline: 'coral' } }}
            />

            <Button
                mode='contained'
                style={{ marginTop: 8 }}
                theme={{ colors: {primary: 'coral'} }}
                onPress={handleAddHabit}
            >
                Add Habit
            </Button>

            {
                status && (
                <Text 
                    style={{ 
                        color: status === "Adding to habits..." ?
                        'black' :
                        status === "Habit successfully added!" ?
                        'green' :
                        'red'
                    }}
                >
                    {status}
                </Text>)
            }

        </View>
    </KeyboardAvoidingView>
  )
}

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
    }
})