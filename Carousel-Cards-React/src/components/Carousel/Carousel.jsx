import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Carousel.css';

const newsData = [
  {
    id: 1,
    title: 'Breaking News',
    content: 'Scientists discover breakthrough in renewable energy technology that could revolutionize power generation.',
    image: 'https://picsum.photos/400/250'
  },
  {
    id: 2,
    title: 'Tech Update',
    content: 'New AI model shows promising results in early disease detection, potentially saving millions of lives.',
    image: 'https://picsum.photos/400/251'
  },
  {
    id: 3,
    title: 'Space Exploration',
    content: 'NASA announces plans for the first human settlement on Mars, scheduled for the next decade.',
    image: 'https://picsum.photos/400/252'
  },
  {
    id: 4,
    title: 'Environmental News',
    content: 'Global efforts to reduce plastic waste show positive results in ocean cleanup initiatives.',
    image: 'https://picsum.photos/400/253'
  }
];

const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [visibleCards, setVisibleCards] = useState(window.innerWidth <= 768 ? 1 : 2);
  const carouselRef = useRef(null);
  const autoPlayRef = useRef(null);
  const cardWidth = useRef(0);

  const totalSlides = Math.ceil(newsData.length / visibleCards);

  const updateCarouselDimensions = useCallback(() => {
    const newVisibleCards = window.innerWidth <= 768 ? 1 : 2;
    setVisibleCards(newVisibleCards);
    if (carouselRef.current) {
      const firstCard = carouselRef.current.querySelector('.card');
      if (firstCard) {
        const gap = parseInt(getComputedStyle(carouselRef.current).gap);
        cardWidth.current = firstCard.offsetWidth + gap;
      }
    }
    setCurrentIndex(prev => Math.min(prev, totalSlides - 1));
  }, [totalSlides]);

  const goToSlide = useCallback((index, smooth = true) => {
    setCurrentIndex(index);
    if (carouselRef.current) {
      const offset = -index * cardWidth.current * visibleCards;
      carouselRef.current.style.transition = smooth ? 'transform 0.5s ease-in-out' : 'none';
      carouselRef.current.style.transform = `translateX(${offset}px)`;
    }
  }, [visibleCards]);

  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => {
      const next = prev >= totalSlides - 1 ? 0 : prev + 1;
      goToSlide(next);
      return next;
    });
  }, [goToSlide, totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentIndex(prev => {
      const next = prev <= 0 ? totalSlides - 1 : prev - 1;
      goToSlide(next);
      return next;
    });
  }, [goToSlide, totalSlides]);

  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(nextSlide, 5000);
  }, [nextSlide]);

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
    if (carouselRef.current) carouselRef.current.style.transition = 'none';
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].clientX;
    const walk = x - startX;
    if (carouselRef.current) {
      const offset = -currentIndex * cardWidth.current * visibleCards + walk;
      carouselRef.current.style.transform = `translateX(${offset}px)`;
    }
  };

  const handleTouchEnd = (e) => {
    setIsDragging(false);
    const walk = e.changedTouches[0].clientX - startX;
    if (Math.abs(walk) > cardWidth.current / 3) {
      if (walk > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    } else {
      goToSlide(currentIndex);
    }
    startAutoPlay();
  };

  const handleMouseDown = (e) => {
    setStartX(e.clientX);
    setIsDragging(true);
    if (carouselRef.current) {
      carouselRef.current.style.transition = 'none';
      carouselRef.current.style.cursor = 'grabbing';
    }
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const x = e.clientX;
    const walk = x - startX;
    if (carouselRef.current) {
      const offset = -currentIndex * cardWidth.current * visibleCards + walk;
      carouselRef.current.style.transform = `translateX(${offset}px)`;
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (carouselRef.current) carouselRef.current.style.cursor = 'grab';
    goToSlide(currentIndex, true);
    startAutoPlay();
  };

  useEffect(() => {
    const handleResize = () => {
      updateCarouselDimensions();
    };

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
        startAutoPlay();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
        startAutoPlay();
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('keydown', handleKeyDown);
    updateCarouselDimensions();
    startAutoPlay();

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('keydown', handleKeyDown);
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [updateCarouselDimensions, startAutoPlay, nextSlide, prevSlide]);

  return (
    <div className="carousel-container">
      <div
        className="carousel"
        ref={carouselRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={() => isDragging && handleDragEnd()}
      >
        {newsData.map((news) => (
          <div className="card" key={news.id}>
            <img src={news.image} alt={news.title} />
            <div className="card-content">
              <h3>{news.title}</h3>
              <p>{news.content}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="carousel-dots">
        {[...Array(totalSlides)].map((_, index) => (
          <div
            key={index}
            className={`dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => {
              goToSlide(index);
              startAutoPlay();
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
