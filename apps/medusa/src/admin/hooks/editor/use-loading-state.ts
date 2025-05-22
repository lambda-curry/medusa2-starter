import { useNavigation } from 'react-router-dom'

/**
 * Hook to track the loading state of the application
 * @returns Object containing the loading state
 */
export const useLoadingState = () => {
  const navigation = useNavigation()
  const isLoading = navigation.state === 'loading'

  return {
    isLoading,
  }
}
