// All user-facing copy lives here so screens stay free of literals and wording is easy to change.

export const COMMON_STRINGS = {
  emptyValue: '—',
} as const;

export const AUTH_STRINGS = {
  invalidEmail: 'Enter a valid email address.',
  enterName: 'Enter your name.',
  passwordTooShort: (minLength: number) => `Password must be at least ${minLength} characters.`,
  passwordsMismatch: 'Passwords do not match.',

  loginHeading: 'Welcome back',
  loginSubtitle: 'Log in to plan a trip and follow your route turn by turn.',
  logoLabel: 'Codenzic logo',
  emailLabel: 'Email',
  emailPlaceholder: 'you@example.com',
  passwordLabel: 'Password',
  passwordPlaceholder: 'Enter your password',
  forgotPassword: 'Forgot password?',
  logIn: 'Log in',
  newToApp: 'New to Wayfare? ',
  createAccountLink: 'Create an account',

  forgotTitle: 'Forgot password? (demo)',
  forgotSubtitle: 'Demo only — no reset email is sent. Enter an email to preview the flow.',
  forgotSuccess: (email: string) => `Demo complete for ${email}. No reset email was sent.`,
  sendResetLink: 'Send reset link',
  backToLogin: 'Back to log in',

  signupTitle: 'Create an account (demo)',
  signupDoneTitle: 'Demo sign-up complete',
  signupSubtitle: 'Demo only — this form does not create a real account.',
  signupSuccess: (name: string) => `Demo complete, ${name}. No account was created.`,
  fullNameLabel: 'Full name',
  fullNamePlaceholder: 'Your name',
  signupPasswordPlaceholder: 'At least 6 characters',
  confirmPasswordLabel: 'Confirm password',
  confirmPasswordPlaceholder: 'Re-enter your password',
  createAccount: 'Create account',
  continueInDemo: 'Continue in demo mode',

  showPassword: 'Show password',
  hidePassword: 'Hide password',
  closeDialog: 'Close dialog',
  close: 'Close',
} as const;

export const LOCATION_STRINGS = {
  heading: 'Where are you going?',
  subtitle: 'Step 1 of 2 · Set pickup and drop-off',
  back: 'Go back',
  pickupLabel: 'Pickup',
  dropoffLabel: 'Drop-off',
  pickupAccessibility: 'Pickup location',
  dropoffAccessibility: 'Drop-off location',
  pickupPlaceholder: 'Choose a starting point',
  dropoffPlaceholder: 'Choose a destination',
  clearPickup: 'Clear pickup',
  clearDropoff: 'Clear drop-off',
  swap: 'Swap pickup and drop-off',
  useCurrent: 'Use current',
  locating: 'Locating…',
  pickOnMap: 'Pick on map',
  setAsPickup: 'Set as pickup',
  setAsDropoff: 'Set as drop-off',
  next: 'Next',
  loadingSuggestions: 'Loading suggestions',
  missingPlacesKey:
    'Add EXPO_PUBLIC_GOOGLE_PLACES_API_KEY to your local .env to enable live Google Places suggestions.',
  suggestionsFailed:
    'Could not load suggestions. Check your connection and keep typing to try again.',
  permissionDenied:
    'Location permission was denied. Allow it in Settings or search for an address.',
  locationUnavailable: 'Could not get your location. Check that location services are on.',
  emptyWithSearch:
    'No saved places match that. Keep typing and pick a suggestion to set the address.',
  emptyWithoutSearch: 'No saved places match that. Google Places search is not configured.',
  incompleteTitle: 'Choose locations from suggestions',
  incompleteMessage:
    'Select both pickup and drop-off from the saved places or Google Places results so the route can use real coordinates.',
  sameLocationTitle: 'Choose different locations',
  sameLocationMessage: 'Pickup and drop-off must be different.',
  placeDetailsFailedTitle: 'Could not select place',
  placeDetailsFailedMessage: 'Check that Places API (New) is enabled and your key has permission.',
  mapTitlePickup: 'Set pickup on map',
  mapTitleDropoff: 'Set drop-off on map',
} as const;

export const MAP_STRINGS = {
  closeMap: 'Close map',
  confirmLocation: 'Confirm location',
  loadingMap: 'Loading map…',
  moveHint: 'Move the map to place the pin on your spot.',
  webUnavailable:
    'Map selection is available in the mobile app. Use search or a saved place on the web.',
  useMapCenter: 'Use map centre',
  pickupMarker: 'Pickup',
  destinationMarker: 'Destination',
  webMapTitle: 'Interactive Route Map',
} as const;

export const ROUTE_STRINGS = {
  defaultPickup: 'Pickup',
  defaultDropoff: 'Destination',
  invalidTitle: 'Invalid locations',
  invalidMessage:
    'Pickup and destination coordinates are missing or invalid. Choose both places again to see a route.',
  chooseLocations: 'Choose locations',
  backToLocations: 'Go back to locations',
  toggleLayers: 'Toggle map layers',
  eyebrow: 'Fastest route',
  calculating: 'Calculating…',
  routeUnavailable: 'Route unavailable',
  configurationRequired: 'Configuration required',
  apiSetupRequired: 'API setup required',
  arrive: 'arrive ',
  turnByTurn: 'Turn by turn',
  directionsPlaceholder: 'Route directions will appear here.',
  startNavigation: 'Start navigation',
  navigationPromptTitle: 'Open turn-by-turn navigation?',
  navigationPromptMessage: 'This opens Google Maps for live GPS guidance.',
  openMaps: 'Open Maps',
  cancel: 'Cancel',
  heavyTraffic: 'Heavy traffic on your route',
  moderateTraffic: 'Moderate traffic on your route',
  missingRoutesKey:
    'Add EXPO_PUBLIC_GOOGLE_ROUTES_API_KEY to calculate road routes and travel time.',
  apiDisabled:
    'Routes API is disabled in Google Cloud Console. Enable "Routes API" for the project that owns your key.',
  noRoute: 'No route returned',
  unexpectedResponse: 'Unexpected Routes API response',
  genericFailure: 'Could not calculate a route.',
  modeDrive: 'Drive',
  modeRide: 'Ride',
  modeWalk: 'Walk',
} as const;
