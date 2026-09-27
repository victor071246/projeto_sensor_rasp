export interface Leitura {
  momento: string;
  temperatura: number;
  umidade: number;
}

export interface LeituraAtual {
  temperatura: number | null;
  umidade: number | null;
  timestamp: number | null;
}
