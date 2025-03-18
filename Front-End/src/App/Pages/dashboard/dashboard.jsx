import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import "../styles/dashboard.css";
import { Navbar } from "../../components/Navbar/index.tsx";

const Dashboard = ({ etapas = [] }) => {
  const getNumeroDeDiasNoMes = () => {
    const dataAtual = new Date();
    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth();

    const ultimoDiaDoMes = new Date(ano, mes + 1, 0);
    return ultimoDiaDoMes.getDate();
  };

  const numeroDeDiasNoMes = getNumeroDeDiasNoMes(); 

  const [concluidos, setConcluidos] = useState(() => {
    const saved = localStorage.getItem("completedSubmodules");
    return saved ? JSON.parse(saved) : new Array(etapas.length).fill(false);
  });

  const [diasEstudo, setDiasEstudo] = useState(() => {
    const saved = localStorage.getItem("diasEstudo");
    return saved ? JSON.parse(saved) : Array(numeroDeDiasNoMes).fill(false);
  });

  useEffect(() => {
    localStorage.setItem("completedSubmodules", JSON.stringify(concluidos));
  }, [concluidos]);

  useEffect(() => {
    localStorage.setItem("diasEstudo", JSON.stringify(diasEstudo));
  }, [diasEstudo]);

  const marcarConcluido = (index) => {
    const novoEstado = [...concluidos];
    novoEstado[index] = !novoEstado[index];
    setConcluidos(novoEstado);
  };

  const marcarDiaEstudo = (index) => {
    const novoDias = [...diasEstudo];
    novoDias[index] = !novoDias[index];
    setDiasEstudo(novoDias);
  };

  const progressoEtapas = etapas.length > 0 
    ? (concluidos.filter(Boolean).length / etapas.length) * 100 
    : 0;

  const progressoDias = numeroDeDiasNoMes > 0 
    ? (diasEstudo.filter(Boolean).length / numeroDeDiasNoMes) * 100 
    : 0;

  const progressoGeral = (progressoEtapas + progressoDias) / 2;

  const data = [
    { name: 'Etapas Concluídas', value: progressoEtapas },
    { name: 'Dias Estudados', value: progressoDias },
    { name: 'Restante', value: 100 - progressoGeral }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  return (
    <div className="progresso-container">
      <Navbar variant="home" />
      
      <h2>Meu Progresso</h2>

      <div className="progresso-bar">
        <div className="progresso" style={{ width: `${progressoGeral}%` }}></div>
      </div>
      <p>{progressoGeral.toFixed(0)}% concluído</p>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie 
            data={data} 
            dataKey="value" 
            nameKey="name" 
            cx="50%" 
            cy="50%" 
            outerRadius={100} 
            fill="#8884d8"
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <div className="modulos-grid">
        {etapas.map((etapa, index) => (
          <div
            key={index}
            className={`modulo ${concluidos[index] ? "concluido" : "pendente"}`}
            onClick={() => marcarConcluido(index)}
          >
            {etapa}
          </div>
        ))}
      </div>

      <h3>Dias Estudados</h3>
      <div className="calendario">
        {diasEstudo.map((dia, index) => (
          <div
            key={index}
            className={`dia ${dia ? "estudado" : ""}`}
            onClick={() => marcarDiaEstudo(index)}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;