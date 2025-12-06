"use client";

import { useEffect, useState } from "react";

export const useMediaQuery = () => {
  const maxWidth = 768;
  const [isMatch, setIsMatch] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const listener = () => setIsMatch(media.matches);

    listener(); // 初期判定
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [maxWidth]);

  return isMatch;
};
