import React, { createContext, useContext, useReducer } from 'react';

// Estado inicial
const initialState = {
  user: {
    name: '',
    email: '',
    avatar: '',
  },
  progress: {
    currentModule: '',
    completedModules: 0,
    totalModules: 0,
    estimatedTime: '',
    lastActivity: '',
  },
  gamification: {
    currentStreak: 0,
    totalPoints: 0,
    level: 1,
    achievements: [],
    nextMilestone: null,
  },
};

// Tipos de ações
const ActionTypes = {
  SET_USER: 'SET_USER',
  UPDATE_PROGRESS: 'UPDATE_PROGRESS',
  UPDATE_GAMIFICATION: 'UPDATE_GAMIFICATION',
  UNLOCK_ACHIEVEMENT: 'UNLOCK_ACHIEVEMENT',
  UPDATE_STREAK: 'UPDATE_STREAK',
  ADD_POINTS: 'ADD_POINTS',
};

// Reducer
const reducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_USER:
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
        },
      };

    case ActionTypes.UPDATE_PROGRESS:
      return {
        ...state,
        progress: {
          ...state.progress,
          ...action.payload,
        },
      };

    case ActionTypes.UPDATE_GAMIFICATION:
      return {
        ...state,
        gamification: {
          ...state.gamification,
          ...action.payload,
        },
      };

    case ActionTypes.UNLOCK_ACHIEVEMENT:
      return {
        ...state,
        gamification: {
          ...state.gamification,
          achievements: state.gamification.achievements.map(achievement =>
            achievement.id === action.payload.id
              ? { ...achievement, unlocked: true, notified: false }
              : achievement
          ),
        },
      };

    case ActionTypes.UPDATE_STREAK:
      return {
        ...state,
        gamification: {
          ...state.gamification,
          currentStreak: action.payload,
        },
      };

    case ActionTypes.ADD_POINTS:
      const newPoints = state.gamification.totalPoints + action.payload;
      const newLevel = Math.floor(newPoints / 100) + 1;
      return {
        ...state,
        gamification: {
          ...state.gamification,
          totalPoints: newPoints,
          level: newLevel,
        },
      };

    default:
      return state;
  }
};

// Criar contexto
const AppContext = createContext();

// Provider
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const actions = {
    setUser: (userData) => {
      dispatch({ type: ActionTypes.SET_USER, payload: userData });
    },
    updateProgress: (progressData) => {
      dispatch({ type: ActionTypes.UPDATE_PROGRESS, payload: progressData });
    },
    updateGamification: (gamificationData) => {
      dispatch({ type: ActionTypes.UPDATE_GAMIFICATION, payload: gamificationData });
    },
    unlockAchievement: (achievementId) => {
      dispatch({ type: ActionTypes.UNLOCK_ACHIEVEMENT, payload: { id: achievementId } });
    },
    updateStreak: (streak) => {
      dispatch({ type: ActionTypes.UPDATE_STREAK, payload: streak });
    },
    addPoints: (points) => {
      dispatch({ type: ActionTypes.ADD_POINTS, payload: points });
    },
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext; 