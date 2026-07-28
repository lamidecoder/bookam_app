import { router } from 'expo-router';

/**
 * Where to send someone after they successfully authenticate (login,
 * or completing signup via OTP verification) - honors wherever they
 * were trying to go before being asked to sign in, rather than always
 * dumping everyone on Home regardless of what they were actually
 * doing. Two shapes: a simple path (Saved Properties, Notification
 * Settings), or the richer property+dates case for resuming an
 * in-progress booking.
 */
export function goToPostAuthDestination(params: {
  returnToProperty?: string;
  returnCheckIn?: string;
  returnCheckOut?: string;
  returnTo?: string;
}) {
  if (params.returnToProperty) {
    router.replace({
      pathname: '/search/property-detail',
      params: {
        propertyId: params.returnToProperty,
        returnCheckIn: params.returnCheckIn || '',
        returnCheckOut: params.returnCheckOut || '',
      },
    });
  } else if (params.returnTo) {
    router.replace(params.returnTo as any);
  } else {
    router.replace('/tabs/home');
  }
}

/**
 * The subset of return params worth carrying forward when navigating
 * between auth screens (e.g. register -> otp-verify) - pass this
 * through so the final success screen still has what it needs.
 */
export function extractReturnParams(params: Record<string, any>) {
  const result: Record<string, string> = {};
  if (params.returnToProperty) result.returnToProperty = params.returnToProperty as string;
  if (params.returnCheckIn) result.returnCheckIn = params.returnCheckIn as string;
  if (params.returnCheckOut) result.returnCheckOut = params.returnCheckOut as string;
  if (params.returnTo) result.returnTo = params.returnTo as string;
  return result;
}