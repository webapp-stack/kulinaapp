'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CarouselSlide {
  id: number
  image: string
  title: string
  description?: string
}

const slides: CarouselSlide[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=500&fit=crop',
    title: 'Delicious Food',
    description: 'Order your favorite meals now'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&h=500&fit=crop',
    title: 'Fresh Ingredients',
    description: 'Quality food delivered to your door'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&h=500&fit=crop',
    title: 'Quick Delivery',
    description: 'Fast and reliable service'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=1200&h=500&fit=crop',
    title: 'Special Offers',
    description: 'Get the best deals today'
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=1200&h=500&fit=crop',
    title: 'Healthy Options',
    description: 'Eat well, live better'
  }
]

export function ImageCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  // Auto-play every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full rounded-lg overflow-hidden shadow-lg aspect-video">
      {/* Slides */}
      <div className="relative h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent">
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <h2 className="text-white text-2xl md:text-3xl font-bold mb-2">
                  {slide.title}
                </h2>
                {slide.description && (
                  <p className="text-white/90 text-sm md:text-base">
                    {slide.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full h-10 w-10 md:h-12 md:w-12"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full h-10 w-10 md:h-12 md:w-12"
        onClick={nextSlide}
      >
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
      </Button>

      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'w-8 bg-white'
                : 'w-2.5 bg-white/60 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
