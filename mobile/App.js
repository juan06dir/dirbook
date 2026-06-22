import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AppNavigator from './src/navigation';
import AnimatedSplash from './src/screens/AnimatedSplash';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { View, Text } from 'react-native';
import { colors } from './src/theme';

const ONBOARDING_KEY = 'dirbook_onboarded_v1';

try { SplashScreen.preventAutoHideAsync(); } catch {}

// ─── Captura de errores globales (async, fuera de React) ─────────────────────
let _globalError = null;
const _origHandler = ErrorUtils.getGlobalHandler?.();
ErrorUtils.setGlobalHandler?.((error, isFatal) => {
  _globalError = error;
  _origHandler?.(error, isFatal);
});

// ─── Error boundary ───────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this._interval = null;
  }
  componentDidMount() {
    // Poll for global (async) errors not caught by getDerivedStateFromError
    this._interval = setInterval(() => {
      if (_globalError && !this.state.hasError) {
        this.setState({ hasError: true, error: _globalError });
      }
    }, 500);
  }
  componentWillUnmount() {
    clearInterval(this._interval);
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ color: '#FACC15', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
            Error detectado
          </Text>
          <Text style={{ color: '#fff', fontSize: 11, textAlign: 'center', marginBottom: 8 }}>
            {this.state.error?.toString()}
          </Text>
          <Text style={{ color: '#666', fontSize: 10, textAlign: 'center' }}>
            {this.state.error?.stack?.slice(0, 300)}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

// ─── Raíz de la app ───────────────────────────────────────────────────────────
function Root() {
  const { loading } = useAuth();
  const [introDone, setIntroDone] = useState(false);     // intro animada de marca
  const [needsOnboarding, setNeedsOnboarding] = useState(null); // null = sin verificar

  // Verificar si el usuario ya vio el onboarding (primera vez que instala)
  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY)
      .then((v) => setNeedsOnboarding(v !== '1'))
      .catch(() => setNeedsOnboarding(false));
  }, []);

  // Ocultar splash nativo en cuanto sabemos el estado de sesión y onboarding
  useEffect(() => {
    if (!loading && needsOnboarding !== null) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loading, needsOnboarding]);

  async function finishOnboarding() {
    try { await AsyncStorage.setItem(ONBOARDING_KEY, '1'); } catch {}
    setNeedsOnboarding(false);
  }

  // Mientras carga sesión o estado de onboarding, mantenemos el splash nativo (sin parpadeo)
  if (loading || needsOnboarding === null) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  // 1) Intro animada de marca (siempre al abrir)
  if (!introDone) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        {/* En usuarios recurrentes mostramos la app detrás para que aparezca al desvanecer */}
        {!needsOnboarding && <AppNavigator />}
        <AnimatedSplash onFinish={() => setIntroDone(true)} />
      </View>
    );
  }

  // 2) Onboarding la primera vez que se instala
  if (needsOnboarding) {
    return <OnboardingScreen onFinish={finishOnboarding} />;
  }

  // 3) App
  return <AppNavigator />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AuthProvider>
            <StatusBar style="light" />
            <Root />
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
