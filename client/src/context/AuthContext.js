import React, { createContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
};

const AuthContext = createContext(initialState);

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if a user is logged in
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const { data } = await axios.get('/api/auth/me'); // A new route we need to create
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: data,
        });
      } catch (err) {
        dispatch({
          type: 'AUTH_ERROR',
        });
      }
    };
    checkLoggedIn();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
