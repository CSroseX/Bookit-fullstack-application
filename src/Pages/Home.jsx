import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl, createExperienceUrl } from "@/utils";
import { MapPin, ArrowRight, Loader2, Search, SlidersHorizontal, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [showFilters, setShowFilters] = useState(false);

  const { data: experiences, isLoading, error, refetch } = useQuery({
    queryKey: ['experiences'],
    queryFn: () => base44.entities.Experience.list('-created_date'),
    initialData: [],
  });

  const { data: allReviews = [] } = useQuery({
    queryKey: ['allReviews'],
    queryFn: () => base44.entities.Review.list(),
    initialData: [],
  });

  // Calculate average rating for each experience
  const experienceRatings = useMemo(() => {
    const ratings = {};
    allReviews.forEach(review => {
      if (!ratings[review.experience_id]) {
        ratings[review.experience_id] = { total: 0, count: 0 };
      }
      ratings[review.experience_id].total += review.rating;
      ratings[review.experience_id].count += 1;
    });
    
    Object.keys(ratings).forEach(id => {
      ratings[id].average = ratings[id].total / ratings[id].count;
    });
    
    return ratings;
  }, [allReviews]);

  // Extract unique locations
  const locations = useMemo(() => {
    const uniqueLocations = [...new Set(experiences.map(exp => exp.location))];
    return uniqueLocations;
  }, [experiences]);

  // Filter and sort experiences
  const filteredExperiences = useMemo(() => {
    let filtered = experiences;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(exp =>
        exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Price filter
    if (priceFilter !== "all") {
      filtered = filtered.filter(exp => {
        if (priceFilter === "budget") return exp.price < 2500;
        if (priceFilter === "mid") return exp.price >= 2500 && exp.price < 4000;
        if (priceFilter === "premium") return exp.price >= 4000;
        return true;
      });
    }

    // Location filter
    if (locationFilter !== "all") {
      filtered = filtered.filter(exp => exp.location === locationFilter);
    }

    // Sort
    if (sortBy === "price-low") {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      filtered = [...filtered].sort((a, b) => {
        const ratingA = experienceRatings[a.id]?.average || 0;
        const ratingB = experienceRatings[b.id]?.average || 0;
        return ratingB - ratingA;
      });
    }

    return filtered;
  }, [experiences, searchQuery, priceFilter, locationFilter, sortBy, experienceRatings]);

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="p-8 max-w-md text-center">
          <div className="text-[#EF4444] mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-[#222222] mb-2">Something went wrong</h3>
          <p className="text-[#6B7280] mb-6">Unable to load experiences. Please try again.</p>
          <Button onClick={() => refetch()} className="bg-[#FFD166] hover:bg-[#FFAD33] text-[#222222] font-semibold">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#222222] mb-4">
          Discover Amazing <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD166] to-[#FFAD33]">Experiences</span>
        </h1>
        <p className="text-lg md:text-xl text-[#6B7280] max-w-2xl mx-auto">
          Book unique travel experiences across India. From desert safaris to mountain treks, create memories that last a lifetime.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6B7280] w-5 h-5" />
          <Input
            type="text"
            placeholder="Search experiences by title, location, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 text-base border-[#E5E7EB] rounded-xl shadow-sm"
          />
        </div>

        {/* Filter Toggle Button (Mobile) */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-[#6B7280]">
            {filteredExperiences.length} {filteredExperiences.length === 1 ? 'experience' : 'experiences'} found
          </p>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden border-[#E5E7EB]"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Filters */}
        <div className={`grid md:grid-cols-4 gap-4 ${showFilters ? 'grid' : 'hidden md:grid'}`}>
          <Select value={priceFilter} onValueChange={setPriceFilter}>
            <SelectTrigger className="border-[#E5E7EB] rounded-xl">
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="budget">Budget (Under ₹2,500)</SelectItem>
              <SelectItem value="mid">Mid-Range (₹2,500 - ₹4,000)</SelectItem>
              <SelectItem value="premium">Premium (₹4,000+)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="border-[#E5E7EB] rounded-xl">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map(location => (
                <SelectItem key={location} value={location}>{location}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="border-[#E5E7EB] rounded-xl">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setPriceFilter("all");
              setLocationFilter("all");
              setSortBy("default");
            }}
            className="border-[#E5E7EB] rounded-xl"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Experiences Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="w-full h-56" />
              <div className="p-6 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredExperiences.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-[#6B7280] mb-4">
            <MapPin className="w-16 h-16 mx-auto opacity-30" />
          </div>
          <h3 className="text-2xl font-semibold text-[#222222] mb-2">No experiences found</h3>
          <p className="text-[#6B7280] mb-6">Try adjusting your search or filters</p>
          <Button
            onClick={() => {
              setSearchQuery("");
              setPriceFilter("all");
              setLocationFilter("all");
              setSortBy("default");
            }}
            className="bg-[#FFD166] hover:bg-[#FFAD33] text-[#222222]"
          >
            Clear All Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExperiences.map((experience) => {
            const rating = experienceRatings[experience.id];
            const avgRating = rating ? rating.average.toFixed(1) : null;
            const reviewCount = rating ? rating.count : 0;

            return (
              <Card 
                key={experience.id} 
                className="group overflow-hidden bg-white border border-[#E5E7EB] hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={experience.image} 
                    alt={experience.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-md">
                    <span className="text-lg font-bold text-[#222222]">₹{experience.price}</span>
                  </div>
                  
                  {avgRating && (
                    <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Star className="w-4 h-4 text-[#FFD166] fill-current" />
                      <span className="text-sm font-semibold text-[#222222]">{avgRating}</span>
                      <span className="text-xs text-[#6B7280]">({reviewCount})</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-[#222222] mb-2 group-hover:text-[#FFAD33] transition-colors">
                    {experience.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-[#6B7280] mb-4">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{experience.location}</span>
                  </div>

                  <p className="text-sm text-[#6B7280] mb-6 line-clamp-2">
                    {experience.description}
                  </p>

                  <Link to={createExperienceUrl(experience.id)}>
                    <Button className="w-full bg-[#FFD166] hover:bg-[#FFAD33] text-[#222222] font-semibold rounded-xl group/btn">
                      View Details
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}