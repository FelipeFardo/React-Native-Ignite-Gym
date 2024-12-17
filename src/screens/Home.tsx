import { Group } from '@components/Group'
import { HomeHeader } from '@components/HomeHeader'
import { FlatList } from 'react-native'

import { VStack, HStack, Heading, Text, useToast } from '@gluestack-ui/themed'
import { useCallback, useEffect, useState } from 'react'
import { ExerciseCard } from '@components/ExerciseCard'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import type { AppNavigatorRoutesProps } from '@routes/app.routes'
import { AppError } from '@utils/AppError'
import { ToastMessage } from '@components/ToastMessage'
import { api } from '@services/api'
import { ExerciseDTO } from '@dtos/ExerciseDTO'
import { Loading } from '@components/Loading'

export function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [exercises, setExercises] = useState<ExerciseDTO[]>([])
  const [groups, setGroups] = useState<string[]>([])
  const [groupSelected, setGroupSelected] = useState<string>('')

  const toast = useToast()
  const navigation = useNavigation<AppNavigatorRoutesProps>()

  function handleOpenExerciseDetails(exerciseId:string) {
    navigation.navigate('exercise', { exerciseId })
  }

  async function fetchGroups() {
    try {
      const response = await api.get('/groups')
      setGroups(response.data)
      setGroupSelected(response.data[0])
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError
        ? error.message
        : 'Não foi possível carregar os grupos musculares'
      toast.show({
        placement:"top",
        render: ({ id }) => {
          return (
            <ToastMessage
              id={id}

              action="error"
              title={title}
              onClose={() => toast.close(id)}
            />
          )
        },
      })
    } 
  }

  async function fetchExercisesByGroup() {
    try {
      setIsLoading(true)
      const response = await api.get(`/exercises/bygroup/${groupSelected}`)
      setExercises(response.data)
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError
        ? error.message
        : 'Não foi possível carregar exercícios'
      toast.show({
        placement:"top",
        render: ({ id }) => {
          return (
            <ToastMessage
              id={id}
              action="error"
              title={title}
              onClose={() => toast.close(id)}
            />
          )
        },
      })
    } finally{
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  useFocusEffect(
    useCallback(() => {
      fetchExercisesByGroup()
    }, [groupSelected]),
  )

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
              setGroupSelected(item)
            }}
          />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 32 }}
        style={{ marginVertical: 40, maxHeight: 44, minHeight: 44 }}
      />

        {isLoading && <Loading/>}
      {!isLoading && 
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
          keyExtractor={(item) => String(item.id)}
          renderItem={({item}) => (
            <ExerciseCard onPress={()=> handleOpenExerciseDetails(item.id)} exercise={item}/>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </VStack>
      }
    </VStack>
  )
}
