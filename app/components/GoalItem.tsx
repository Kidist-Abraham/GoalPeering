import React from "react";
import { Alert, View, Text, Pressable, StyleSheet, Button } from "react-native";
import { useRouter } from "expo-router";
import {  Goals, JoinGoals, VoteGoal } from "../api/goalsApi";
import * as Progress from 'react-native-progress';



export function GoalItem({ item, token, reload }: { item: Goals, token: string | null, reload: ()=>void }) {
  const router = useRouter();
  const handleJoin = async () => {
    try {
      await JoinGoals(Number(item.id), token);
      Alert.alert("Success", "You Joined the goal");
      router.push(`/goal/${item.id}`);
    } catch (error) {
      console.error("Join goal error:", error);
      Alert.alert("Error", "Failed to join a goal.");
    }
    
  };

  const handleVote = async (vote: string) => {
    try {
      await VoteGoal(Number(item.id), vote, token);
      Alert.alert("Success", "Your Vote is registered");
      reload()
      
    } catch (error) {
      console.error("Vote goal error:", error);
      Alert.alert("Error", "Failed to Vote a goal.");
    }
    
  };
  

  if (item.joined) {
    return (
      <View style= {styles.itemContainer}>
          <Text style={styles.goalName}>{item.name}</Text>
      <Text style={styles.goalDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.container}>
        <Button onPress={()=> router.push(`/goal/${item.id}`)} title="Go to Goal"/>
        </View>
  
      </View>
      
    );

  }

  else if (item.status == 'PENDING' && !item.user_voted) {
    return (
      <View style= {styles.itemContainer}>
        <Text style={styles.goalName}>{item.name}</Text>
        <Text style={styles.goalDescription} numberOfLines={2}>
          {item.description}
        </Text>
        

        


<View style={{ flexDirection: 'row', alignItems: 'center', padding: 20 }}>
<View style={{ flex: 1, marginRight: 10 }}>



        <Progress.Bar 
          progress={item.vote_count / 2} 
          width={null} 
          color="gray" 
          borderRadius={10} 
        />
</View>
<Text>{`${item.vote_count} / ${2}`}</Text>
</View>
        <View style={styles.container}>
        <Text style={styles.goalStatus}> This group is pending </Text>
        <Button onPress={()=> handleVote('upvote')} title="Vote for Group"/>
        </View>
  
      </View>
      
    );
  }
  else if (item.status == 'PENDING' && item.user_voted) {
    return (
      <View style= {styles.itemContainer}>
        <Text style={styles.goalName}>{item.name}</Text>
        <Text style={styles.goalDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20 }}>
        <View style={{ flex: 1, marginRight: 10 }}>


<Progress.Bar 
  progress={item.vote_count / 2} 
  width={null} 
  color="green" 
  borderRadius={5} 
/>
</View>

<Text>{`${item.vote_count} / ${2}`}</Text>
      </View>
        <View style={styles.container}>
        <Text style={styles.goalStatus}> This group is pending. </Text>
        <Button onPress={() => handleVote('remove')} title="Remove Vote"/>
        </View>
  
      </View>
      
    );
  }
  else if (item.status == 'ACTIVE' && !item.joined) {
    return (
      <View style= {styles.itemContainer}>
          <Text style={styles.goalName}>{item.name}</Text>
      <Text style={styles.goalDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.container}>
        <Button onPress={handleJoin} title="Join Group"/>
        </View>
  
      </View>
      
    );
  }
}

const styles = StyleSheet.create({
  goalContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    marginBottom: 15,
    padding: 10,
  },
  goalName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  goalDescription: {
    fontSize: 14,
    color: "white",
    marginTop: 4,
  },
  goalStatus:{
    marginTop: 4,
    color: "yellow"
  },
  itemContainer :{
    backgroundColor: '#56a375',
    padding: 16,
    marginTop: 10,
  },
  container: { flex: 1, padding: 16, flexDirection: "row"},
});
