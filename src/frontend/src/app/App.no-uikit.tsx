/**
 * Application Component (no UIKit, with Studio)
 *
 * Layout + StudioOverlay.
 * Used for projects created with --uikit none and studio enabled.
 */

import { Layout } from '@/app/layout';
import { StudioOverlay } from '@hai3/studio';

function App() {
  return (
    <>
      <Layout>
        <div className="p-6">
          <h1 className="text-2xl font-bold">Cyber Wiki</h1>
        </div>
      </Layout>
      <StudioOverlay />
    </>
  );
}

export default App;
