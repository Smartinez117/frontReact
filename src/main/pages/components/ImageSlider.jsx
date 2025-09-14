import React, { useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import { Box } from "@mui/material";
import Arrow from "./Arrow";

const ImageSlider = ({ imagenes, onImageClick }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const [sliderRef, instanceRef] = useKeenSlider({
    initial: 0,
    slideChanged: (slider) => {
      setCurrentSlide(slider.track.details.rel);
    },
    created: () => {
      setLoaded(true);
    },
  });

  return (
    <Box ref={sliderRef} className="keen-slider" sx={{ overflow: "hidden", position: "relative" }}>
      {imagenes.map((src, index) => (
        <Box
          key={index}
          className="keen-slider__slide"
          component="img"
          src={src}
          alt={`Slide ${index + 1}`}
          onClick={() => onImageClick(index)}
          sx={{
            width: "100%",
            height: 300,
            objectFit: "contain",
            backgroundColor: "#FFFFFF",
            borderRadius: 2,
            userSelect: "none",
            cursor: "pointer",
          }}
        />
      ))}

      {loaded && instanceRef.current && (
        <>
          <Arrow
            left
            onClick={(e) => { e.stopPropagation(); instanceRef.current?.prev(); }}
            disabled={currentSlide === 0}
          />
          <Arrow
            onClick={(e) => { e.stopPropagation(); instanceRef.current?.next(); }}
            disabled={currentSlide === instanceRef.current.track.details.slides.length - 1}
          />
        </>
      )}
    </Box>
  );
};

export default ImageSlider;