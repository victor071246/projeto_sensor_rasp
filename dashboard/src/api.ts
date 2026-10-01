import type { Leitura, LeituraAtual } from './types';

const API_BASE = 'http://100.74.106.45:5000';

export async function buscarLeituraAtual(): Promise<LeituraAtual> {
  const resp = await fetch(`${API_BASE}/reading`);
  return resp.json();
}

export async function buscarHistorico(horas: number): Promise<Leitura[]> {
  const resp = await fetch(`${API_BASE}/readings?horas=${horas}`);
  return resp.json();
}
