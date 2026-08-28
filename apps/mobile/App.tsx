import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  BackHandler,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { WebView, type WebViewMessageEvent, type WebViewNavigation } from 'react-native-webview'

const WEBSITE_URL = 'https://my-partner-web.vercel.app/'
const WEBSITE_HOST = new URL(WEBSITE_URL).hostname
const ROUTE_READY_MESSAGE = 'MYPARTNER_ROUTE_READY'
const injectedRouteReadyScript = `
  (function () {
    if (window.__mypartnerRouteReadyBridgeInstalled) return true;
    window.__mypartnerRouteReadyBridgeInstalled = true;

    var notifyReady = function () {
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
        type: '${ROUTE_READY_MESSAGE}',
        url: window.location.href
      }));
    };

    var scheduleReady = function () {
      window.requestAnimationFrame(function () {
        window.setTimeout(notifyReady, 0);
      });
    };

    var pushState = window.history.pushState;
    var replaceState = window.history.replaceState;

    window.history.pushState = function () {
      var result = pushState.apply(this, arguments);
      scheduleReady();
      return result;
    };

    window.history.replaceState = function () {
      var result = replaceState.apply(this, arguments);
      scheduleReady();
      return result;
    };

    window.addEventListener('popstate', scheduleReady);
    window.addEventListener('load', scheduleReady);
    document.addEventListener('DOMContentLoaded', scheduleReady);
    scheduleReady();
    return true;
  })();
`

export default function App() {
  const webViewRef = useRef<WebView>(null)
  const canGoBackRef = useRef(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!isLoading) return

    const timeout = setTimeout(() => {
      setIsLoading(false)
    }, 15000)

    return () => clearTimeout(timeout)
  }, [isLoading])

  useEffect(() => {
    if (Platform.OS !== 'android') return

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!canGoBackRef.current) return false
      webViewRef.current?.goBack()
      return true
    })

    return () => subscription.remove()
  }, [])

  const openExternalUrl = useCallback(async (url: string) => {
    try {
      await Linking.openURL(url)
    } catch {
      // Keep the user inside the app if their device cannot open the link.
    }
  }, [])

  const shouldStartLoad = useCallback(
    (request: WebViewNavigation) => {
      if (request.url === 'about:blank') return true

      try {
        const target = new URL(request.url)
        if (target.hostname === WEBSITE_HOST) return true
      } catch {
        // Non-HTTP URLs such as mailto: and tel: should be handled by the device.
      }

      void openExternalUrl(request.url)
      return false
    },
    [openExternalUrl],
  )

  const retry = () => {
    setHasError(false)
    setIsLoading(true)
    setReloadKey(key => key + 1)
  }

  const handleWebMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data) as { type?: string; url?: string }
      if (message.type !== ROUTE_READY_MESSAGE || !message.url) return

      const target = new URL(message.url)
      if (target.hostname === WEBSITE_HOST) {
        setIsLoading(false)
      }
    } catch {
      // Ignore messages that are not from our route-ready bridge.
    }
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D241B" />
      {hasError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.title}>Couldn’t open myPartner</Text>
          <Text style={styles.message}>
            Check your internet connection and try again.
          </Text>
          <TouchableOpacity accessibilityRole="button" style={styles.button} onPress={retry}>
            <Text style={styles.buttonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <WebView
          key={reloadKey}
          ref={webViewRef}
          source={{ uri: WEBSITE_URL }}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onMessage={handleWebMessage}
          onNavigationStateChange={state => {
            canGoBackRef.current = state.canGoBack
          }}
          onError={() => {
            setIsLoading(false)
            setHasError(true)
          }}
          onShouldStartLoadWithRequest={shouldStartLoad}
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          javaScriptEnabled
          domStorageEnabled
          injectedJavaScript={injectedRouteReadyScript}
          allowsBackForwardNavigationGestures
          setSupportMultipleWindows={false}
        />
      )}
      {isLoading && !hasError ? (
        <View pointerEvents="none" style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2C7A5B" />
        </View>
      ) : null}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D241B' },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F8F5',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#F7F8F5',
  },
  title: { color: '#163C2C', fontSize: 22, fontWeight: '700', textAlign: 'center' },
  message: { color: '#496057', fontSize: 16, lineHeight: 24, marginTop: 12, textAlign: 'center' },
  button: { backgroundColor: '#2C7A5B', borderRadius: 10, marginTop: 28, paddingHorizontal: 22, paddingVertical: 13 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
})
