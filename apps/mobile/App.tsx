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
const WEBSITE_ORIGIN = new URL(WEBSITE_URL).origin
const ROUTE_READY_MESSAGE = 'MYPARTNER_ROUTE_READY'
const WEB_ERROR_MESSAGE = 'MYPARTNER_WEB_ERROR'
const WEB_BLANK_MESSAGE = 'MYPARTNER_WEB_BLANK'
const androidStatusBarPadding = Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0
const injectedMobileNavbarScript = `
  (function () {
    var styleId = 'mypartner-mobile-navbar';

    var applyMobileNavbarLayout = function () {
      if (document.getElementById(styleId)) return;

      var style = document.createElement('style');
      style.id = styleId;
      style.textContent = '@media (max-width: 1023px) {' +
        'main > header {' +
          'position: fixed !important;' +
          'inset: 0 0 auto 0 !important;' +
          'z-index: 30 !important;' +
        '}' +
        'main > header + div {' +
          'padding-top: 3.5rem !important;' +
        '}' +
      '}';
      document.head.appendChild(style);
    };

    if (document.head) applyMobileNavbarLayout();
    else document.addEventListener('DOMContentLoaded', applyMobileNavbarLayout, { once: true });
    return true;
  })();
`
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

    var notifyError = function (message) {
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
        type: '${WEB_ERROR_MESSAGE}',
        message: message
      }));
    };

    var notifyBlank = function () {
      var body = document.body;
      var text = body && body.innerText ? body.innerText.trim() : '';
      var children = body ? body.children.length : 0;
      var height = body ? Math.round(body.getBoundingClientRect().height) : 0;

      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
        type: '${WEB_BLANK_MESSAGE}',
        message: 'Website loaded but rendered blank. URL: ' + window.location.href +
          ' | body text: ' + text.length +
          ' | body children: ' + children +
          ' | body height: ' + height
      }));
    };

    var hasVisibleContent = function () {
      var body = document.body;
      if (!body) return false;

      var text = body.innerText ? body.innerText.trim() : '';
      var visualElement = body.querySelector('a, button, input, textarea, select, canvas, img, svg, [role="button"], [role="link"], [data-mobile-ready]');
      return text.length > 0 || !!visualElement;
    };

    var scheduleReady = function () {
      window.requestAnimationFrame(function () {
        window.setTimeout(function () {
          if (hasVisibleContent()) notifyReady();
        }, 100);
      });
    };

    var scheduleBlankCheck = function () {
      window.setTimeout(function () {
        if (!hasVisibleContent()) notifyBlank();
      }, 4000);
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
    window.addEventListener('load', scheduleBlankCheck);
    document.addEventListener('DOMContentLoaded', scheduleReady);
    window.addEventListener('error', function (event) {
      notifyError(event.message || 'The website encountered a JavaScript error.');
    });
    window.addEventListener('unhandledrejection', function (event) {
      var reason = event.reason;
      notifyError(reason && reason.message ? reason.message : String(reason || 'The website rejected a request.'));
    });
    scheduleReady();
    scheduleBlankCheck();
    return true;
  })();
`

export default function App() {
  const webViewRef = useRef<WebView>(null)
  const canGoBackRef = useRef(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loadProgress, setLoadProgress] = useState(0)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!isLoading) return

    const timeout = setTimeout(() => {
      setIsLoading(false)
      setLoadError(`Timed out while loading ${WEBSITE_URL}`)
      setHasError(true)
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
      if (request.url.startsWith('/') || request.url.startsWith('#')) return true

      try {
        const target = new URL(request.url)
        if (target.origin === WEBSITE_ORIGIN || target.hostname === WEBSITE_HOST) return true
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
    setLoadError(null)
    setLoadProgress(0)
    setIsLoading(true)
    setReloadKey(key => key + 1)
  }

  const handleWebMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data) as { type?: string; url?: string; message?: string }
      if (message.type === WEB_ERROR_MESSAGE || message.type === WEB_BLANK_MESSAGE) {
        setIsLoading(false)
        setLoadError(message.message || 'The website loaded but did not render content.')
        setHasError(true)
        return
      }

      if (message.type !== ROUTE_READY_MESSAGE || !message.url) return

      const target = new URL(message.url)
      if (target.hostname === WEBSITE_HOST) {
        setIsLoading(false)
      }
    } catch {
      // Ignore messages that are not from our route-ready bridge.
    }
  }, [])

  const finishLoading = useCallback(() => {
    webViewRef.current?.injectJavaScript(`${injectedMobileNavbarScript}\n${injectedRouteReadyScript}`)
    setIsLoading(false)
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D241B" />
      {hasError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.title}>Couldn’t open myPartner</Text>
          <Text style={styles.message}>{loadError ?? 'Check your internet connection and try again.'}</Text>
          <Text selectable style={styles.url}>{WEBSITE_URL}</Text>
          <TouchableOpacity accessibilityRole="button" style={styles.button} onPress={retry}>
            <Text style={styles.buttonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <WebView
          key={reloadKey}
          ref={webViewRef}
          source={{ uri: WEBSITE_URL }}
          onLoadStart={() => {
            setLoadProgress(0)
            setIsLoading(true)
          }}
          onLoadProgress={event => setLoadProgress(event.nativeEvent.progress)}
          onLoadEnd={finishLoading}
          onMessage={handleWebMessage}
          onNavigationStateChange={state => {
            canGoBackRef.current = state.canGoBack
          }}
          onError={event => {
            setIsLoading(false)
            setLoadError(event.nativeEvent.description || 'The website could not be reached.')
            setHasError(true)
          }}
          onHttpError={event => {
            setIsLoading(false)
            setLoadError(`The website returned HTTP ${event.nativeEvent.statusCode}.`)
            setHasError(true)
          }}
          onShouldStartLoadWithRequest={shouldStartLoad}
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          javaScriptEnabled
          domStorageEnabled
          injectedJavaScriptBeforeContentLoaded={injectedMobileNavbarScript}
          injectedJavaScript={`${injectedMobileNavbarScript}\n${injectedRouteReadyScript}`}
          allowsBackForwardNavigationGestures
          setSupportMultipleWindows={false}
        />
      )}
      {isLoading && !hasError ? (
        <View pointerEvents="none" style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2C7A5B" />
          <Text style={styles.loadingTitle}>Loading website</Text>
          <Text selectable style={styles.loadingUrl}>{WEBSITE_URL}</Text>
          <Text style={styles.loadingProgress}>{Math.round(loadProgress * 100)}%</Text>
        </View>
      ) : null}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D241B',
    paddingTop: androidStatusBarPadding,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F8F5',
  },
  loadingTitle: { color: '#163C2C', fontSize: 18, fontWeight: '700', marginTop: 18 },
  loadingUrl: { color: '#496057', fontSize: 13, lineHeight: 20, marginTop: 8, paddingHorizontal: 28, textAlign: 'center' },
  loadingProgress: { color: '#496057', fontSize: 14, fontWeight: '600', marginTop: 12 },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#F7F8F5',
  },
  title: { color: '#163C2C', fontSize: 22, fontWeight: '700', textAlign: 'center' },
  message: { color: '#496057', fontSize: 16, lineHeight: 24, marginTop: 12, textAlign: 'center' },
  url: { color: '#163C2C', fontSize: 13, lineHeight: 20, marginTop: 16, textAlign: 'center' },
  button: { backgroundColor: '#2C7A5B', borderRadius: 10, marginTop: 28, paddingHorizontal: 22, paddingVertical: 13 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
})
