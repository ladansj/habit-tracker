import { ThemeProvider } from './contexts/ThemeContext'
import { HabitProvider } from './contexts/HabitContext'
import { NotificationProvider } from './contexts/NotificationContext'
import Header from './components/Header'
import HabitList from './components/HabitList'
import Calendar from './components/Calendar'
import ProgressChart from './components/ProgressChart'
import StatsDashboard from './components/StatsDashboard'
import DataManager from './components/DataManager'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <HabitProvider>
        <NotificationProvider>
          <div className="app">
            <Header />
            <main className="main-content">
              <StatsDashboard />
              <div className="content-grid">
                <div className="left-column">
                  <HabitList />
                  <DataManager />
                </div>
                <div className="right-column">
                  <Calendar />
                  <ProgressChart />
                </div>
              </div>
            </main>
          </div>
        </NotificationProvider>
      </HabitProvider>
    </ThemeProvider>
  )
}

export default App

