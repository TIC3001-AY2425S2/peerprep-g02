import ReactDOM from 'react-dom/client';
import App from './app/App';

// Ignore this portion for this project
const container = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(container);

// Strict mode can't automatically detect side effects for you,
// but it can help you spot them by making them a little more
// deterministic. This is done by intentionally double-invoking
// the following functions: Class component constructor, render,
// and shouldComponentUpdate methods.
root.render(<App />);
