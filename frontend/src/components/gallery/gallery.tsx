import { useEffect, useRef, useState } from "react";
import "./gallery.css";
import GalleryItem from "../galleryItem/galleryItem";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

interface PixabayImage {
  id: number;
  webformatURL: string;
  tags: string;
  imageWidth: number;
  imageHeight: number;
}

interface PixabayResponse {
  hits: PixabayImage[];
  totalHits: number;
}

interface GalleryProps {
  initialQuery?: string;
}

const COLUMN_COUNT = 5;

const getInitialBroadQuery = () => {
  return sessionStorage.getItem("galleryFeedQuery") || "nature";
};

const getInitialPreciseQuery = () => {
  return sessionStorage.getItem("galleryFeedPreciseQuery") || "nature";
};

const Gallery = ({ initialQuery }: GalleryProps) => {
  const [broadQuery, setBroadQuery] = useState(
    initialQuery || getInitialBroadQuery
  );
  const [preciseQuery, setPreciseQuery] = useState(
    initialQuery || getInitialPreciseQuery
  );
  const observerRef = useRef<HTMLDivElement | null>(null);
  const isFetchingRef = useRef(false);

  const { data: topData } = useQuery({
    queryKey: ["topPins", preciseQuery],
    queryFn: async (): Promise<PixabayResponse> => {
      const apiKey = import.meta.env.VITE_PIXABAY_API_KEY;
      const response = await fetch(
        `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(
          preciseQuery
        )}&page=1&per_page=5`
      );
      return response.json();
    },
  });

  const fetchPins = async ({
    pageParam,
  }: {
    pageParam: number;
  }): Promise<PixabayResponse> => {
    const apiKey = import.meta.env.VITE_PIXABAY_API_KEY;
    const response = await fetch(
      `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(
        broadQuery
      )}&page=${pageParam}&per_page=20`
    );
    return response.json();
  };

  const { data, fetchNextPage, hasNextPage, status } = useInfiniteQuery({
    queryKey: ["pins", broadQuery],
    queryFn: fetchPins,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const fetchedSoFar = allPages.reduce(
        (sum, page) => sum + page.hits.length,
        0
      );
      const actualLimit = Math.min(lastPage.totalHits, 500);

      if (fetchedSoFar >= actualLimit || lastPage.hits.length === 0) {
        return undefined;
      }
      return allPages.length + 1;
    },
  });

  const topImages = topData?.hits ?? [];
  const topImageIds = new Set(topImages.map((img) => img.id));

  const broadImages = (data?.pages.flatMap((page) => page.hits) ?? []).filter(
    (img) => !topImageIds.has(img.id)
  );

  const images = [...topImages, ...broadImages];

  const handleImageClick = (image: PixabayImage) => {
    const allTags = image.tags.split(",").map((t) => t.trim());
    const newPreciseQuery = allTags.slice(0, 3).join(" ");
    const newBroadQuery = allTags[0];

    setPreciseQuery(newPreciseQuery);
    setBroadQuery(newBroadQuery);

    sessionStorage.setItem("galleryFeedPreciseQuery", newPreciseQuery);
    sessionStorage.setItem("galleryFeedQuery", newBroadQuery);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasNextPage &&
          !isFetchingRef.current
        ) {
          isFetchingRef.current = true;
          fetchNextPage().finally(() => {
            isFetchingRef.current = false;
          });
        }
      },
      { threshold: 1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage]);

  if (status === "pending") return <p>Loading images...</p>;
  if (status === "error") return <p>Something went wrong...</p>;

  const columns: PixabayImage[][] = Array.from(
    { length: COLUMN_COUNT },
    () => []
  );
  images.forEach((image, index) => {
    columns[index % COLUMN_COUNT].push(image);
  });

  return (
    <div className="galleryColumns">
      {columns.map((column, colIndex) => (
        <div className="galleryColumn" key={colIndex}>
          {column.map((image) => (
            <GalleryItem
              key={image.id}
              image={image}
              onImageClick={handleImageClick}
            />
          ))}
        </div>
      ))}
      {hasNextPage && <div ref={observerRef} style={{ height: "1px" }} />}
    </div>
  );
};

export default Gallery;