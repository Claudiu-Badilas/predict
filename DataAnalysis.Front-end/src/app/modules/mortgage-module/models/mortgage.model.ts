export type Rata = {
  nrCtr: number | null;
  dataPlatii: string | null;
  rataDobanda: number | null;
  rataCredit: number | null;
  comisionAdministrare: number | null;
  costuruAsigurare: number | null;
  comisionGestiune: number | null;
  dobadaRecalculata: number | null;
  totalRata: number | null;
  soldRestPlata: number | null;
};

export type GraficRambursare = {
  name: string;
  rate: Rata[];
};
