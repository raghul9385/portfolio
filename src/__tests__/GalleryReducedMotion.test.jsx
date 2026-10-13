import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Gallery from '../components/Gallery.jsx';

// Kept in its own file: Motion reads the reduced-motion setting once per test
// file, so it has to be mocked before anything in the file renders.

const photo = (name) => ({
  name,
  src: `/grid/${name}.webp`,
  full: `/full/${name}.webp`,
  thumb: `/thumb/${name}.webp`,
  width: 600,
  height: 800,
  caption: name,
  href: null,
});

describe('Gallery with reduced motion', () => {
  beforeEach(() => {
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
    }));
  });

  it('does not auto-advance or zoom', () => {
    const { container } = render(<Gallery images={[photo('a'), photo('b')]} />);

    expect(container.querySelector('.gallery-timer')).toBeNull();
    expect(container.querySelector('.gallery-zoom')).toBeNull();
    expect(screen.queryByRole('button', { name: /pause slideshow/i })).toBeNull();
    // Visitors can still move through the photos themselves.
    expect(screen.getByRole('button', { name: 'Next photo' })).toBeInTheDocument();
  });
});
