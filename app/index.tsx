// This screen intentionally renders nothing. _layout.tsx's session/
// onboarding check is the single source of truth for where the app
// should land — this used to hardcode <Redirect href="/onboarding" />,
// which fired immediately on every launch (including reopening an
// already-logged-in session) before that real check had a chance to
// run, causing a visible flash of the onboarding screen before the
// correct destination took over a moment later. The native splash
// screen stays visible over this blank frame instead (see the
// SplashScreen.hideAsync() timing fix in _layout.tsx).
export default function Index() {
  return null;
}