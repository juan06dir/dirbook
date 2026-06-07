import 'react-native-url-polyfill/auto';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AppNavigator from './src/navigation';
import { View, ActivityIndicator, Text } from 'react-native';
import { colors } from './src/theme';

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

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

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
