import {
  ActionType,
  AppActions,
  SetAddress,
  SetConnection,
  SetENS,
  SetIsMainnet,
  StartConnecting
} from '../app/actions'
import { AppContext } from '../app/context'
import {
  appReducer,
  setAddress,
  setConnection,
  setENS,
  setIsMainnet,
  startConnecting
} from '../app/reducers'
import { AppState, initialAppState } from '../app/state'
import { ReactNode, useContext, useMemo, useReducer } from 'react'

export type {
  AppState,
  StartConnecting,
  SetConnection,
  SetAddress,
  SetENS,
  SetIsMainnet,
  AppActions
}
export {
  AppContext,
  initialAppState,
  ActionType,
  appReducer,
  startConnecting,
  setConnection,
  setAddress,
  setENS,
  setIsMainnet
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialAppState)
  const value = useMemo(() => ({ state, dispatch }), [state, dispatch])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider.')
  }
  return context
}
