/**
 * Application Component (no Studio)
 *
 * Same as App.tsx but without StudioOverlay.
 * Used for projects created with --no-studio.
 */

import { Layout } from '@/app/layout';

function App() {
  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold">Cyber Wiki</h1>
      </div>
    </Layout>
  );
}

export default App;
