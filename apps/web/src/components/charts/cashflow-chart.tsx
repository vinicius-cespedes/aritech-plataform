"use client";

/**
 * Gráfico de fluxo de caixa diário — sem biblioteca externa (SVG puro),
 * consistente com o restante do projeto, que ainda não tem dependência de
 * charting. Dois painéis:
 *   1. Barras divergentes de entrada (verde, para cima) e saída (vermelho,
 *      para baixo) por dia, a partir de uma linha de base zero.
 *   2. Linha do saldo acumulado realizado no período (não é o saldo bancário
 *      real da conta — é a soma acumulada de entradas menos saídas dentro do
 *      intervalo consultado).
 */
export interface CashFlowChartPoint {
  date: string;
  realizedInflow: string;
  realizedOutflow: string;
  cumulativeRealizedNet: string;
}

export function CashFlowChart({ daily }: { daily: CashFlowChartPoint[] }) {
  if (daily.length === 0) return null;

  const width = 900;
  const barsHeight = 160;
  const gap = 28;
  const lineHeight = 90;
  const totalHeight = barsHeight + gap + lineHeight;
  const barGap = daily.length > 60 ? 0.5 : 2;
  const barWidth = Math.max(1, width / daily.length - barGap);

  const maxFlow = Math.max(1, ...daily.flatMap((d) => [Number(d.realizedInflow), Number(d.realizedOutflow)]));
  const barsMid = barsHeight / 2;
  const scaleBar = (barsHeight / 2 - 4) / maxFlow;

  const cumulativeValues = daily.map((d) => Number(d.cumulativeRealizedNet));
  const minCum = Math.min(0, ...cumulativeValues);
  const maxCum = Math.max(0, ...cumulativeValues);
  const cumRange = Math.max(1, maxCum - minCum);
  const lineY = (v: number) => lineHeight - 6 - (v - minCum) * ((lineHeight - 10) / cumRange);

  const linePath = daily
    .map((d, i) => {
      const x = i * (barWidth + barGap) + barWidth / 2;
      const y = lineY(Number(d.cumulativeRealizedNet));
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  const labelEvery = Math.max(1, Math.ceil(daily.length / 8));

  return (
    <svg viewBox={`0 0 ${width} ${totalHeight + 18}`} className="w-full" role="img" aria-label="Fluxo de caixa diário">
      <text x={0} y={10} fontSize={10} className="fill-slate-500">
        Realizado por dia (entrada / saída)
      </text>
      <line x1={0} y1={barsMid + 14} x2={width} y2={barsMid + 14} stroke="currentColor" className="text-slate-300" strokeWidth={1} />
      {daily.map((d, i) => {
        const x = i * (barWidth + barGap);
        const inflow = Number(d.realizedInflow);
        const outflow = Number(d.realizedOutflow);
        return (
          <g key={d.date} transform="translate(0, 14)">
            {inflow > 0 && (
              <rect x={x} y={barsMid - inflow * scaleBar} width={barWidth} height={Math.max(0.5, inflow * scaleBar)} className="fill-emerald-500">
                <title>{`${d.date} · entrada R$ ${inflow.toFixed(2)}`}</title>
              </rect>
            )}
            {outflow > 0 && (
              <rect x={x} y={barsMid} width={barWidth} height={Math.max(0.5, outflow * scaleBar)} className="fill-red-400">
                <title>{`${d.date} · saída R$ ${outflow.toFixed(2)}`}</title>
              </rect>
            )}
          </g>
        );
      })}

      <g transform={`translate(0, ${barsHeight + gap})`}>
        <text x={0} y={-8} fontSize={10} className="fill-slate-500">
          Saldo acumulado no período (realizado)
        </text>
        <line
          x1={0}
          y1={lineY(0)}
          x2={width}
          y2={lineY(0)}
          stroke="currentColor"
          className="text-slate-300"
          strokeWidth={1}
          strokeDasharray="4 3"
        />
        <path d={linePath} fill="none" className="stroke-brand-600" strokeWidth={2} />
      </g>

      {daily.map((d, i) =>
        i % labelEvery === 0 || i === daily.length - 1 ? (
          <text
            key={d.date}
            x={i * (barWidth + barGap)}
            y={totalHeight + 14}
            fontSize={9}
            className="fill-slate-500"
          >
            {d.date.slice(5)}
          </text>
        ) : null,
      )}
    </svg>
  );
}
