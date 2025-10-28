import { View, SafeAreaView, StyleSheet, ScrollView } from "react-native"
import { Text, Button } from 'react-native-paper'
import { getDocs, updateDoc, deleteDoc, collection, doc } from 'firebase/firestore'
import { signOut } from "firebase/auth"
import { auth, db } from "../../lib/firebaseConfig"
import { useFocusEffect } from "expo-router"
import { useState, useCallback, useRef } from "react"
import { Swipeable } from "react-native-gesture-handler"
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import AntDesign from '@expo/vector-icons/AntDesign'

export default function Home() {

  type Habit = {
    id: string,
    title: string,
    desc: string,
    freq: string
    bestStreak: number,
    streakCount: number,
    timeCompleted: string[]
  }

  const [habits, setHabits] = useState<Habit[]>([])

  function streakContinue(freq: string, timeCompleted: string[]) {
    const mostRecentCompletion = new Date(timeCompleted[timeCompleted.length - 1]).getTime()
    const now = new Date()

    switch (freq) {
      case "Daily": 
        return (mostRecentCompletion - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) / 1000 / 60 / 60 / 24 < 1

      case "Weekly": 
        let mark = new Date()
        mark.setDate(now.getDate() - (now.getDay() + 6) % 7)
        mark.setHours(0, 0, 0, 0)
        return (mostRecentCompletion - mark.getTime()) / 1000 / 60 / 60 / 24 / 7 < 1
      case "Monthly": 
        return (mostRecentCompletion - new Date(now.getFullYear(), now.getMonth(), 1).getTime()) / 1000 / 60 / 60 / 24 / 30 < 1
    }
  }

  async function fetchHabit() {
    const user = auth.currentUser
    if (!user) return
    const habitRef = collection(db, "users", user.uid, "habits")
    const snapshot = await getDocs(habitRef)
    const habits = snapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title,
      desc: doc.data().desc,
      freq: doc.data().freq,
      bestStreak: doc.data().bestStreak,
      streakCount: streakContinue(doc.data().freq, doc.data().timeCompleted)? doc.data().streakCount : 0,
      timeCompleted: doc.data().timeCompleted
    })).sort((a, b) => a.freq.length - b.freq.length)
    setHabits(habits)
  }

  // only run fetchHabit when user is in the homepage
  useFocusEffect(
    useCallback(() => {
      fetchHabit()
    }, [])
  )

  // swiping for habit completion & deletion /////////////////////////////////////////////////////////////////////////////
  const swipableRefs = useRef<{ [key: string]: Swipeable | null }>({})

  function renderRightActions(checked: boolean) {
    if (checked) {
      return (
        <View style={styles.rightAction}>
          <Text numberOfLines={1} style={{ fontSize: 16, fontFamily: 'verdana' }}>Habit has been completed. Good job!</Text>
        </View>       
      )
    }

    return (
      <View style={styles.rightAction}>
        <AntDesign name="checkcircle" size={24} color="black" />
      </View>
    )
  }

  function renderLeftActions() {
    return (
      <View style={styles.leftAction}>
        <FontAwesome5 name="trash" size={24} color="black" />
      </View>
    )
  }

  async function handleCheckedHabit(habitID: string, bestStreak: number, currentStreak: number, timeCompleted: string[], checked: boolean) {
    if (checked) return
    const user = auth.currentUser
    if (!user) return
    try {
      const newStreak = currentStreak + 1
      await updateDoc(doc(db, "users", user.uid, "habits", habitID), {
        streakCount: newStreak,
        bestStreak: newStreak > bestStreak? newStreak : bestStreak,
        timeCompleted: [...timeCompleted, new Date().toISOString()]
      })
      console.log("Habit successfully checked")
      fetchHabit()
    } catch (error) {
      console.log(error)
    }
  }

  function completedStyle(timeCompleted: string[], freq: string) {

    if (timeCompleted.length === 0) return false // the habit is just added therefore has never been completed

    const mostRecentCompletion = new Date(timeCompleted[timeCompleted.length - 1])
    const now = new Date()
    let mark = new Date()

    switch (freq) {
      case "Daily": 
        mark = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case "Weekly": 
        mark.setDate(now.getDate() - (now.getDay() + 6) % 7) 
        mark.setHours(0, 0, 0, 0)
        break
      case "Monthly": 
        mark = new Date(now.getFullYear(), now.getMonth(), 1)
        break
    }

    if (mostRecentCompletion > mark) {
      return true
    }
    return false
  }

  async function handleDeleteHabit(habitID: string) {
    const user = auth.currentUser
    if (!user) return
    try {

      await deleteDoc(doc(db, "users", user.uid, "habits", habitID))  
      console.log('Habit successfully deleted')
      setHabits((prevHabits) => {
        const newHabits = [...prevHabits].filter(habit => habit.id !== habitID)
        return newHabits
      })
      
    } catch (error) {
      console.log(error)
    }  
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
  async function handleSignOut() {
    try {
      await signOut(auth)
      console.log("User signed out")
    } catch (error: any) {
      console.log(error.message)
    }      
  }

  return (
    <SafeAreaView style={styles.mainContainer}>

      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>Today's Habit</Text>
        <Button mode='text' icon={'logout'} theme={{ colors: { primary: 'coral' } }}onPress={handleSignOut}>Sign Out</Button>
      </View>

      <ScrollView>
        <View style={styles.habitsContainer}>
          {
            habits.length === 0 ? (
              <Text>No Habits...</Text>
            ) : (
              habits.map((habit) => (
                <Swipeable
                  ref={(ref) => {
                    swipableRefs.current[habit.id] = ref
                  }}
                  key={habit.id}
                  overshootLeft={false}
                  overshootRight={false}
                  renderRightActions={() => renderRightActions(completedStyle(habit.timeCompleted, habit.freq))}
                  renderLeftActions={renderLeftActions}
                  onSwipeableOpen={(direction) => {
                    if (direction === "left") {
                      handleDeleteHabit(habit.id)
                    } else {
                      handleCheckedHabit(habit.id, habit.bestStreak, habit.streakCount, habit.timeCompleted, completedStyle(habit.timeCompleted, habit.freq))
                      swipableRefs.current[habit.id]?.close()
                    }
                  }} 
                >
                  <View style={[styles.habitCard, {opacity: completedStyle(habit.timeCompleted, habit.freq)? 0.4: 1}]}>
                    <Text numberOfLines={1} style={styles.cardTitle}>{habit.title}</Text>
                    <Text numberOfLines={1} style={styles.cardDesc}>{habit.desc}</Text>
                    <View style={styles.cardFooter}>
                      <Text style={styles.cardStreak}>
                        <FontAwesome5 name="fire" size={16} color="black" />
                        {" " + habit.streakCount + " day streak"}
                        </Text>
                      <Text style={[
                        styles.cardFreq, 
                        { backgroundColor: habit.freq === "Daily"?   
                          "#fd5757" :
                          habit.freq === "Weekly" ?
                          "#ff963fff" :
                          "#ffde68ff"
                        }
                      ]}>
                        {habit.freq}
                      </Text>                      
                    </View>

                  </View>
                </Swipeable>
              ))
            )
            
          }
        </View>
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1
  },

  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 30,
    paddingRight: 30,
    paddingTop: 20,
    paddingBottom: 20,
  },

  title: {
    fontFamily: 'verdana',
    fontWeight: 'bold'
  },

  habitsContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 30,
    gap: 16
  },

  habitCard: {
    backgroundColor: '#feeee3',
    padding: 20,
    width: '100%',
    borderRadius: 16,
  },

  cardTitle: {
    fontFamily: 'verdana',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4
  },

  cardDesc: {
    fontFamily: 'verdana',
    fontSize: 16,
    marginBottom: 20
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  cardStreak: {
    fontFamily: 'verdana',
    backgroundColor: 'coral',
    paddingBottom: 4,
    paddingTop: 4,
    paddingLeft: 16,
    paddingRight: 16,
    borderRadius: 16
  }, 

  cardFreq: {
    fontFamily: 'verdana',
    backgroundColor: 'coral',
    paddingBottom: 4,
    paddingTop: 4,
    paddingLeft: 16,
    paddingRight: 16,
    borderRadius: 16
  },

  leftAction: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 16,
    flex: 1,
    backgroundColor: '#e53935',
    borderRadius: 16
  },

  rightAction: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 16,
    flex: 1,
    backgroundColor: '#3cd43cff',
    borderRadius: 16
  }

  

})