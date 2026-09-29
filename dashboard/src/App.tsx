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

function formatarHoraTimestamp(valor: number) {
  return new Date(valor * 1000).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: '#1a1a2e',
        border: '1px solid #333',
        borderRadius: 10,
        padding: '0.75rem 1rem',
        color: '#fff',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
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
        padding: '2.5rem',
        background: 'radial-gradient(circle at top left, #16162a, #0a0a12 60%)',
        minHeight: '100vh',
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.6); }
          70% { box-shadow: 0 0 0 8px rgba(74, 222, 128, 0); }
          100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); }
        }
      `}</style>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '0.25rem',
        }}
      >
        <h1 style={{ margin: 0, fontSize: 28, letterSpacing: '-0.5px' }}>
          Sensor DHT22
        </h1>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#4ade80',
            animation: 'pulse 2s infinite',
          }}
        />
        <span style={{ fontSize: 13, opacity: 0.5 }}>ao vivo</span>
      </div>

      {atual?.timestamp && (
        <p style={{ margin: '0 0 2rem', fontSize: 13, opacity: 0.4 }}>
          atualizado às {formatarHoraTimestamp(atual.timestamp)}
        </p>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
          maxWidth: 500,
        }}
      >
        <div style={{ ...statCard, borderColor: 'rgba(255,107,107,0.25)' }}>
          <span style={statLabel}>TEMPERATURA</span>
          <span style={{ ...statValue, color: '#ff6b6b' }}>
            {atual?.temperatura ?? '--'}°C
          </span>
        </div>
        <div style={{ ...statCard, borderColor: 'rgba(77,148,255,0.25)' }}>
          <span style={statLabel}>UMIDADE</span>
          <span style={{ ...statValue, color: '#4d94ff' }}>
            {atual?.umidade ?? '--'}%
          </span>
        </div>
      </div>

      <div style={chartCard}>
        <p style={chartTitle}>
          <span style={{ color: '#ff6b6b' }}>●</span> Temperatura
        </p>
        <ResponsiveContainer width="100%" height={200}>
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
              stroke="#555"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              domain={['auto', 'auto']}
              stroke="#555"
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
      </div>

      <div style={{ ...chartCard, marginTop: '1.25rem' }}>
        <p style={chartTitle}>
          <span style={{ color: '#4d94ff' }}>●</span> Umidade
        </p>
        <ResponsiveContainer width="100%" height={200}>
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
              stroke="#555"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              domain={['auto', 'auto']}
              stroke="#555"
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
    </div>
  );
}

const statCard: React.CSSProperties = {
  background: '#15152a',
  border: '1px solid',
  borderRadius: 14,
  padding: '1.25rem 1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.35rem',
  boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
};

const statLabel: React.CSSProperties = {
  fontSize: 11,
  opacity: 0.5,
  letterSpacing: '0.5px',
};

const statValue: React.CSSProperties = {
  fontSize: 34,
  fontWeight: 700,
  letterSpacing: '-1px',
};

const chartCard: React.CSSProperties = {
  background: '#15152a',
  border: '1px solid #24243a',
  borderRadius: 16,
  padding: '1.25rem 1.5rem 0.5rem',
  boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
  maxWidth: 900,
};

const chartTitle: React.CSSProperties = {
  margin: '0 0 0.5rem',
  fontSize: 14,
  fontWeight: 600,
  opacity: 0.85,
};

export default App;
