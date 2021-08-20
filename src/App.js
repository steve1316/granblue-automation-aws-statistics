import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import NavBar from "./components/Navbar";
import Footer from "./components/Footer";
import CreateAccount from "./pages/CreateAccount";

function App() {
    return (
        <Router>
            <NavBar />
            <Switch>
                <Route path="/" component={Home} exact>
                    <Home />
                </Route>
                <Route path="/createaccount" component={CreateAccount} exact>
                    <CreateAccount />
                </Route>
                <Route path="*">
                    <NotFound />
                </Route>
            </Switch>
            <Footer />
        </Router>
    );
}

export default App;
