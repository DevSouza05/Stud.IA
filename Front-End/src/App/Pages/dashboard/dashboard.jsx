import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import "../styles/dashboard.css";
import { Navbar } from "../../components/Navbar/index.tsx";
import { useTranslation } from 'react-i18next';

const Dashboard = ({ etapas = [] }) => {
  const { t } = useTranslation();
  const numeroDeDiasNoMes = 31;
  const [concluidos, setConcluidos] = useState(() => {
    const saved = localStorage.getItem("completedSubmodules");
    return saved ? JSON.parse(saved) : new Array(etapas.length).fill(false);
  });

  const [diasEstudo, setDiasEstudo] = useState(() => {
    const saved = localStorage.getItem("diasEstudo");
    return saved ? JSON.parse(saved) : Array(numeroDeDiasNoMes).fill(false);
  });

  const [sequenciaAtual, setSequenciaAtual] = useState(0);
  const [maiorSequencia, setMaiorSequencia] = useState(0);

  // Novo estado para armazenar o histórico de progresso
  const [historicoProgresso, setHistoricoProgresso] = useState(() => {
    const saved = localStorage.getItem("historicoProgresso");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("completedSubmodules", JSON.stringify(concluidos));
  }, [concluidos]);

  useEffect(() => {
    localStorage.setItem("diasEstudo", JSON.stringify(diasEstudo));
    calcularSequencias();
  }, [diasEstudo]);

  useEffect(() => {
    // Salvar histórico quando houver mudança nos dias de estudo
    const progresso = calcularProgressoDiario();
    if (progresso) {
      const novoHistorico = [...historicoProgresso];
      const hoje = new Date().toLocaleDateString();
      
      // Atualiza ou adiciona o progresso de hoje
      const indexHoje = novoHistorico.findIndex(item => item.data === hoje);
      if (indexHoje >= 0) {
        novoHistorico[indexHoje].progresso = progresso;
      } else {
        novoHistorico.push({ data: hoje, progresso });
      }

      // Mantém apenas os últimos 7 dias
      const historicoCortado = novoHistorico.slice(-7);
      setHistoricoProgresso(historicoCortado);
      localStorage.setItem("historicoProgresso", JSON.stringify(historicoCortado));
    }
  }, [diasEstudo]);

  const calcularSequencias = () => {
    let sequenciaAtual = 0;
    let maiorSequencia = 0;
    let sequenciaTemp = 0;

    diasEstudo.forEach((dia) => {
      if (dia) {
        sequenciaTemp++;
        if (sequenciaTemp > maiorSequencia) {
          maiorSequencia = sequenciaTemp;
        }
      } else {
        sequenciaTemp = 0;
      }
    });

    // Verifica se a sequência atual continua até hoje
    for (let i = diasEstudo.length - 1; i >= 0; i--) {
      if (diasEstudo[i]) {
        sequenciaAtual++;
      } else {
        break;
      }
    }

    setSequenciaAtual(sequenciaAtual);
    setMaiorSequencia(maiorSequencia);
  };

  const marcarDiaEstudo = (index) => {
    const novoDias = [...diasEstudo];
    novoDias[index] = !novoDias[index];
    setDiasEstudo(novoDias);
  };

  const progressoDias = numeroDeDiasNoMes > 0
    ? Number(((diasEstudo.filter(Boolean).length / numeroDeDiasNoMes) * 100).toFixed(1))
    : 0;

  const progressoFinal = Math.min(100, progressoDias);
  const progressoRestante = Number((100 - progressoFinal).toFixed(1));
  const diasEstudadosInteiros = diasEstudo.filter(Boolean).length;

  // Dados para o gráfico de pizza
  const dataPie = [
    { name: "Dias Estudados", value: Number(progressoDias.toFixed(1)) },
    { name: "Restante", value: Number(progressoRestante.toFixed(1)) },
  ];

  // Dados para o gráfico de linha (últimos 7 dias)
  const ultimos7Dias = diasEstudo.slice(-7).map((dia, index) => ({
    dia: `Dia ${index + 1}`,
    estudou: dia ? 1 : 0,
  }));

  const COLORS = ["#4facfe", "#2d3748"];

  const calcularProgressoDiario = () => {
    const totalDias = diasEstudo.length;
    const diasConcluidos = diasEstudo.filter(Boolean).length;
    return Number(((diasConcluidos / totalDias) * 100).toFixed(1));
  };

  // Formata os dados para o gráfico de linha
  const dadosGrafico = historicoProgresso.map(item => ({
    dia: new Date(item.data).toLocaleDateString('pt-BR', { 
      day: '2-digit',
      month: '2-digit'
    }),
    progresso: item.progresso
  }));

  return (
    <>
      <Navbar variant="home" />
      <div className="progresso-container">
        <h2>{t('dashboard.meuProgresso')}</h2>

        <div className="stats-grid">
          <div className="stat-card">
            <h4>{t('dashboard.diasEstudados')}</h4>
            <p>{diasEstudadosInteiros}</p>
          </div>
          <div className="stat-card">
            <h4>{t('dashboard.sequenciaAtual')}</h4>
            <p>{sequenciaAtual} dias</p>
          </div>
          <div className="stat-card">
            <h4>{t('dashboard.maiorSequencia')}</h4>
            <p>{maiorSequencia} dias</p>
          </div>
        </div>

        <div className="progresso-bar">
          <div
            className="progresso"
            style={{
              width: `${progressoFinal}%`,
            }}
          />
        </div>
        <p>{progressoFinal}% do mês concluído</p>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dataPie}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {dataPie.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>{t('dashboard.evolucaoProgresso')}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dadosGrafico}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="dia" 
                stroke="rgba(255,255,255,0.7)"
                tick={{ fill: 'rgba(255,255,255,0.7)' }}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.7)"
                tick={{ fill: 'rgba(255,255,255,0.7)' }}
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(13, 17, 23, 0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: 'rgba(255,255,255,0.9)' }}
              />
              <Line
                type="monotone"
                dataKey="progresso"
                stroke="#4facfe"
                strokeWidth={2}
                dot={{ fill: '#4facfe' }}
                name="Progresso"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <h3>{t('dashboard.calendarioEstudos')}</h3>
        <div className="calendario">
          {diasEstudo.map((dia, index) => (
            <div
              key={index}
              className={`dia ${dia ? "estudado" : ""}`}
              onClick={() => marcarDiaEstudo(index)}
            >
              <span className="dia-numero">{index + 1}</span>
            </div>
          ))}
        </div>

        <div className="info-container">
          <div className="info-card">
            <p>{t('dashboard.diasRestantes')}: {numeroDeDiasNoMes - diasEstudadosInteiros}</p>
          </div>
          <div className="info-card">
            <p>{t('dashboard.metaMensal')}: {numeroDeDiasNoMes} dias</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
