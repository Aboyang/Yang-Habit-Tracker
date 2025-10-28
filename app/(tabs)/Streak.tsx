import { View, SafeAreaView, StyleSheet, ScrollView } from "react-native"
import { Text } from 'react-native-paper'
import { getDocs, collection } from 'firebase/firestore'
import { auth, db } from "../../lib/firebaseConfig"
import { useFocusEffect } from "expo-router"
import { useState, useCallback } from "react"
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'


export default function Streak() {

  type Habit = {
    id: string,
    title: string,
    desc: string,
    bestStreak: number,
    streakCount: number
  }

  const [habits, setHabits] = useState<Habit[]>([])

  async function fetchHabit() {
    const user = auth.currentUser
    if (!user) return
    const habitRef = collection(db, "users", user.uid, "habits")
    const snapshot = await getDocs(habitRef)
    const habits = snapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title,
      desc: doc.data().desc,
      bestStreak: doc.data().bestStreak,
      streakCount: doc.data().streakCount,
    }))
    .filter(a => a.streakCount !== 0 && a.bestStreak !== 0)
    .sort((a, b) => b.streakCount - a.streakCount)

    setHabits(habits)
  }

  // only run fetchHabit when user is in this page
  useFocusEffect(
    useCallback(() => {
      fetchHabit()
    }, [])
  )


  return (
    <SafeAreaView style={styles.mainContainer}>

      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>Streak</Text>
      </View>

      <ScrollView>
        <View style={styles.habitsContainer}>
          {
            habits.length === 0 || habits[0].streakCount === 0? (
              <Text>No Streaks...</Text>
            ) : (
              habits.map((habit, index) => (
                  <View key={index} style={styles.habitCard}>
                    <Text numberOfLines={1} style={styles.cardTitle}>
                      {
                        index === 0?
                        "🥇" : 
                        index === 1?
                        "🥈" :
                        index === 2?
                        "🥉" :
                        ""
                      }
                      {habit.title}
                    </Text>
                    <Text numberOfLines={1} style={styles.cardDesc}>{habit.desc}</Text>
                    <View style={styles.cardFooter}>
                      <Text style={styles.cardStreak}>
                        <FontAwesome5 name="fire" size={16} color="black" />
                        {" Current: " + habit.streakCount}
                        </Text>
                      <Text style={styles.cardStreak}>
                        <FontAwesome5 name="trophy" size={16} color="black" />
                        {" Best: " + habit.bestStreak}
                      </Text>                      
                    </View>

                  </View>
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