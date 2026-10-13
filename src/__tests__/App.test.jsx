import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from '../App.jsx';
import { profile, projects } from '../data.js';

describe('App', () => {
  it('renders every section the navigation links to', () => {
    const { container } = render(<App />);

    for (const id of ['about', 'skills', 'ask', 'work', 'experience', 'contact']) {
      expect(container.querySelector(`#${id}`), `#${id} section`).toBeInTheDocument();
    }
  });

  it('has a working skip link and a primary navigation', () => {
    render(<App />);

    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main');
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(nav).getByRole('link', { name: /contact/i })).toHaveAttribute('href', '#contact');
  });

  it('shows every project from data.js', () => {
    render(<App />);

    for (const project of projects) {
      expect(screen.getAllByText(project.title).length).toBeGreaterThan(0);
    }
  });

  it('shows the contact form', () => {
    render(<App />);
    expect(screen.getByRole('form', { name: 'Contact form' })).toBeInTheDocument();
  });

  it('pops a notification toast', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Copy email address' }));

    expect(await screen.findByText('Email copied to clipboard')).toBeInTheDocument();
    await expect(navigator.clipboard.readText()).resolves.toBe(profile.email);
  });
});
