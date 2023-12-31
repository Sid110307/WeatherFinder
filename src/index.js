import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./styles/index.scss";

import "./styles/components/weather.scss";
import "./styles/components/settingsButton.scss";
import "./styles/components/modal.scss";
import "./styles/components/advancedMode.scss";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {error: null, errorInfo: null};
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo,
        });
    }

    render() {
        return this.state.errorInfo ? (
            <div style={{padding: "1rem", color: "white"}}>
                <h2>Something went wrong :(</h2>
                <details style={{whiteSpace: "pre-wrap"}} open>
                    {this.state.error && this.state.error.toString().trim()}
                    <br />
                    <div className="code">
                        {this.state.errorInfo.componentStack.toString().trim()}
                    </div>
                </details>
            </div>
        ) : (
            this.props.children
        );
    }
}

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </React.StrictMode>
);
