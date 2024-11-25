import { Group } from "@components/Group";
import { HomeHeader } from "@components/HomeHeader";
import { FlatList } from "react-native";

import { VStack } from "@gluestack-ui/themed";
import { useState } from "react";
import { HStack } from "@gluestack-ui/themed";
import { Heading } from "@gluestack-ui/themed";
import { Text } from "@gluestack-ui/themed";
import { ExerciseCard } from "@components/ExerciseCard";

export function Home() {
  const [exercises, setExercises] = useState([
    "Puxada frontal",
    "Remada Curvada",
    "Remada Unilateral",
    "1",
    "2",
    "3",
  ]);
  const [groups] = useState(["Costas", "Biceps", "Triceps", "Ombro"]);
  const [groupSelected, setGroupSelected] = useState("Costas");
  return (
    <VStack flex={1}>
      <HomeHeader />
      <FlatList
        data={groups}
        keyExtractor={(item) => String(item)}
        renderItem={({ item }) => (
          <Group
            name={item}
            isActive={item.toLowerCase() === groupSelected.toLowerCase()}
            onPress={() => {
              setGroupSelected(item);
            }}
          />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 32 }}
        style={{ marginVertical: 40, maxHeight: 44, minHeight: 44 }}
      />
      <VStack px="$8" flex={1}>
        <HStack justifyContent="space-between" mb="$5" alignItems="center">
          <Heading color="$gray200" fontSize="$md" fontFamily="$heading">
            Exercícios
          </Heading>
          <Text color="$gray200" fontSize="$sm" fontFamily="$body">
            {exercises.length}
          </Text>
        </HStack>
        <FlatList
          data={exercises}
          keyExtractor={(item) => item}
          renderItem={() => <ExerciseCard />}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </VStack>
    </VStack>
  );
}
