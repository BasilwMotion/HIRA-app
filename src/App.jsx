import { useStore }         from './store/useStore.js'
import { Sidebar }          from './components/Sidebar.jsx'
import { Header }           from './components/Header.jsx'
import { Toast }            from './components/ui/Toast.jsx'
import { Dashboard }        from './components/pages/Dashboard.jsx'
import { RiskRegister }     from './components/pages/RiskRegister.jsx'
import { NewAssessment }    from './components/pages/NewAssessment.jsx'
import { RiskMatrix }       from './components/pages/RiskMatrix.jsx'
import { ControlsLibrary }  from './components/pages/ControlsLibrary.jsx'

const PAGES = {
  dashboard:  Dashboard,
  register:   RiskRegister,
  assessment: NewAssessment,
  matrix:     RiskMatrix,
  controls:   ControlsLibrary,
}

export default function App() {
  const { currentPage } = useStore()
  const Page = PAGES[currentPage] ?? Dashboard

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
      {/* Fixed sidebar */}
      <Sidebar />

      {/* Content area offset by sidebar width */}
      <div className="ml-60 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 overflow-auto">
          <Page key={currentPage} />
        </main>
      </div>

      {/* Global toast */}
      <Toast />
    </div>
  )
}
