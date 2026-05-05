import { createRoot } from 'react-dom/client'
import { Buffer } from 'buffer/'
import process from 'process'
import './index.css'
import App from './App.jsx'
import RuntimeGuard from './components/RuntimeGuard'
import { LocaleProvider } from './context/LocaleContext'

function installAndroidBrowserCompatibilityShims() {
  if (typeof window === 'undefined') {
    return
  }

  // Some Android in-app browsers inject scripts that expect this global download-progress hook.
  // Our page does not use it, but defining a noop prevents those external scripts from crashing React.
  if (typeof window.downProgCallback !== 'function') {
    window.downProgCallback = () => {}
  }
}

if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = Buffer
}

if (typeof window !== 'undefined' && !window.process) {
  window.process = process
}

installAndroidBrowserCompatibilityShims()

const appTree = (
  <RuntimeGuard>
    <LocaleProvider>
      <App />
    </LocaleProvider>
  </RuntimeGuard>
)

createRoot(document.getElementById('root')).render(appTree)
