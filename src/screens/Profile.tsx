import { useEffect, useState } from 'react'
import { ScrollView, TouchableOpacity } from 'react-native'

import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'

import { api } from '@services/api'

import { Button } from '@components/Button'
import { Input } from '@components/Input'
import { ScreenHeader } from '@components/ScreenHeader'
import { UserPhoto } from '@components/UserPhoto'
import { ToastMessage } from '@components/ToastMessage'
import defaultUserPhotoImg from '@assets/userPhotoDefault.png'
import { Center, VStack, Text, Heading, useToast } from '@gluestack-ui/themed'

import { useAuth } from '@hooks/useAuth'

import * as yup from 'yup'
import { AppError } from '@utils/AppError'


const profileSchema = yup.object({
  name: yup.string().required('Informe o nome.'),
  email: yup.string().required('Informe o nome.'),
  password: yup.string().min(6, 'A senha deve ter pelo menos 6 dígitos').nullable().transform((value)=> value || null),
  confirm_password: yup
  .string()
  .nullable()
  .transform((value)=> value || null)
  .oneOf([yup.ref('password'), null], 'A confirmação de senha não confere.')
  .when('password', {
    is:(Field:any) => Field,
    then:(schema)=> schema.nullable().required('Informe a confirmação da senha')
  })
  .transform((value)=> value || null),
  old_password: yup.string().nullable(),
})

type ProfileSchema = yup.InferType<typeof profileSchema>

export function Profile() {
  const [isUpdating, setIsUpdating] = useState(false)


  const toast = useToast()
  const { user,updateUserProfile } = useAuth()
  
  const { control, handleSubmit,formState: {errors},reset } = useForm<ProfileSchema>({
    defaultValues: {
    name: user.name,
    email: user.email
    },
    resolver: yupResolver(profileSchema)
  })

  async function handleUserPhotoSelect() {
    try {
      const photoSelected = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 1,
        aspect: [4, 4],
        allowsEditing: true,
      })


      if (photoSelected.canceled) return

      const photoURI = photoSelected.assets[0].uri
   
      if (photoURI) {
        const photoInfo = (await FileSystem.getInfoAsync(photoURI)) as {
          size: number
        }

        if (photoInfo.size && photoInfo.size / 1024 / 1024 > 5) {
          toast.show({
            placement: 'top',
            render: ({ id }) => {
              return (
                <ToastMessage
                  id={id}
                  action="error"
                  title="Essa imagem é muito grande. Escolha uma de até 5MB"
                  onClose={() => toast.close(id)}
                />
              )
            },
          })
          return
        }

        const filesExtensions = photoURI.split('.').pop()
        
        const photoFile = {
          name:`${user.name}.${filesExtensions}`.toLocaleLowerCase(),
          uri: photoURI,
          type: `${photoSelected.assets[0].type}/${filesExtensions}`
        } as any
        
        const userPhotoUploadForm = new FormData()
        userPhotoUploadForm.append('avatar', photoFile)

        const avatarUpdatedResponse = await api.patch('/users/avatar',userPhotoUploadForm, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        const userUpdated = user;
        userUpdated.avatar = avatarUpdatedResponse.data.avatar
        
        await updateUserProfile(userUpdated)
        
        toast.show({
          placement: 'top',
          render: ({ id }) => {
            return (
              <ToastMessage
                id={id}
                action="success"
                title='Foto atualizada'
                onClose={() => toast.close(id)}
              />
            )
          },
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  async function handleProfileUpdate({name,password,old_password}: ProfileSchema){
    try {
      setIsUpdating(true)

      const userUpdated = user
      userUpdated.name = name

       await api.put('/users', {
          name,
          password,
          old_password
        })

        await updateUserProfile(userUpdated)
        
        
        toast.show({
          placement: 'top',
          render: ({ id }) => {
            return (
              <ToastMessage
                id={id}
                action="success"
                title='Perfil atualizado com sucesso'
                onClose={() => toast.close(id)}
              />
            )
          },
        })

        reset({
          confirm_password:null,
          old_password:null,
          password:null,
          name: name
        })
    } catch (error) {
      const isAppError= error instanceof AppError;
      const title = isAppError ? error.message: 'Não foi possível atualizar os dados. Tente novamente mais tarde'
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
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <VStack flex={1}>
      <ScreenHeader title="Perfil" />
      <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
        <Center mt="$6" px="$10">
          <UserPhoto
            source={user.avatar ? { uri: `${api.defaults.baseURL}/avatar/${user.avatar}` } : defaultUserPhotoImg}
            alt="Foto do usuário"
            size="xl"
          />
          <TouchableOpacity onPress={handleUserPhotoSelect}>
            <Text
              color="$green500"
              fontFamily="$heading"
              fontSize="$md"
              mt="$2"
              mb="$8"
            >
              Alterar Foto
            </Text>
          </TouchableOpacity>
          <Center w="$full" gap="$4">
            <Controller
              control={control }
              name='name'
              render={({field: {value, onChange}})=> (
                <Input placeholder="name" bg="$gray600" value={value} onChangeText={onChange} errorMessage={errors.name?.message} />
              )
            }/>
            <Controller
              control={control }
              name='email'
              render={({field: {value, onChange}})=> (
                <Input placeholder="E-mail" bg="$gray600" isReadOnly value={value} onChangeText={onChange} />
              )
            }/>
          </Center>
          <Heading
            alignSelf="flex-start"
            fontFamily="$heading"
            color="$gray200"
            fontSize="$md"
            mt="$12"
            mb="$2"
          >
            Alterar senha
          </Heading>
          <Center w="$full" gap="$4">
          <Controller
              control={control }
              name='old_password'
              render={({field: { value, onChange}})=> (
                <Input placeholder="Senha antiga" bg="$gray600" value={value || ''} secureTextEntry onChangeText={onChange}/>
              )
            }/>

            <Controller
              control={control}
              name='password'
              render={({field: { value, onChange}})=> (
                <Input placeholder="Nova senha" bg="$gray600" secureTextEntry  value={value || ''} onChangeText={onChange} errorMessage={errors.password?.message}/>)
            }/>     
            <Controller
              control={control}
              name='confirm_password'
              render={({field: {value, onChange}})=> (
                <Input
                  placeholder="Confirme a nova senha"
                  bg="$gray600"
                  secureTextEntry
                  onChangeText={onChange}
                  value={value || ''}
                  errorMessage={errors.confirm_password?.message}
                />
              )}
            />     
            <Button title="Atualizar" disabled={isUpdating} onPress={handleSubmit(handleProfileUpdate)} />
          </Center>
        </Center>
      </ScrollView>
    </VStack>
  )
}
