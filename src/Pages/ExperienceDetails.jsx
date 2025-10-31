import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MapPin, Clock, Calendar, ArrowLeft, Check, X, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";

export default function ExperienceDetails() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id: experienceId } = useParams();
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const { data: experience, isLoading: loadingExperience } = useQuery({
    queryKey: ['experience', experienceId],
    queryFn: async () => {
      const experiences = await base44.entities.Experience.filter({ id: experienceId });
      return experiences[0];
    },
    enabled: !!experienceId,
  });

  const { data: slots = [], isLoading: loadingSlots } = useQuery({
    queryKey: ['slots', experienceId],
    queryFn: () => base44.entities.Slot.filter({ experience_id: experienceId }, '-date'),
    enabled: !!experienceId,
    initialData: [],
  });

  const { data: reviews = [], isLoading: loadingReviews } = useQuery({
    queryKey: ['reviews', experienceId],
    queryFn: () => base44.entities.Review.filter({ experience_id: experienceId }, '-created_date'),
    enabled: !!experienceId,
    initialData: [],
  });

  const submitReviewMutation = useMutation({
    mutationFn: (reviewData) => base44.entities.Review.create(reviewData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', experienceId] });
      setShowReviewForm(false);
      setRating(0);
      setComment("");
    },
  });

  const handleBooking = () => {
    if (!selectedSlot) return;
    navigate(createPageUrl("Checkout") + `?experienceId=${experienceId}&slotId=${selectedSlot.id}`);
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }
    
    if (rating === 0) return;

    submitReviewMutation.mutate({
      experience_id: experienceId,
      user_email: user.email,
      user_name: user.full_name || user.email.split('@')[0],
      rating,
      comment,
    });
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (!experienceId) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-[#6B7280]">Experience not found</p>
        <Button onClick={() => navigate(createPageUrl("Home"))} className="mt-4">
          Back to Home
        </Button>
      </div>
    );
  }

  if (loadingExperience) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-96 w-full rounded-2xl mb-8" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-[#6B7280] mb-4">Experience not found</p>
        <Button onClick={() => navigate(createPageUrl("Home"))} className="bg-[#FFD166] hover:bg-[#FFAD33] text-[#222222]">
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Button
        variant="outline"
        onClick={() => navigate(createPageUrl("Home"))}
        className="mb-6 border-[#E5E7EB] hover:bg-[#FAFAFA]"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Experiences
      </Button>

      {/* Hero Image */}
      <div className="relative h-[400px] rounded-2xl overflow-hidden mb-8 shadow-xl">
        <img 
          src={experience.image} 
          alt={experience.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-8 left-8 flex gap-4">
          <div className="inline-block bg-[#FFD166] px-4 py-2 rounded-full">
            <span className="text-2xl font-bold text-[#222222]">₹{experience.price}</span>
          </div>
          {avgRating && (
            <div className="inline-block bg-white px-4 py-2 rounded-full flex items-center gap-2">
              <Star className="w-5 h-5 text-[#FFD166] fill-current" />
              <span className="text-xl font-bold text-[#222222]">{avgRating}</span>
              <span className="text-sm text-[#6B7280]">({reviews.length} reviews)</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-[#222222] mb-4">{experience.title}</h1>
            
            <div className="flex flex-wrap gap-4 text-[#6B7280] mb-6">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span className="text-base">{experience.location}</span>
              </div>
              {experience.duration && (
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-base">{experience.duration}</span>
                </div>
              )}
            </div>

            <p className="text-base text-[#6B7280] leading-relaxed">
              {experience.description}
            </p>
          </div>

          {/* Available Slots */}
          <div>
            <h2 className="text-2xl font-semibold text-[#222222] mb-4">Available Slots</h2>
            
            {loadingSlots ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : slots.length === 0 ? (
              <Card className="p-8 text-center border-[#E5E7EB]">
                <Calendar className="w-12 h-12 mx-auto text-[#6B7280] opacity-30 mb-3" />
                <p className="text-[#6B7280]">No slots available at the moment</p>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {slots.map((slot) => (
                  <Card
                    key={slot.id}
                    className={`p-4 cursor-pointer border-2 transition-all ${
                      !slot.available
                        ? "opacity-50 cursor-not-allowed border-[#E5E7EB] bg-gray-50"
                        : selectedSlot?.id === slot.id
                        ? "border-[#FFD166] bg-[#FFD166]/10 shadow-md"
                        : "border-[#E5E7EB] hover:border-[#FFD166] hover:shadow-md"
                    }`}
                    onClick={() => slot.available && setSelectedSlot(slot)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#6B7280]" />
                        <span className="font-medium text-[#222222]">
                          {format(new Date(slot.date), "MMM dd, yyyy")}
                        </span>
                      </div>
                      {slot.available ? (
                        <Badge className="bg-[#10B981] text-white border-0">
                          <Check className="w-3 h-3 mr-1" />
                          Available
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-400 text-white border-0">
                          <X className="w-3 h-3 mr-1" />
                          Sold Out
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[#6B7280]">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{slot.time}</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Reviews Section */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-[#222222]">
                Reviews & Ratings ({reviews.length})
              </h2>
              {user && !showReviewForm && (
                <Button
                  onClick={() => setShowReviewForm(true)}
                  className="bg-[#FFD166] hover:bg-[#FFAD33] text-[#222222] font-semibold"
                >
                  Write a Review
                </Button>
              )}
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <Card className="p-6 mb-6 border-[#E5E7EB]">
                <form onSubmit={handleSubmitReview}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[#222222] mb-2">
                      Your Rating *
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= rating
                                ? "text-[#FFD166] fill-current"
                                : "text-[#E5E7EB] fill-current"
                            } hover:text-[#FFD166] transition-colors`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[#222222] mb-2">
                      Your Review (Optional)
                    </label>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience..."
                      className="border-[#E5E7EB] h-24"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={rating === 0 || submitReviewMutation.isPending}
                      className="bg-[#FFD166] hover:bg-[#FFAD33] text-[#222222] font-semibold"
                    >
                      {submitReviewMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Review"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowReviewForm(false);
                        setRating(0);
                        setComment("");
                      }}
                      className="border-[#E5E7EB]"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Reviews List */}
            {loadingReviews ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <Card className="p-8 text-center border-[#E5E7EB]">
                <Star className="w-12 h-12 mx-auto text-[#6B7280] opacity-30 mb-3" />
                <p className="text-[#6B7280]">No reviews yet. Be the first to review!</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id} className="p-6 border-[#E5E7EB]">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12 border-2 border-[#FFD166]">
                        <AvatarFallback className="bg-[#FFD166] text-[#222222] font-semibold">
                          {review.user_name[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-[#222222]">{review.user_name}</h4>
                            <div className="flex gap-1 mt-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.rating
                                      ? "text-[#FFD166] fill-current"
                                      : "text-[#E5E7EB] fill-current"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-[#6B7280]">
                            {format(new Date(review.created_date), "MMM dd, yyyy")}
                          </span>
                        </div>
                        
                        {review.comment && (
                          <p className="text-[#6B7280] leading-relaxed">{review.comment}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-6 border-[#E5E7EB] sticky top-24">
            <h3 className="text-xl font-semibold text-[#222222] mb-4">Booking Summary</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Experience</span>
                <span className="font-medium text-[#222222]">{experience.title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Price</span>
                <span className="font-medium text-[#222222]">₹{experience.price}</span>
              </div>
              {selectedSlot && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">Date</span>
                    <span className="font-medium text-[#222222]">
                      {format(new Date(selectedSlot.date), "MMM dd, yyyy")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">Time</span>
                    <span className="font-medium text-[#222222]">{selectedSlot.time}</span>
                  </div>
                </>
              )}
            </div>

            <div className="border-t border-[#E5E7EB] pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-[#222222]">Total</span>
                <span className="text-2xl font-bold text-[#222222]">₹{experience.price}</span>
              </div>
            </div>

            <Button
              onClick={handleBooking}
              disabled={!selectedSlot}
              className="w-full bg-[#FFD166] hover:bg-[#FFAD33] text-[#222222] font-semibold py-6 text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selectedSlot ? "Book Experience" : "Select a Slot"}
            </Button>

            {!selectedSlot && (
              <p className="text-xs text-[#6B7280] text-center mt-3">
                Please select an available slot to continue
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}