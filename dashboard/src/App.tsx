import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  YAxis,
  XAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { buscarHistorico, buscarLeituraAtual } from './api';
import type { LeituraAtual, Leitura } from './types';

function App() {
  const [atual, setAtual] = useState<LeituraAtual | null>(null);
  const [historico, setHistorico] = useState<Leitura[]>([]);

  useEffect(() => {
    async function carregar() {
      const dadosAtual = await buscarLeituraAtual();
      setAtual(dadosAtual);

      const dadosHistorico = await buscarHistorico(200);
      setHistorico(dadosHistorico.reverse());
    }

    carregar();
    const intervalo = setInterval(carregar, 15000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Sensor DHT22</h1>

      {atual && (
        <p>
          {atual.temperatura}°C, {atual.umidade}%
        </p>
      )}

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={historico}>
          <CartesianGrid strokeDasharray="3 3"></CartesianGrid>
          <XAxis dataKey="momento"></XAxis>
          <YAxis></YAxis>
          <Tooltip></Tooltip>
          <Legend></Legend>
          <Line type="monotone" dataKey="temperatura" stroke="#ff4d4d"></Line>
          <Line type="monotone" dataKey="umidade" stroke="#4d94ff"></Line>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default App;
