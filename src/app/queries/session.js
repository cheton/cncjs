import { useMutation } from '@tanstack/react-query';
import { signin, signout } from '@app/lib/user';

export { signin };

export const useSigninMutation = () => useMutation({
  mutationFn: signin,
  retry: false,
});

export const clearSessionQueryCache = async (queryClient) => {
  await queryClient.cancelQueries();
  queryClient.clear();
};

export const signoutAndClearSession = async (queryClient) => {
  await signout();
  await clearSessionQueryCache(queryClient);
};
