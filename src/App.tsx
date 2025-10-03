import './App.css'
import { BrowserRouter as Router } from "react-router-dom";
import RouteComponent from './routes/RouteComponent';


function App() {

  return (
    <>
      <Router>
        <RouteComponent/>
      </Router>
    </>
  )
}

export default App
