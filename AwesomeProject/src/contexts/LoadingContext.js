import React, { createContext, useContext, useReducer } from 'react';

const LoadingContext = createContext();

const loadingReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, [action.key]: action.value };
    case 'SET_LOADING_GROUP':
      return { ...state, ...action.values };
    default:
      return state;
  }
};

export const LoadingProvider = ({ children }) => {
  const [loadingStates, dispatch] = useReducer(loadingReducer, {});

  const setLoading = (key, value) => {
    dispatch({ type: 'SET_LOADING', key, value });
  };

  const setLoadingGroup = (values) => {
    dispatch({ type: 'SET_LOADING_GROUP', values });
  };

  return (
    <LoadingContext.Provider value={{ loadingStates, setLoading, setLoadingGroup }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};