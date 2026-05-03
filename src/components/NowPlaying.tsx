import { computed, effect, signal } from "alien-signals";

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
  children: () => (string | Node)[],
): HTMLElement {
  effect(() => {
    element.replaceChildren(...children());
  });
  return element;
}

export function NowPlaying() {
  const nowPlaying = signal<SpotifyNowPlaying | null>(null);

  const currentTrack = computed(() =>
    nowPlaying()?.is_playing ? nowPlaying() : null,
  );
  const artworkUrl = computed(() => {
    const images = currentTrack()?.images;
    if (!images || images.length === 0) {
      return null;
    }
    return [...images].sort(
      (a, b) =>
        Math.max(b.width ?? 0, b.height ?? 0) -
        Math.max(a.width ?? 0, a.height ?? 0),
    )[0].url;
  });
  const trackName = computed(() => currentTrack()?.name ?? null);
  const trackUrl = computed(() => currentTrack()?.url ?? null);
  const albumName = computed(() => currentTrack()?.album.name ?? null);
  const albumUrl = computed(() => currentTrack()?.album.url ?? null);
  const artists = computed(
    () =>
      currentTrack()?.artists.flatMap((artist) =>
        artist.name ? [{ name: artist.name, url: artist.url }] : [],
      ) ?? [],
  );

  const artworkElm = bindChildren(<div class="h-24 w-24" />, () => {
    const url = artworkUrl();
    if (!url) {
      return [];
    }
    return [<img class="h-full w-full object-cover" src={url} alt="artwork" />];
  });

  const nameElm = bindChildren(
    <div class="overflow-hidden font-bold text-ellipsis whitespace-nowrap" />,
    () => {
      const name = trackName();
      const url = trackUrl();
      if (!name) {
        return ["No track playing"];
      }
      if (!url) {
        return [name];
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

  const albumElm = bindChildren(<span />, () => {
    const name = albumName();
    const url = albumUrl();
    if (!name) {
      return [];
    }
    if (!url) {
      return [name];
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

  const artistsElm = bindChildren(<span />, () => {
    return artists().reduce(
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
      {artworkElm}
      <div class="grid h-24 grid-rows-3 items-center p-2">
        {nameElm}
        <div class="overflow-hidden text-sm text-ellipsis whitespace-nowrap">
          💿 {albumElm}
        </div>
        <div class="overflow-hidden text-sm text-ellipsis whitespace-nowrap">
          👤 {artistsElm}
        </div>
      </div>
    </div>
  );
}
