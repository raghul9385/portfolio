import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AskPanel from '../components/AskPanel.jsx';
import { profile } from '../data.js';

describe('AskPanel', () => {
  beforeEach(() => {
    // With reduced motion the answers appear instantly instead of typing out.
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
    }));
  });

  it('answers the first question straight away', () => {
    render(<AskPanel />);

    expect(screen.getByRole('button', { name: /what does he build/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByText(/Mobile apps and the web front ends/)).toBeInTheDocument();
  });

  it('switches answers when another question is picked', async () => {
    const user = userEvent.setup();
    render(<AskPanel />);

    await user.click(screen.getByRole('button', { name: /which stack/i }));

    expect(screen.getByRole('button', { name: /which stack/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByText(new RegExp(`^${profile.dailyStack} day to day`))).toBeInTheDocument();
  });

  it('keeps the answer when the selected question is clicked again', async () => {
    const user = userEvent.setup();
    render(<AskPanel />);

    await user.click(screen.getByRole('button', { name: /what does he build/i }));

    expect(screen.getByText(/Mobile apps and the web front ends/)).toBeInTheDocument();
  });
});
