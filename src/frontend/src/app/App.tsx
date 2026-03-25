/**
 * Cyber Wiki Application Component
 *
 * Renders the Layout with screen content.
 *
 * HAI3Provider (in main.tsx) handles:
 * - Redux Provider setup
 * - HAI3 context (app instance)
 *
 * Layout handles:
 * - Header, Menu, Footer, Sidebar rendering
 * - Theme-aware styling via hooks
 *
 * StudioOverlay (dev mode only):
 * - Development tools for theme/screenset switching
 * - Language selection
 * - API mode toggle (services register their own mocks)
 */

import { Layout } from '@/app/layout';
import { StudioOverlay } from '@hai3/studio';

function App() {
  return (
    <>
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Cyber Wiki</h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl">
            Internal knowledge base for cybersecurity documentation, procedures, and reference materials.
          </p>

          <div className="text-left max-w-lg w-full rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-3">Adding screens</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Use AI commands or follow the HAI3 event-driven architecture manually:
            </p>

            <h3 className="text-sm font-medium mt-4 mb-2">AI Commands</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li><code className="text-xs bg-muted px-1 py-0.5 rounded">/hai3-new-screen</code> — add a new screen</li>
              <li><code className="text-xs bg-muted px-1 py-0.5 rounded">/hai3-new-component</code> — add a UI component</li>
              <li><code className="text-xs bg-muted px-1 py-0.5 rounded">/hai3-new-screenset</code> — create a screenset</li>
              <li><code className="text-xs bg-muted px-1 py-0.5 rounded">/hai3-arch-explain</code> — explain architecture</li>
            </ul>

            <h3 className="text-sm font-medium mt-4 mb-2">Manual flow</h3>
            <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
              <li>Define <strong>events</strong> in <code className="text-xs bg-muted px-1 py-0.5 rounded">events/</code></li>
              <li>Create <strong>actions</strong> in <code className="text-xs bg-muted px-1 py-0.5 rounded">actions/</code></li>
              <li>Add <strong>effects</strong> in <code className="text-xs bg-muted px-1 py-0.5 rounded">effects/</code></li>
              <li>Define <strong>slices</strong> in <code className="text-xs bg-muted px-1 py-0.5 rounded">slices/</code></li>
              <li>Build <strong>screen components</strong></li>
              <li>Register in <code className="text-xs bg-muted px-1 py-0.5 rounded">Menu.tsx</code> and <code className="text-xs bg-muted px-1 py-0.5 rounded">App.tsx</code></li>
            </ol>
            <p className="text-xs text-muted-foreground mt-3 opacity-70">
              Flow: Component → Action → Event → Effect → Slice → Store
            </p>
          </div>
        </div>
      </Layout>
      <StudioOverlay />
    </>
  );
}

export default App;
