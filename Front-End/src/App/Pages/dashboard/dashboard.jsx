import React, { useState, useEffect } from "react";
import {PieChart,Pie,Cell,Legend,Tooltip,ResponsiveContainer,} from "recharts";
import "../styles/dashboard.css";
import { Navbar } from "../../components/Navbar/index.tsx";

const Dashboard = ({ etapas = [] }) => {
  const numeroDeDiasNoMes = 31;

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

  const marcarDiaEstudo = (index) => {
    const novoDias = [...diasEstudo];
    novoDias[index] = !novoDias[index];
    setDiasEstudo(novoDias);
  };

  
  const progressoDias =
    numeroDeDiasNoMes > 0
      ? (diasEstudo.filter(Boolean).length / numeroDeDiasNoMes) * 100
      : 0;


  const progressoFinal = Math.min(100, progressoDias);


  const progressoRestante = Math.round(100 - progressoFinal);
  const diasEstudadosInteiros = Math.round(diasEstudo.filter(Boolean).length);

  const data = [
    { name: "Dias Estudados", value: progressoDias },
    { name: "Restante", value: progressoRestante }, 
  ];

  const COLORS = ["#00C49F", "#FFBB28"];

  return (
    <div className="progresso-container">
      <Navbar variant="home" />

      <h2>Meu Progresso</h2>

     
      <div className="progresso-bar">
        <div
          className="progresso"
          style={{
            width: `${progressoFinal}%`, 
            transition: "width 0.5s ease-in-out",
          }}
        ></div>
      </div>
      <p>{progressoFinal.toFixed(2)}% concluído</p> 

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

      <h3>Dias Estudados</h3>
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

    
      <div className="restante-container">
        <p>
          Restante: {progressoRestante}% 
         
        </p>
      </div>


      <div className="dias-estudados">
        <p>
          Dias Estudados: {diasEstudadosInteiros} / {numeroDeDiasNoMes}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
