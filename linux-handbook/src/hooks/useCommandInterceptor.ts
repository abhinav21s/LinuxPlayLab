import { useCallback } from 'react';
import { checkCommandInterception, InterceptionResult } from '../services/commandInterceptor';

export interface UseCommandInterceptorOptions {
  onBlocked?: (result: InterceptionResult) => void;
  onAllowed?: (command: string) => void;
}

export const useCommandInterceptor = (options?: UseCommandInterceptorOptions) => {
  const interceptCommand = useCallback(
    (command: string): InterceptionResult => {
      const result = checkCommandInterception(command);

      if (result.isBlocked) {
        options?.onBlocked?.(result);
      } else {
        options?.onAllowed?.(command);
      }

      return result;
    },
    [options]
  );

  return { interceptCommand };
};
