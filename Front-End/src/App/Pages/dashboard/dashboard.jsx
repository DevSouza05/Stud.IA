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

const Dashboard = ({ etapas = [] }) => {
  const hoje = new Date();
  const mesAtual = hoje.getMonth(); // 0 a 11
  const anoAtual = hoje.getFullYear();
  const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
  const nomeMes = hoje.toLocaleString("default", { month: "long" });

 


  const [concluidos, setConcluidos] = useState(() => {
    const saved = localStorage.getItem("completedSubmodules");
    return saved ? JSON.parse(saved) : new Array(etapas.length).fill(false);
  });

  const [diasEstudo, setDiasEstudo] = useState(() => {
    const key = `diasEstudo_${anoAtual}-${mesAtual + 1}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : new Array(diasNoMes).fill(false);
  });

  const [historicoProgresso, setHistoricoProgresso] = useState(() => {
    const saved = localStorage.getItem("historicoProgresso");
    return saved ? JSON.parse(saved) : [];
  });

  const [sequenciaAtual, setSequenciaAtual] = useState(0);
  const [maiorSequencia, setMaiorSequencia] = useState(0);

  // Marca o dia de login como estudado
  useEffect(() => {
    const diaHoje = hoje.getDate() - 1;
    const diasAtualizados = [...diasEstudo];
    diasAtualizados[diaHoje] = true;
    setDiasEstudo(diasAtualizados);

    const key = `diasEstudo_${anoAtual}-${mesAtual + 1}`;
    localStorage.setItem(key, JSON.stringify(diasAtualizados));
  }, []);

  useEffect(() => {
    localStorage.setItem("completedSubmodules", JSON.stringify(concluidos));
  }, [concluidos]);

  useEffect(() => {
    calcularSequencias();

    const progresso = calcularProgressoDiario();
    if (progresso) {
      const hojeStr = new Date().toLocaleDateString();
      const novoHistorico = [...historicoProgresso];
      const index = novoHistorico.findIndex((e) => e.data === hojeStr);
      if (index >= 0) {
        novoHistorico[index].progresso = progresso;
      } else {
        novoHistorico.push({ data: hojeStr, progresso });
      }
      const historicoCortado = novoHistorico.slice(-7);
      setHistoricoProgresso(historicoCortado);
      localStorage.setItem("historicoProgresso", JSON.stringify(historicoCortado));
    }
  }, [diasEstudo]);

  const calcularSequencias = () => {
    let atual = 0;
    let maior = 0;
    let temp = 0;

    diasEstudo.forEach((dia) => {
      if (dia) {
        temp++;
        if (temp > maior) maior = temp;
      } else {
        temp = 0;
      }
    });

    for (let i = diasEstudo.length - 1; i >= 0; i--) {
      if (diasEstudo[i]) atual++;
      else break;
    }

    setSequenciaAtual(atual);
    setMaiorSequencia(maior);
  };

  const progressoDias =
    diasEstudo.length > 0
      ? Number(((diasEstudo.filter(Boolean).length / diasEstudo.length) * 100).toFixed(1))
      : 0;

  const progressoFinal = Math.min(100, progressoDias);
  const progressoRestante = Number((100 - progressoFinal).toFixed(1));
  const diasEstudadosInteiros = diasEstudo.filter(Boolean).length;

  const dataPie = [
    { name: "Dias Estudados", value: progressoFinal },
    { name: "Restante", value: progressoRestante },
  ];

  const COLORS = ["#4facfe", "#2d3748"];

  const calcularProgressoDiario = () => {
    const totalDias = diasEstudo.length;
    const diasConcluidos = diasEstudo.filter(Boolean).length;
    return Number(((diasConcluidos / totalDias) * 100).toFixed(1));
  };

  const dadosGrafico = historicoProgresso.map((item) => ({
    dia: new Date(item.data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    }),
    progresso: item.progresso,
  }));

  return (
    <>
      <Navbar variant="home" />
      <div className="progresso-container">
        <h2>Meu Progresso</h2>

        <div className="stats-grid">
          <div className="stat-card">
            <h4>Dias Estudados</h4>
            <p>{diasEstudadosInteiros}</p>
          </div>
          <div className="stat-card">
            <h4>Sequência Atual</h4>
            <p>{sequenciaAtual} dias</p>
          </div>
          <div className="stat-card">
            <h4>Maior Sequência</h4>
            <p>{maiorSequencia} dias</p>
          </div>
        </div>

        <div className="progresso-bar">
          <div className="progresso" style={{ width: `${progressoFinal}%` }} />
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
          <h3>Evolução do Progresso</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dadosGrafico}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="dia"
                stroke="rgba(255,255,255,0.7)"
                tick={{ fill: "rgba(255,255,255,0.7)" }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.7)"
                tick={{ fill: "rgba(255,255,255,0.7)" }}
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(13, 17, 23, 0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "rgba(255,255,255,0.9)" }}
              />
              <Line
                type="monotone"
                dataKey="progresso"
                stroke="#4facfe"
                strokeWidth={2}
                dot={{ fill: "#4facfe" }}
                name="Progresso"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <h3>Calendário de Estudos - {nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)}</h3>
        <div className="calendario">
          {diasEstudo.map((dia, index) => (
            <div
              key={index}
              className={`dia ${dia ? "estudado" : ""}`}
            >
              <span className="dia-numero">{index + 1}</span>
            </div>
          ))}
        </div>

        <div className="info-container">
          <div className="info-card">
            <p>Dias Restantes: {diasNoMes - diasEstudadosInteiros}</p>
          </div>
          <div className="info-card">
            <p>Meta Mensal: {diasNoMes} dias</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
