import { effect, signal } from "alien-signals";

interface SpotifyNowPlaying {
  album: {
    name?: string;
    url?: string;
  };
  artists: {
    name?: string;
    url?: string;
  }[];
  duration_ms?: number;
  images: {
    url: string;
    height: number | null;
    width: number | null;
  }[];
  is_playing?: boolean;
  name?: string;
  progress_ms?: number | null;
  url?: string;
}

function bindChildren(
  element: HTMLElement,
  children: () => (Node | string)[],
): HTMLElement {
  effect(() => {
    element.replaceChildren(...children());
  });
  return element;
}

export function NowPlaying() {
  const nowPlaying = signal<SpotifyNowPlaying | null>(null);

  const artwork = bindChildren(<div class="h-24 w-24" />, () => {
    const images = nowPlaying()?.images;
    if (!nowPlaying()?.is_playing || !images || images.length === 0) {
      return [];
    }
    const url = [...images].sort(
      (a, b) =>
        Math.max(b.width ?? 0, b.height ?? 0) -
        Math.max(a.width ?? 0, a.height ?? 0),
    )[0].url;
    return [<img class="h-full w-full object-cover" src={url} alt="artwork" />];
  });

  const name = bindChildren(
    <div class="overflow-hidden font-bold text-ellipsis whitespace-nowrap" />,
    () => {
      const name = nowPlaying()?.name;
      const url = nowPlaying()?.url;
      if (!nowPlaying()?.is_playing || !name) {
        return [document.createTextNode("No track playing")];
      }
      if (!url) {
        return [document.createTextNode(name)];
      }
      return [
        <a
          class="hover:underline"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {name}
        </a>,
      ];
    },
  );

  const album = bindChildren(<span />, () => {
    const name = nowPlaying()?.album.name;
    const url = nowPlaying()?.album.url;
    if (!nowPlaying()?.is_playing || !name) {
      return [];
    }
    if (!url) {
      return [document.createTextNode(name)];
    }
    return [
      <a
        class="hover:underline"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {name}
      </a>,
    ];
  });

  const artists = bindChildren(<span />, () => {
    const artists = nowPlaying()?.artists.flatMap((artist) =>
      artist.name ? [{ name: artist.name, url: artist.url }] : [],
    );
    if (!nowPlaying()?.is_playing || !artists || artists.length === 0) {
      return [];
    }
    return artists.reduce(
      (nodes, artist) => {
        if (!artist.url) {
          return [...nodes, ...(nodes.length > 0 ? [", "] : []), artist.name];
        }
        return [
          ...nodes,
          ...(nodes.length > 0 ? [", "] : []),
          <a
            class="hover:underline"
            href={artist.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {artist.name}
          </a>,
        ];
      },
      [] as (Node | string)[],
    );
  });

  function fetchNowPlaying() {
    fetch("https://nowplaying.iwair.in")
      .then((res) => res.json() as Promise<SpotifyNowPlaying>)
      .then((res) => {
        nowPlaying(res);
      })
      .catch(() => {
        nowPlaying(null);
      })
      .finally(() => {
        window.setTimeout(fetchNowPlaying, 30000);
      });
  }

  fetchNowPlaying();

  return (
    <div class="chromatic-border not-prose grid max-w-80 grid-cols-[auto_1fr]">
      {artwork}
      <div class="grid h-24 grid-rows-3 items-center p-2">
        {name}
        <div class="overflow-hidden text-sm text-ellipsis whitespace-nowrap">
          💿 {album}
        </div>
        <div class="overflow-hidden text-sm text-ellipsis whitespace-nowrap">
          👤 {artists}
        </div>
      </div>
    </div>
  );
}
