import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('test out for main login page', () => {
    render(<App />);

    // Replace this with text that actually exists in your App
    const welcomeText = screen.getByText(/Welcome to PeerPrep Hub!/);
    expect(welcomeText).toBeInTheDocument();
  });
});
