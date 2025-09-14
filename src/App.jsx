import { useState } from 'react'
import AppRoute from './routes'
import { BrowserRouter } from 'react-router-dom'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BrowserRouter>
         <AppRoute/>
      </BrowserRouter>
    </>
  )
}
export default App
