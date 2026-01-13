import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import { pages } from './config/routes'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {pages.map((page) => (
            <Route
              key={page.path}
              path={page.path}
              element={<page.component />}
            />
          ))}
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
