import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import Gallery from '../components/Gallery.jsx';
import { gallery, profile } from '../data.js';
import { galleryImages } from '../shots.js';

const sources = {
  grid: {
    './assets/gallery/02-team.webp': '/grid/02-team.webp',
    './assets/gallery/01-ride.webp': '/grid/01-ride.webp',
    './assets/gallery/03-beach.webp': '/grid/03-beach.webp',
  },
  full: { './assets/gallery/full/01-ride.webp': '/full/01-ride.webp' },
  thumb: { './assets/gallery/thumb/01-ride.webp': '/thumb/01-ride.webp' },
  sizes: { '01-ride': { width: 600, height: 1000 } },
};

const photo = (name, caption, href = null) => ({
  name,
  src: `/grid/${name}.webp`,
  full: `/full/${name}.webp`,
  thumb: `/thumb/${name}.webp`,
  width: 600,
  height: 800,
  caption,
  href,
});

const photos = [
  photo('ride', 'Weekend ride', 'https://www.instagram.com/p/ride/'),
  photo('team', 'Team day'),
  photo('beach', 'Beach walk'),
];

/**
 * Finishes the timer bar's CSS animation. jsdom has no AnimationEvent, so React
 * listens for the prefixed name there; it only listens for one, so send both.
 */
function finishTimer(container) {
  const bar = container.querySelector('.gallery-timer');
  fireEvent(bar, new Event('animationend', { bubbles: true }));
  fireEvent(bar, new Event('webkitAnimationEnd', { bubbles: true }));
}

/** The caption of the photo currently on the big stage. */
const stageCaption = () =>
  screen.getByRole('button', { name: /^Open .* full screen$/ }).getAttribute('aria-label');

describe('galleryImages', () => {
  it('follows the order in data.js, then lists the rest by name', () => {
    const names = galleryImages([{ file: '03-beach' }], sources).map((image) => image.name);
    expect(names).toEqual(['03-beach', '01-ride', '02-team']);
  });

  it('pairs each photo with its full-size copy, thumbnail, size and caption', () => {
    const details = [{ file: '01-ride', caption: 'Weekend ride', href: 'https://ig/p/1' }];
    const [ride, team] = galleryImages(details, sources);

    expect(ride).toEqual({
      name: '01-ride',
      src: '/grid/01-ride.webp',
      full: '/full/01-ride.webp',
      thumb: '/thumb/01-ride.webp',
      width: 600,
      height: 1000,
      caption: 'Weekend ride',
      href: 'https://ig/p/1',
    });
    // Without a full-size copy, thumbnail or recorded size it falls back gracefully.
    expect(team).toMatchObject({
      full: '/grid/02-team.webp',
      thumb: '/grid/02-team.webp',
      width: null,
      caption: '',
    });
  });

  it('ignores data.js entries whose photo is missing', () => {
    expect(galleryImages([{ file: 'deleted' }], sources)).toHaveLength(3);
  });

  it('has a photo file for every entry listed in data.js', () => {
    const names = galleryImages(gallery).map((image) => image.name);
    for (const entry of gallery) expect(names, entry.file).toContain(entry.file);
  });
});

describe('Gallery', () => {
  it('renders nothing until there are photos', () => {
    const { container } = render(<Gallery images={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('features the first photo with a counter and a thumbnail for every photo', () => {
    render(<Gallery images={photos} />);

    expect(stageCaption()).toBe('Open Weekend ride full screen');
    expect(screen.getAllByText('01 / 03').length).toBeGreaterThan(0);

    const thumbs = within(screen.getByRole('group', { name: 'Choose a photo' })).getAllByRole(
      'button',
    );
    expect(thumbs).toHaveLength(3);
    expect(thumbs[0]).toHaveAttribute('aria-current', 'true');
  });

  it('moves to the next photo when the timer bar fills up', () => {
    const { container } = render(<Gallery images={photos} />);

    finishTimer(container);

    expect(stageCaption()).toBe('Open Team day full screen');
  });

  it('jumps to a photo from its thumbnail', async () => {
    const user = userEvent.setup();
    render(<Gallery images={photos} />);

    await user.click(screen.getByRole('button', { name: 'Show photo 3: Beach walk' }));

    expect(stageCaption()).toBe('Open Beach walk full screen');
    expect(screen.getByRole('button', { name: 'Show photo 3: Beach walk' })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  it('steps with the arrow buttons and wraps around', async () => {
    const user = userEvent.setup();
    render(<Gallery images={photos} />);

    await user.click(screen.getByRole('button', { name: 'Previous photo' }));
    expect(stageCaption()).toBe('Open Beach walk full screen');

    await user.click(screen.getByRole('button', { name: 'Next photo' }));
    expect(stageCaption()).toBe('Open Weekend ride full screen');
  });

  it('can be paused and played again', async () => {
    const user = userEvent.setup();
    const { container } = render(<Gallery images={photos} />);

    await user.click(screen.getByRole('button', { name: 'Pause slideshow' }));
    expect(container.querySelector('.gallery-timer')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Play slideshow' }));
    expect(container.querySelector('.gallery-timer')).not.toBeNull();
  });

  it('opens the full-size photo in a viewer and closes it with Escape', async () => {
    const user = userEvent.setup();
    render(<Gallery images={photos} />);

    const opener = screen.getByRole('button', { name: 'View full screen' });
    await user.click(opener);

    const viewer = screen.getByRole('dialog', { name: 'Photo viewer' });
    expect(within(viewer).getByRole('img', { name: 'Weekend ride' })).toHaveAttribute(
      'src',
      '/full/ride.webp',
    );
    expect(within(viewer).getByRole('button', { name: 'Close viewer' })).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(within(viewer).getByText('02 / 03')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    // The viewer fades out before it leaves the page.
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(opener).toHaveFocus();
    // The slideshow stays on the photo the visitor stepped to.
    expect(stageCaption()).toBe('Open Team day full screen');
  });

  it('links to the Instagram post, or to the profile when there is none', async () => {
    const user = userEvent.setup();
    render(<Gallery images={photos} />);

    expect(screen.getByRole('link', { name: /view on instagram/i })).toHaveAttribute(
      'href',
      'https://www.instagram.com/p/ride/',
    );

    await user.click(screen.getByRole('button', { name: 'Next photo' }));
    expect(screen.getByRole('link', { name: /view on instagram/i })).toHaveAttribute(
      'href',
      profile.instagram,
    );
  });

  it('offers a link to the full Instagram profile', () => {
    render(<Gallery images={photos} />);
    expect(screen.getByRole('link', { name: /more on instagram/i })).toHaveAttribute(
      'href',
      profile.instagram,
    );
  });
});
