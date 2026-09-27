import { useEffect, useState } from 'react';
import { buscarLeituraAtual } from './api';
import type { LeituraAtual } from './types';

function App() {
  const [atual, setAtual] = useState<LeituraAtual | null>(null);

  useEffect(() => {
    buscarLeituraAtual().then(setAtual);
  }, []);

  return (
    <div>
      <h1>Sensor DHT22</h1>
      {atual && (
        <p>
          {atual.temperatura}°C, {atual.umidade}
        </p>
      )}
    </div>
  );
}

export default App;
