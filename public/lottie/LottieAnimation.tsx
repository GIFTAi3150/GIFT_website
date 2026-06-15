"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";

export default function LottieAnimation() {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch("/animations/animation.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data));
  }, []);

  if (!animationData) return null;

  return (
    <Lottie
      animationData={animationData}
      loop={true}
      autoplay={true}
      style={{ width: 400, height: 400 }}
    />
  );
}