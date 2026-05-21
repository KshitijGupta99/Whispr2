import { GoogleSignin } from "@react-native-google-signin/google-signin";
import Constants from "expo-constants";

import { config } from "@/constants/config";

/**
 * True when running a custom dev/release build (not the Expo Go app).
 */
export function isNativeGoogleSignInAvailable(): boolean {
  return Constants.appOwnership !== "expo";
}

/**
 * Native Google Sign-In — requires `npm run android` / dev client, not Expo Go.
 */
export async function signInWithGoogleNative(): Promise<string> {
  if (Constants.appOwnership === "expo") {
    throw new Error(
      "Expo Go is not supported. Run: npm run android (or npm run ios), then npm start",
    );
  }

  if (config.googleWebClientId) {
    GoogleSignin.configure({ webClientId: config.googleWebClientId });
  }

  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  } catch {
    throw new Error("Google Play Services not available. Update Play Services and try again.");
  }

  const response = await GoogleSignin.signIn();
  if (response.type !== "success") {
    if (response.type === "cancelled") throw new Error("Sign-in cancelled");
    throw new Error(`Sign-in failed: ${response.type}`);
  }

  const idToken = response.data.idToken;
  if (!idToken) throw new Error("Google Sign-In did not return an ID token.");
  return idToken;
}
