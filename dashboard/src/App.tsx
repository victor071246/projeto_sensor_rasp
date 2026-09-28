import { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  YAxis,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { buscarHistorico, buscarLeituraAtual } from './api';
import type { LeituraAtual, Leitura } from './types';

function formatarHora(valor: string) {
  return new Date(valor).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: '#1a1a2e',
        border: '1px solid #333',
        borderRadius: 8,
        padding: '0.75rem 1rem',
        color: '#fff',
      }}
    >
      <p style={{ margin: 0, opacity: 0.6, fontSize: 12 }}>
        {formatarHora(label)}
      </p>
      {payload.map((p: any) => (
        <p
          key={p.dataKey}
          style={{ margin: 0, color: p.color, fontWeight: 600 }}
        >
          {p.dataKey}: {p.value}
          {p.dataKey === 'temperatura' ? '°C' : '%'}
        </p>
      ))}
    </div>
  );
}

function App() {
  const [atual, setAtual] = useState<LeituraAtual | null>(null);
  const [historico, setHistorico] = useState<Leitura[]>([]);

  useEffect(() => {
    async function carregar() {
      try {
        const dadosAtual = await buscarLeituraAtual();
        setAtual(dadosAtual);

        const dadosHistorico = await buscarHistorico(200);
        setHistorico(dadosHistorico.reverse());
      } catch (erro) {
        console.error('erro ao buscar dados:', erro);
      }
    }

    carregar();
    const intervalo = setInterval(carregar, 15000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div
      style={{
        padding: '2rem',
        background: '#0f0f1a',
        minHeight: '100vh',
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h1 style={{ marginBottom: '1.5rem' }}>Sensor DHT22</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div style={statCard}>
          <span style={statLabel}>Temperatura</span>
          <span style={{ ...statValue, color: '#ff6b6b' }}>
            {atual?.temperatura ?? '--'}°C
          </span>
        </div>
        <div style={statCard}>
          <span style={statLabel}>Umidade</span>
          <span style={{ ...statValue, color: '#4d94ff' }}>
            {atual?.umidade ?? '--'}%
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={historico} syncId="sensor">
          <defs>
            <linearGradient id="gradTemp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#ff6b6b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#2a2a3d"
            vertical={false}
          />
          <XAxis
            dataKey="momento"
            tickFormatter={formatarHora}
            stroke="#666"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            domain={['auto', 'auto']}
            stroke="#ff6b6b"
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="temperatura"
            stroke="#ff6b6b"
            fill="url(#gradTemp)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={historico} syncId="sensor">
          <defs>
            <linearGradient id="gradUmid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4d94ff" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#4d94ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#2a2a3d"
            vertical={false}
          />
          <XAxis
            dataKey="momento"
            tickFormatter={formatarHora}
            stroke="#666"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            domain={['auto', 'auto']}
            stroke="#4d94ff"
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="umidade"
            stroke="#4d94ff"
            fill="url(#gradUmid)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

const statCard: React.CSSProperties = {
  background: '#1a1a2e',
  borderRadius: 12,
  padding: '1.25rem 1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
  minWidth: 160,
};

const statLabel: React.CSSProperties = {
  fontSize: 13,
  opacity: 0.6,
};

const statValue: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 700,
};

export default App;
