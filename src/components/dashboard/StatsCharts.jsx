import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, LineChart, Line } from 'recharts'
import { formatCurrency, formatMileage, compactMileage } from '../../utils/formatters'

export const COLORS = ['#FF6A1A', '#2AC3FF', '#F43F5E', '#A855F7', '#EAB308', '#22C55E', '#94A3B5']

const legendStyle = { fontSize: 11, color: '#A3B0BF', paddingTop: 6 }
const tooltipBoxStyle = { background: '#151D26', border: '1px solid #2A3542', borderRadius: 10, fontSize: 12 }

export function CategoryBreakdownChart({ data, currency = 'EUR', noDataLabel = 'Pas encore de données' }) {
  if (!data.length) {
    return <div className="h-44 flex items-center justify-center text-sm text-base-500">{noDataLabel}</div>
  }
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="46%"
          innerRadius={48}
          outerRadius={72}
          paddingAngle={2}
        >
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={COLORS[i % COLORS.length]} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => formatCurrency(value, currency)}
          contentStyle={tooltipBoxStyle}
          itemStyle={{ color: '#E7ECF1' }}
        />
        <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={8} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function MonthlySpendChart({ data, currency = 'EUR', noDataLabel = 'Pas encore de données', seriesLabel = 'Dépenses' }) {
  if (!data.length) {
    return <div className="h-44 flex items-center justify-center text-sm text-base-500">{noDataLabel}</div>
  }
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1D2733" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: '#66768A', fontSize: 11 }} axisLine={{ stroke: '#2A3542' }} tickLine={false} />
        <YAxis tick={{ fill: '#66768A', fontSize: 11 }} axisLine={false} tickLine={false} width={56} />
        <Tooltip
          formatter={(value) => formatCurrency(value, currency)}
          contentStyle={tooltipBoxStyle}
          itemStyle={{ color: '#E7ECF1' }}
          cursor={{ fill: 'rgba(255,106,26,0.06)' }}
        />
        <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={8} />
        <Bar dataKey="total" name={seriesLabel} fill="#FF6A1A" radius={[6, 6, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// Évolution du kilométrage par véhicule : une ligne par véhicule, un point par
// relevé (entretien) + le kilométrage actuel. `data` est déjà fusionné par date
// (une ligne par date, une colonne par vehicle_id) — voir buildMileageSeries().
// L'axe X utilise un timestamp numérique (et non la date en tant que catégorie) :
// sinon recharts espace les points à intervalles égaux quelle que soit la durée
// réelle entre deux relevés, ce qui déforme la courbe et duplique les libellés.
export function MileageEvolutionChart({ data, vehicles, lang = 'fr', noDataLabel = 'Pas encore de données' }) {
  if (!data.length || !vehicles.length) {
    return <div className="h-44 flex items-center justify-center text-sm text-base-500">{noDataLabel}</div>
  }
  const locale = lang === 'en' ? 'en-GB' : 'fr-FR'
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1D2733" vertical={false} />
        <XAxis
          dataKey="ts"
          type="number"
          scale="time"
          domain={['dataMin', 'dataMax']}
          tick={{ fill: '#66768A', fontSize: 10 }}
          axisLine={{ stroke: '#2A3542' }}
          tickLine={false}
          tickFormatter={(ts) => new Date(ts).toLocaleDateString(locale, { month: 'short', year: '2-digit' })}
          minTickGap={40}
        />
        <YAxis
          tick={{ fill: '#66768A', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={52}
          tickFormatter={(v) => compactMileage(v, lang)}
        />
        <Tooltip
          formatter={(value) => formatMileage(value, lang)}
          labelFormatter={(ts) => new Date(ts).toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' })}
          contentStyle={tooltipBoxStyle}
          itemStyle={{ color: '#E7ECF1' }}
        />
        <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={8} />
        {vehicles.map((v, i) => (
          <Line
            key={v.id}
            type="monotone"
            dataKey={v.id}
            name={`${v.make} ${v.model}`}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={2}
            dot={{ r: 2.5, strokeWidth: 0, fill: COLORS[i % COLORS.length] }}
            activeDot={{ r: 4 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

// Dépense cumulée par véhicule depuis l'achat (total_cost calculé dans useVehicles).
export function SpendPerVehicleChart({ data, currency = 'EUR', noDataLabel = 'Pas encore de données' }) {
  if (!data.length) {
    return <div className="h-44 flex items-center justify-center text-sm text-base-500">{noDataLabel}</div>
  }
  const legendPayload = data.map((d, i) => ({ value: d.name, type: 'circle', color: COLORS[i % COLORS.length] }))
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1D2733" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: '#66768A', fontSize: 10 }} axisLine={{ stroke: '#2A3542' }} tickLine={false} interval={0} />
        <YAxis tick={{ fill: '#66768A', fontSize: 11 }} axisLine={false} tickLine={false} width={56} />
        <Tooltip
          formatter={(value) => formatCurrency(value, currency)}
          contentStyle={tooltipBoxStyle}
          itemStyle={{ color: '#E7ECF1' }}
          cursor={{ fill: 'rgba(42,195,255,0.06)' }}
        />
        <Legend payload={legendPayload} wrapperStyle={legendStyle} iconSize={8} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={40}>
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
